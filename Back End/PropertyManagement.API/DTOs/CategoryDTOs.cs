using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.API.DTOs;

public record CreateCategoryDto(
    [Required, MaxLength(100)] string Name,
    [MaxLength(300)] string? Description
);

public record UpdateCategoryDto(
    [MaxLength(100)] string? Name,
    [MaxLength(300)] string? Description,
    bool? IsActive
);

public record CategoryDto(
    int Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt
);
