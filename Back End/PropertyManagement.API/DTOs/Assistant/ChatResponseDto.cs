using System.Collections.Generic;

namespace PropertyManagement.API.DTOs.Assistant
{
    public class ChatResponseDto
    {
        public string Intent { get; set; } = string.Empty; // "search", "analyze", "maintenance", "tenant", "chat"
        public string? Query { get; set; }
        public string Reply { get; set; } = string.Empty;
        public Dictionary<string, string>? ExtractedData { get; set; }
    }
}
