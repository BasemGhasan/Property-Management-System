using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.API.Models;

public enum ClaimStatus { Pending, Approved, Rejected }

public class MaintenanceClaim
{
    [Key]
    public int Id { get; set; }

    public int ResidentId { get; set; }
    public int PropertyId { get; set; }

    [Required, MaxLength(100)]
    public string MaintenanceType { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string ServiceDate { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Required, MaxLength(40)]
    public string BankAccountNumber { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string BankName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string BankAccountHolderName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Comments { get; set; }

    [MaxLength(500)]
    public string? ReceiptUrl { get; set; }

    [MaxLength(200)]
    public string? ReceiptFileName { get; set; }

    public ClaimStatus Status { get; set; } = ClaimStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public User Resident { get; set; } = null!;

    [ForeignKey(nameof(PropertyId))]
    public Property Property { get; set; } = null!;
}
