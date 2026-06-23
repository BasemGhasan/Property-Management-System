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
public class PropertiesController(AppDbContext db) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string CurrentRole => User.FindFirstValue(ClaimTypes.Role)!;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var query = db.Properties
            .Include(p => p.Owner)
            .Include(p => p.Requests)
            .AsQueryable();

        if (CurrentRole == "Owner")
            query = query.Where(p => p.OwnerId == CurrentUserId);
        else if (CurrentRole == "Resident")
            query = query.Where(p => p.Residents.Any(r => r.ResidentId == CurrentUserId));

        var results = await query.OrderByDescending(p => p.CreatedAt).Select(p => ToDto(p)).ToListAsync();
        return Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await db.Properties
            .Include(p => p.Owner)
            .Include(p => p.Requests)
            .Include(p => p.Residents).ThenInclude(r => r.Resident)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null) return NotFound();
        if (!CanAccess(p)) return Forbid();

        var detail = ToDto(p) with
        {
            Residents = p.Residents.Select(r => new ResidentAssignmentDto(
                r.Id, r.ResidentId, r.Resident.FullName, r.Resident.Email, r.UnitNumber, r.AssignedAt
            )).ToList()
        };

        return Ok(detail);
    }

    [HttpPost]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePropertyDto dto)
    {
        int ownerId = (CurrentRole == "Admin" && dto.OwnerId.HasValue)
            ? dto.OwnerId.Value
            : CurrentUserId;

        var property = new Property
        {
            OwnerId = ownerId,
            Name = dto.Name,
            Address = dto.Address,
            UnitCount = dto.UnitCount
        };

        db.Properties.Add(property);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = property.Id }, ToDto(property));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePropertyDto dto)
    {
        var property = await db.Properties.FindAsync(id);
        if (property == null) return NotFound();
        if (CurrentRole == "Owner" && property.OwnerId != CurrentUserId) return Forbid();

        if (dto.Name != null) property.Name = dto.Name;
        if (dto.Address != null) property.Address = dto.Address;
        if (dto.UnitCount.HasValue) property.UnitCount = dto.UnitCount.Value;
        if (dto.OwnerId.HasValue && CurrentRole == "Admin") property.OwnerId = dto.OwnerId.Value;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var property = await db.Properties.FindAsync(id);
        if (property == null) return NotFound();

        property.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/residents")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> AssignResident(int id, [FromBody] AssignResidentDto dto)
    {
        var property = await db.Properties.FindAsync(id);
        if (property == null) return NotFound();
        if (CurrentRole == "Owner" && property.OwnerId != CurrentUserId) return Forbid();

        var resident = await db.Users.FirstOrDefaultAsync(u => u.Id == dto.ResidentId && u.Role == UserRole.Resident);
        if (resident == null) return BadRequest(new { message = "Resident not found." });

        var existing = await db.PropertyResidents
            .AnyAsync(pr => pr.PropertyId == id && pr.ResidentId == dto.ResidentId);
        if (existing) return Conflict(new { message = "Resident already assigned to this property." });

        db.PropertyResidents.Add(new PropertyResident
        {
            PropertyId = id,
            ResidentId = dto.ResidentId,
            UnitNumber = dto.UnitNumber
        });

        await db.SaveChangesAsync();
        return Ok(new { message = "Resident assigned successfully." });
    }

    [HttpDelete("{id}/residents/{residentId}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> RemoveResident(int id, int residentId)
    {
        var property = await db.Properties.FindAsync(id);
        if (property == null) return NotFound();
        if (CurrentRole == "Owner" && property.OwnerId != CurrentUserId) return Forbid();

        var assignment = await db.PropertyResidents
            .FirstOrDefaultAsync(pr => pr.PropertyId == id && pr.ResidentId == residentId);
        if (assignment == null) return NotFound();

        db.PropertyResidents.Remove(assignment);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private bool CanAccess(Property p) =>
        CurrentRole == "Admin" ||
        (CurrentRole == "Owner" && p.OwnerId == CurrentUserId) ||
        (CurrentRole == "Resident" && p.Residents.Any(r => r.ResidentId == CurrentUserId));

    private static PropertyDto ToDto(Property p) => new(
        p.Id,
        p.OwnerId,
        p.Owner?.FullName ?? string.Empty,
        p.Name,
        p.Address,
        p.UnitCount,
        p.IsActive,
        p.CreatedAt,
        p.Requests?.Count ?? 0,
        p.Requests?.Count(r => r.Status == RequestStatus.Pending || r.Status == RequestStatus.InProgress) ?? 0
    );
}
