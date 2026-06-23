using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PropertyManagement.API.Data;
using PropertyManagement.API.DTOs;
using PropertyManagement.API.Models;

namespace PropertyManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
{
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

        await db.SaveChangesAsync();
        return Ok(ToDto(user));
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

    private static UserDto ToDto(User u) =>
        new(u.Id, u.FullName, u.Email, u.Role.ToString(), u.Phone, u.IsActive, u.CreatedAt);
}

public record UpdateProfileDto(
    string? FullName,
    string? Phone
);
