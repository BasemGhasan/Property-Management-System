using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.API.DTOs;

public record CreatePropertyUnitDto(
    [Required, MaxLength(50)] string UnitIdentifier,
    [Range(0, 50)] int Bedrooms = 0,
    [Range(0, 50)] int Bathrooms = 0,
    [Range(0, double.MaxValue, ErrorMessage = "Rent must be greater than or equal to 0.")] decimal MonthlyRent = 0
);

public record PropertyUnitDto(
    int Id,
    string UnitIdentifier,
    int Bedrooms,
    int Bathrooms,
    decimal MonthlyRent
);

public record CreatePropertyDto(
    [Required, MaxLength(150)] string Name,
    [Required, MaxLength(300)] string Address,
    int? OwnerId = null,
    [MaxLength(1000)] string Description = "",
    List<string>? Amenities = null,
    List<CreatePropertyUnitDto>? Units = null
);

public record UpdatePropertyDto(
    [MaxLength(150)] string? Name,
    [MaxLength(300)] string? Address,
    int? OwnerId,
    [MaxLength(1000)] string? Description,
    List<string>? Amenities
);

public record PropertyDto(
    int Id,
    int OwnerId,
    string OwnerName,
    string Name,
    string Address,
    int UnitCount,
    bool IsActive,
    DateTime CreatedAt,
    int TotalRequests,
    int OpenRequests,
    string Description,
    List<string> Amenities,
    List<PropertyUnitDto> Units,
    decimal TotalMonthlyRent
)
{
    public List<ResidentAssignmentDto> Residents { get; init; } = [];

    // Unit number for the requesting resident, when the caller is a Resident assigned to this property.
    public string? MyUnitNumber { get; init; }
};

public record AssignResidentDto(
    [Required] int ResidentId,
    [MaxLength(20)] string? UnitNumber
);

public record ResidentAssignmentDto(
    int Id,
    int ResidentId,
    string ResidentName,
    string ResidentEmail,
    string? UnitNumber,
    DateTime AssignedAt
);
