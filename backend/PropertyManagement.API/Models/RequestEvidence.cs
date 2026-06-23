using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.API.Models;

public class RequestEvidence
{
    [Key]
    public int Id { get; set; }

    public int RequestId { get; set; }

    [Required, MaxLength(500)]
    public string FileUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? FileName { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(RequestId))]
    public MaintenanceRequest Request { get; set; } = null!;
}
