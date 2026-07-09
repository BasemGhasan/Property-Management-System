using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
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
public class AuthController(AppDbContext db, IConfiguration config, EmailService emailService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Ok(new AuthResponse(false, "Invalid email or password."));

        var token = GenerateToken(user);
        return Ok(new AuthResponse(true, "Signed in successfully.", token, ToDto(user)));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new AuthResponse(false, "An account with this email already exists."));

        // Prevent self-registering as Admin
        if (req.Role == UserRole.Admin)
            return BadRequest(new AuthResponse(false, "Admin accounts cannot be self-registered."));

        var user = new User
        {
            FullName = req.FullName,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = req.Role,
            Phone = req.Phone
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        if (req.Role == UserRole.Owner && req.Properties != null)
        {
            foreach (var name in req.Properties.Where(p => !string.IsNullOrWhiteSpace(p)))
            {
                db.Properties.Add(new Property
                {
                    OwnerId = user.Id,
                    Name = name.Trim(),
                    Address = string.Empty
                });
            }
            await db.SaveChangesAsync();
        }

        var code = GenerateOtp();
        user.EmailVerificationCodeHash = HashToken(code);
        user.EmailVerificationExpiresAt = DateTime.UtcNow.AddMinutes(EmailVerificationExpiryMinutes);
        await db.SaveChangesAsync();
        await emailService.SendVerificationEmailAsync(user.FullName, user.Email, code, EmailVerificationExpiryMinutes);

        var token = GenerateToken(user);
        return Ok(new AuthResponse(true, $"{req.FullName}, your account has been created.", token, ToDto(user)));
    }

    private const int ResetTokenExpiryMinutes = 5;
    private const int EmailVerificationExpiryMinutes = 10;

    private static string GenerateOtp() => Random.Shared.Next(0, 1_000_000).ToString("D6");

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.IsActive);
        if (user != null)
        {
            var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            user.ResetTokenHash = HashToken(rawToken);
            user.ResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(ResetTokenExpiryMinutes);
            await db.SaveChangesAsync();

            var frontendUrl = (config["FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var resetLink = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(rawToken)}";
            await emailService.SendPasswordResetEmailAsync(user.FullName, user.Email, resetLink, ResetTokenExpiryMinutes);
        }

        // Same response whether or not the account exists, so we don't leak which emails are registered.
        return Ok(new { success = true, message = $"If an account exists for {req.Email}, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var tokenHash = HashToken(req.Token);
        var user = await db.Users.FirstOrDefaultAsync(u =>
            u.ResetTokenHash == tokenHash && u.ResetTokenExpiresAt > DateTime.UtcNow);

        if (user == null)
            return BadRequest(new AuthResponse(false, "This reset link is invalid or has expired."));

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.ResetTokenHash = null;
        user.ResetTokenExpiresAt = null;
        await db.SaveChangesAsync();

        return Ok(new AuthResponse(true, "Password updated. You can now sign in."));
    }

    private static string HashToken(string rawToken) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.FullName, u.Email, u.Role.ToString(), u.Phone, u.IsActive, u.CreatedAt, u.EmailVerified, u.EmailNotificationsEnabled);
}
