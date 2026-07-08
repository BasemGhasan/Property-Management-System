using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.API.DTOs;

public record CreatePropertyUnitDto(
    [Required, MaxLength(50)] string UnitIdentifier,
    [Required, Range(0, 50)] int Bedrooms = 0,
    [Required, Range(0, 50)] int Bathrooms = 0,
    [Required, Range(0.01, double.MaxValue, ErrorMessage = "Rent must be greater than 0.")] decimal MonthlyRent = 0
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
    [Required, Range(1, int.MaxValue)] int UnitCount = 1,
    int? OwnerId = null,
    [MaxLength(1000)] string Description = "",
    List<string>? Amenities = null,
    List<CreatePropertyUnitDto>? Units = null
) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Units == null || Units.Count != UnitCount)
        {
            yield return new ValidationResult(
                $"The number of configured units ({Units?.Count ?? 0}) must exactly match the UnitCount ({UnitCount}).",
                [nameof(Units)]
            );
        }
    }
}

public record UpdatePropertyDto(
    [MaxLength(150)] string? Name,
    [MaxLength(300)] string? Address,
    [Range(1, int.MaxValue)] int? UnitCount,
    int? OwnerId,
    [MaxLength(1000)] string? Description,
    List<string>? Amenities,
    List<CreatePropertyUnitDto>? Units = null
) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Units != null && UnitCount.HasValue && Units.Count != UnitCount.Value)
        {
            yield return new ValidationResult(
                $"The number of configured units ({Units.Count}) must exactly match the updated UnitCount ({UnitCount.Value}).",
                [nameof(Units)]
            );
        }
    }
}

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
