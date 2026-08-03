using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using PropertyManagement.API.Data;
using PropertyManagement.API.DTOs;
using PropertyManagement.API.Models;
using PropertyManagement.API.Services;

namespace PropertyManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(AppDbContext db, EmailService emailService) : ControllerBase
{
    private const int EmailVerificationExpiryMinutes = 10;

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] string? role)
    {
        var query = db.Users.AsQueryable();

        if (role != null && Enum.TryParse<UserRole>(role, true, out var r))
            query = query.Where(u => u.Role == r);

        var users = await query.OrderByDescending(u => u.CreatedAt).Select(u => ToDto(u)).ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(ToDto(user));
    }

    [HttpGet("residents")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<IActionResult> GetResidents()
    {
        var users = await db.Users
            .Where(u => u.Role == UserRole.Resident && u.IsActive)
            .OrderBy(u => u.FullName)
            .Select(u => ToDto(u))
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();
        return Ok(ToDto(user));
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto dto)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.Email != null)
        {
            var newEmail = dto.Email.Trim().ToLowerInvariant();
            if (newEmail != user.Email)
            {
                if (await db.Users.AnyAsync(u => u.Email == newEmail && u.Id != CurrentUserId))
                    return BadRequest(new { message = "Email is already in use." });

                user.Email = newEmail;
                user.EmailVerified = false;
            }
        }
        if (dto.EmailNotificationsEnabled.HasValue) user.EmailNotificationsEnabled = dto.EmailNotificationsEnabled.Value;

        await db.SaveChangesAsync();
        return Ok(ToDto(user));
    }

    [HttpPut("me/verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();
        if (user.EmailVerified) return Ok(ToDto(user));

        if (user.EmailVerificationCodeHash != HashCode(dto.Code) || user.EmailVerificationExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "That code is invalid or has expired." });

        user.EmailVerified = true;
        user.EmailVerificationCodeHash = null;
        user.EmailVerificationExpiresAt = null;
        await db.SaveChangesAsync();

        return Ok(ToDto(user));
    }

    [HttpPost("me/resend-verification")]
    public async Task<IActionResult> ResendVerification()
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();
        if (user.EmailVerified) return Ok(new { message = "Your email is already verified." });

        var code = GenerateOtp();
        user.EmailVerificationCodeHash = HashCode(code);
        user.EmailVerificationExpiresAt = DateTime.UtcNow.AddMinutes(EmailVerificationExpiryMinutes);
        await db.SaveChangesAsync();
        await emailService.SendVerificationEmailAsync(user.FullName, user.Email, code, EmailVerificationExpiryMinutes);

        return Ok(new { message = "A new verification code has been sent to your email." });
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await db.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully." });
    }

    [HttpPut("{id}/toggle-active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();
        if (user.Role == UserRole.Admin) return BadRequest(new { message = "Cannot deactivate an admin account." });

        user.IsActive = !user.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { isActive = user.IsActive });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();
        if (user.Role == UserRole.Admin) return BadRequest(new { message = "Cannot delete an admin account." });

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static string GenerateOtp() => Random.Shared.Next(0, 1_000_000).ToString("D6");

    private static string HashCode(string rawCode) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawCode)));

    private static UserDto ToDto(User u) =>
        new(u.Id, u.FullName, u.Email, u.Role.ToString(), u.Phone, u.IsActive, u.CreatedAt, u.EmailVerified, u.EmailNotificationsEnabled);
}

public record UpdateProfileDto(
    string? FullName,
    string? Email,
    string? Phone,
    bool? EmailNotificationsEnabled
);

public record ChangePasswordDto(
    [Required] string CurrentPassword,
    [Required, MinLength(6)] string NewPassword
);

public record VerifyEmailDto(
    [Required, StringLength(6, MinimumLength = 6)] string Code
);
