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
public class RequestsController(AppDbContext db) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string CurrentRole => User.FindFirstValue(ClaimTypes.Role)!;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? priority)
    {
        var query = db.MaintenanceRequests
            .Include(r => r.Resident)
            .Include(r => r.Property)
            .Include(r => r.Category)
            .Include(r => r.Evidence)
            .AsQueryable();

        // Scope by role
        if (CurrentRole == "Resident")
            query = query.Where(r => r.ResidentId == CurrentUserId);
        else if (CurrentRole == "Owner")
            query = query.Where(r => r.Property.OwnerId == CurrentUserId);
        // Admin sees all

        if (status != null && Enum.TryParse<RequestStatus>(status, true, out var s))
            query = query.Where(r => r.Status == s);

        if (priority != null && Enum.TryParse<RequestPriority>(priority, true, out var p))
            query = query.Where(r => r.Priority == p);

        var results = await query.OrderByDescending(r => r.CreatedAt).Select(r => ToDto(r)).ToListAsync();
        return Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await db.MaintenanceRequests
            .Include(r => r.Resident)
            .Include(r => r.Property)
            .Include(r => r.Category)
            .Include(r => r.Evidence)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (r == null) return NotFound();
        if (!CanAccess(r)) return Forbid();

        return Ok(ToDto(r));
    }

    [HttpPost]
    [Authorize(Roles = "Resident,Owner")]
    public async Task<IActionResult> Create([FromBody] CreateRequestDto dto)
    {
        // Verify the caller has a relationship to the property: residents must be
        // assigned to it, owners must own it.
        var allowed = CurrentRole == "Owner"
            ? await db.Properties.AnyAsync(p => p.Id == dto.PropertyId && p.OwnerId == CurrentUserId)
            : await db.PropertyResidents.AnyAsync(pr => pr.PropertyId == dto.PropertyId && pr.ResidentId == CurrentUserId);

        if (!allowed)
            return Forbid();

        var request = new MaintenanceRequest
        {
            ResidentId = CurrentUserId,
            PropertyId = dto.PropertyId,
            CategoryId = dto.CategoryId,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority
        };

        db.MaintenanceRequests.Add(request);
        await db.SaveChangesAsync();

        if (dto.PhotoUrls?.Count > 0)
        {
            foreach (var url in dto.PhotoUrls)
            {
                db.RequestEvidence.Add(new RequestEvidence
                {
                    RequestId = request.Id,
                    FileUrl = url,
                    FileName = Path.GetFileName(new Uri(url).LocalPath)
                });
            }
            await db.SaveChangesAsync();
        }

        var created = await db.MaintenanceRequests
            .Include(r => r.Resident)
            .Include(r => r.Property)
            .Include(r => r.Category)
            .Include(r => r.Evidence)
            .FirstAsync(r => r.Id == request.Id);

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, ToDto(created));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateRequestStatusDto dto)
    {
        var request = await db.MaintenanceRequests
            .Include(r => r.Property)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null) return NotFound();

        if (CurrentRole == "Owner" && request.Property.OwnerId != CurrentUserId)
            return Forbid();

        request.Status = dto.Status;
        request.OwnerNotes = dto.OwnerNotes;
        request.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var request = await db.MaintenanceRequests.FindAsync(id);
        if (request == null) return NotFound();

        db.MaintenanceRequests.Remove(request);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private bool CanAccess(MaintenanceRequest r) =>
        CurrentRole == "Admin" ||
        (CurrentRole == "Resident" && r.ResidentId == CurrentUserId) ||
        (CurrentRole == "Owner" && r.Property.OwnerId == CurrentUserId);

    private static RequestDto ToDto(MaintenanceRequest r) => new(
        r.Id,
        r.ResidentId,
        r.Resident.FullName,
        r.PropertyId,
        r.Property.Name,
        r.CategoryId,
        r.Category.Name,
        r.Title,
        r.Description,
        r.Priority.ToString(),
        r.Status.ToString(),
        r.OwnerNotes,
        r.CreatedAt,
        r.UpdatedAt,
        r.Evidence.Select(e => new EvidenceDto(e.Id, e.FileUrl, e.FileName, e.UploadedAt)).ToList()
    );
}
