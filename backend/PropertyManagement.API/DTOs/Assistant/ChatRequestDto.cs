using System.Collections.Generic;

namespace PropertyManagement.API.DTOs.Assistant
{
    public class ChatRequestDto
    {
        public string Message { get; set; } = string.Empty;
        public List<ChatHistoryItemDto> History { get; set; } = new();
        public PropertyContextDto? Context { get; set; }
    }

    public class ChatHistoryItemDto
    {
        public string Role { get; set; } = string.Empty; // "user" or "model"
        public string Content { get; set; } = string.Empty;
    }

    public class PropertyContextDto
    {
        public int? PropertyId { get; set; }
        public string? PropertyName { get; set; }
        public string? CurrentView { get; set; } // e.g., "Dashboard", "ListingDetails"
    }
}
