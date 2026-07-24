using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.API.Models;

public class PropertyUnit
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int PropertyId { get; set; }

    [Required, MaxLength(50)]
    public string UnitIdentifier { get; set; } = string.Empty;

    public int Bedrooms { get; set; }

    public int Bathrooms { get; set; }

    public decimal MonthlyRent { get; set; }

    [ForeignKey(nameof(PropertyId))]
    public Property Property { get; set; } = null!;
}
