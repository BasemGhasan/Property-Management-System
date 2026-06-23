using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.API.Models;

public enum UserRole { Admin, Owner, Resident }

public class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Property> OwnedProperties { get; set; } = [];
    public ICollection<PropertyResident> ResidentProperties { get; set; } = [];
    public ICollection<MaintenanceRequest> SubmittedRequests { get; set; } = [];
}
