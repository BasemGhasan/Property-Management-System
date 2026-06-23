using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.API.Models;

public enum RequestStatus { Pending, InProgress, Resolved, Rejected }
public enum RequestPriority { Low, Medium, High, Urgent }

public class MaintenanceRequest
{
    [Key]
    public int Id { get; set; }

    public int ResidentId { get; set; }
    public int PropertyId { get; set; }
    public int CategoryId { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public RequestPriority Priority { get; set; } = RequestPriority.Medium;
    public RequestStatus Status { get; set; } = RequestStatus.Pending;

    [MaxLength(1000)]
    public string? OwnerNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(ResidentId))]
    public User Resident { get; set; } = null!;

    [ForeignKey(nameof(PropertyId))]
    public Property Property { get; set; } = null!;

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;

    public ICollection<RequestEvidence> Evidence { get; set; } = [];
}
