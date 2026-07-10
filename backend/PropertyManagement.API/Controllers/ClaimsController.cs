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
public class ClaimsController(AppDbContext db) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string CurrentRole => User.FindFirstValue(ClaimTypes.Role)!;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = db.MaintenanceClaims
            .Include(c => c.Resident)
            .Include(c => c.Property)
            .AsQueryable();

        if (CurrentRole == "Resident")
            query = query.Where(c => c.ResidentId == CurrentUserId);
        else if (CurrentRole == "Owner")
            query = query.Where(c => c.Property.OwnerId == CurrentUserId);

        if (status != null && Enum.TryParse<ClaimStatus>(status, true, out var parsedStatus))
            query = query.Where(c => c.Status == parsedStatus);

        var claims = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => ToDto(c))
            .ToListAsync();

        return Ok(claims);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var claim = await db.MaintenanceClaims
            .Include(c => c.Resident)
            .Include(c => c.Property)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (claim == null) return NotFound();
        if (!CanAccess(claim)) return Forbid();

        return Ok(ToDto(claim));
    }

    [HttpPost]
    [Authorize(Roles = "Resident")]
    public async Task<IActionResult> Create([FromBody] CreateClaimDto dto)
    {
        var assigned = await db.PropertyResidents
            .AnyAsync(pr => pr.PropertyId == dto.PropertyId && pr.ResidentId == CurrentUserId);

        if (!assigned)
            return Forbid();

        var receiptFileName = string.IsNullOrWhiteSpace(dto.ReceiptUrl)
            ? null
            : Path.GetFileName(new Uri(dto.ReceiptUrl).LocalPath);

        var claim = new MaintenanceClaim
        {
            ResidentId = CurrentUserId,
            PropertyId = dto.PropertyId,
            MaintenanceType = dto.MaintenanceType.Trim(),
            ServiceDate = dto.ServiceDate.Trim(),
            Amount = dto.Amount,
            BankAccountNumber = dto.BankAccountNumber.Trim(),
            BankName = dto.BankName.Trim(),
            BankAccountHolderName = dto.BankAccountHolderName.Trim(),
            Comments = string.IsNullOrWhiteSpace(dto.Comments) ? null : dto.Comments.Trim(),
            ReceiptUrl = string.IsNullOrWhiteSpace(dto.ReceiptUrl) ? null : dto.ReceiptUrl.Trim(),
            ReceiptFileName = receiptFileName
        };

        db.MaintenanceClaims.Add(claim);
        await db.SaveChangesAsync();

        var created = await db.MaintenanceClaims
            .Include(c => c.Resident)
            .Include(c => c.Property)
            .FirstAsync(c => c.Id == claim.Id);

        return CreatedAtAction(nameof(GetById), new { id = claim.Id }, ToDto(created));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateClaimStatusDto dto)
    {
        if (dto.Status == ClaimStatus.Pending)
            return BadRequest(new { message = "Claims can only be approved or rejected from this action." });

        var claim = await db.MaintenanceClaims
            .Include(c => c.Property)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (claim == null) return NotFound();
        if (CurrentRole == "Owner" && claim.Property.OwnerId != CurrentUserId) return Forbid();

        claim.Status = dto.Status;
        claim.UpdatedAt = DateTime.UtcNow;
        claim.ReviewedAt = DateTime.UtcNow;

        if (claim.ResidentId != CurrentUserId)
        {
            var message = claim.Status == ClaimStatus.Approved
                ? $"Your {claim.MaintenanceType} claim for RM{claim.Amount:0.00} was approved."
                : $"Your {claim.MaintenanceType} claim for RM{claim.Amount:0.00} was rejected.";

            db.Notifications.Add(new Notification
            {
                UserId = claim.ResidentId,
                Type = claim.Status == ClaimStatus.Approved ? NotificationType.Completed : NotificationType.StatusChanged,
                Message = message
            });
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    private bool CanAccess(MaintenanceClaim claim) =>
        CurrentRole == "Admin" ||
        (CurrentRole == "Resident" && claim.ResidentId == CurrentUserId) ||
        (CurrentRole == "Owner" && claim.Property.OwnerId == CurrentUserId);

    private static ClaimDto ToDto(MaintenanceClaim claim) => new(
        claim.Id,
        claim.ResidentId,
        claim.Resident.FullName,
        claim.PropertyId,
        claim.Property.Name,
        claim.MaintenanceType,
        claim.ServiceDate,
        claim.Amount,
        claim.BankAccountNumber,
        claim.BankName,
        claim.BankAccountHolderName,
        claim.Comments,
        claim.ReceiptUrl,
        claim.ReceiptFileName,
        claim.Status.ToString(),
        claim.CreatedAt,
        claim.UpdatedAt,
        claim.ReviewedAt
    );
}
