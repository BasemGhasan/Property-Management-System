using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.API.DTOs;

public record CreatePropertyDto(
    [Required, MaxLength(150)] string Name,
    [Required, MaxLength(300)] string Address,
    int UnitCount = 1,
    int? OwnerId = null
);

public record UpdatePropertyDto(
    [MaxLength(150)] string? Name,
    [MaxLength(300)] string? Address,
    int? UnitCount,
    int? OwnerId
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
    int OpenRequests
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
