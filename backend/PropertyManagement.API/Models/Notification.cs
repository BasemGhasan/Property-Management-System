using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.API.Models;

public enum NotificationType { Reviewed, StatusChanged, Completed, Info }

public class Notification
{
    [Key]
    public int Id { get; set; }

    public int UserId { get; set; }

    public NotificationType Type { get; set; }

    [Required, MaxLength(300)]
    public string Message { get; set; } = string.Empty;

    public int? RequestId { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
