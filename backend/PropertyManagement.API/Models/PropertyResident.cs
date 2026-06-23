using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.API.Models;

public class PropertyResident
{
    [Key]
    public int Id { get; set; }

    public int PropertyId { get; set; }
    public int ResidentId { get; set; }

    [MaxLength(20)]
    public string? UnitNumber { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(PropertyId))]
    public Property Property { get; set; } = null!;

    [ForeignKey(nameof(ResidentId))]
    public User Resident { get; set; } = null!;
}
