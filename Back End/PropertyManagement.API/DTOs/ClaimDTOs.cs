using System.ComponentModel.DataAnnotations;
using PropertyManagement.API.Models;

namespace PropertyManagement.API.DTOs;

public record CreateClaimDto(
    [Required] int PropertyId,
    [Required, MaxLength(100)] string MaintenanceType,
    [Required, MaxLength(40)] string ServiceDate,
    [Range(0.01, 99999999.99)] decimal Amount,
    [Required, MaxLength(40)] string BankAccountNumber,
    [Required, MaxLength(100)] string BankName,
    [Required, MaxLength(100)] string BankAccountHolderName,
    [MaxLength(1000)] string? Comments,
    [MaxLength(500)] string? ReceiptUrl
);

public record UpdateClaimStatusDto(
    [Required] ClaimStatus Status
);

public record ClaimDto(
    int Id,
    int ResidentId,
    string ResidentName,
    int PropertyId,
    string PropertyName,
    string MaintenanceType,
    string ServiceDate,
    decimal Amount,
    string BankAccountNumber,
    string BankName,
    string BankAccountHolderName,
    string? Comments,
    string? ReceiptUrl,
    string? ReceiptFileName,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? ReviewedAt
);
