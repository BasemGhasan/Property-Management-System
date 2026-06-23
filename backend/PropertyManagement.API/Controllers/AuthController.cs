using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PropertyManagement.API.Data;
using PropertyManagement.API.DTOs;
using PropertyManagement.API.Models;

namespace PropertyManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
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

        var token = GenerateToken(user);
        return Ok(new AuthResponse(true, $"{req.FullName}, your account has been created.", token, ToDto(user)));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        // In production: generate a reset token, store it, email it via SES/SNS.
        // For now just confirm the email exists without leaking whether it does.
        await db.Users.AnyAsync(u => u.Email == req.Email);
        return Ok(new { success = true, message = $"If an account exists for {req.Email}, a reset link has been sent." });
    }

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
        new(u.Id, u.FullName, u.Email, u.Role.ToString(), u.Phone, u.IsActive, u.CreatedAt);
}
