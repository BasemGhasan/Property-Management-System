using System.ComponentModel.DataAnnotations;
using PropertyManagement.API.Models;

namespace PropertyManagement.API.DTOs;

public record CreateRequestDto(
    [Required] int PropertyId,
    [Required] int CategoryId,
    [Required, MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description,
    RequestPriority Priority = RequestPriority.Medium,
    List<string>? PhotoUrls = null
);

public record UpdateRequestStatusDto(
    [Required] RequestStatus Status,
    [MaxLength(1000)] string? OwnerNotes
);

public record RequestDto(
    int Id,
    int ResidentId,
    string ResidentName,
    int PropertyId,
    string PropertyName,
    int CategoryId,
    string CategoryName,
    string Title,
    string? Description,
    string Priority,
    string Status,
    string? OwnerNotes,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<EvidenceDto> Evidence
);

public record EvidenceDto(int Id, string FileUrl, string? FileName, DateTime UploadedAt);
