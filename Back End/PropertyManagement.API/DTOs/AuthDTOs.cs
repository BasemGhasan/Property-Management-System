using System.ComponentModel.DataAnnotations;
using PropertyManagement.API.Models;

namespace PropertyManagement.API.DTOs;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    bool RememberMe = false
);

public record RegisterRequest(
    [Required] UserRole Role,
    [Required, MaxLength(100)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [MaxLength(20)] string? Phone,
    List<string>? Properties = null
);

public record ForgotPasswordRequest([Required, EmailAddress] string Email);

public record ResetPasswordRequest(
    [Required] string Token,
    [Required, MinLength(6)] string NewPassword
);

public record AuthResponse(
    bool Success,
    string Message,
    string? Token = null,
    UserDto? User = null
);

public record UserDto(
    int Id,
    string FullName,
    string Email,
    string Role,
    string? Phone,
    bool IsActive,
    DateTime CreatedAt,
    bool EmailVerified,
    bool EmailNotificationsEnabled
);
