using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.API.Models;

public class Property
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OwnerId { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Address { get; set; } = string.Empty;

    public int UnitCount { get; set; } = 1;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    // Navigation
    [ForeignKey(nameof(OwnerId))]
    public User Owner { get; set; } = null!;

    public ICollection<PropertyUnit> Units { get; set; } = [];
    public ICollection<PropertyResident> Residents { get; set; } = [];
    public ICollection<MaintenanceRequest> Requests { get; set; } = [];
}
