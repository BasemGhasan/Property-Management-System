namespace PropertyManagement.API.DTOs;

public record NotificationDto(
    int Id,
    string Type,
    string Message,
    int? RequestId,
    bool IsRead,
    DateTime CreatedAt
);
