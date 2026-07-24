using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PropertyManagement.API.DTOs.Assistant;

namespace PropertyManagement.API.Services
{
    public class GeminiAssistantService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GeminiAssistantService> _logger;

        private const string SystemInstruction = @"You are Property Management Intelligence — an AI-powered assistant for a property management system.

PERSONALITY:
You are a sharp, strategic property manager and real estate assistant. You help users search for properties, analyze investments, manage maintenance requests, and handle tenant inquiries. Be concise but insightful.

OUTPUT FORMAT:
You must respond with a JSON object using this schema:
{
  ""intent"": ""search"" | ""analyze"" | ""maintenance"" | ""tenant"" | ""chat"",
  ""query"": ""refined search query or summary of the request"" | null,
  ""reply"": ""conversational response to the user"",
  ""extractedData"": { ""key"": ""value"" } | null
}

SCOPE GUARDRAILS (CRITICAL):
- Only answer within capabilities: property search, market/investment analysis, maintenance ticketing, tenant info.
- If asked about anything outside scope, respond with intent=""chat"" and a short limitation note.
- Output MUST be valid JSON. Do not wrap in markdown tags like ```json. Just raw JSON.

INTENT RULES:
1. SEARCH — User wants to find/see/locate properties or listings.
2. ANALYZE — User wants investment analysis, rent estimates, or market evaluation for a property.
3. MAINTENANCE — User wants to report an issue or request maintenance. Extract 'issue' and 'unit' (if available) into extractedData.
4. TENANT — User wants to check tenant details, leases, or rent payments.
5. CHAT — User is chatting, thanking, or asking general questions.
";

        public GeminiAssistantService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiAssistantService> logger)
        {
            _httpClient = httpClient;
            _apiKey = (configuration["GEMINI_API_KEY"] ?? "").Trim();
            _logger = logger;
        }

        public async Task<ChatResponseDto> ProcessChatAsync(ChatRequestDto request)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("Gemini API Key is not configured.");
                return new ChatResponseDto
                {
                    Intent = "chat",
                    Reply = "Error: AI Assistant is not fully configured."
                };
            }

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            var contents = new List<object>();

            // Add history
            foreach (var item in request.History)
            {
                contents.Add(new
                {
                    role = item.Role == "user" ? "user" : "model",
                    parts = new[] { new { text = item.Content } }
                });
            }

            // Build context message
            var contextMessage = request.Message;
            if (request.Context != null)
            {
                var contextStr = JsonSerializer.Serialize(request.Context);
                contextMessage += $"\n\n[Property Context: {contextStr}]";
            }

            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = contextMessage } }
            });

            var payload = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = SystemInstruction } }
                },
                contents = contents,
                generationConfig = new
                {
                    responseMimeType = "application/json"
                }
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(url, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Gemini API Error: {response.StatusCode} - {errorBody}");
                    throw new Exception($"Gemini API Error: {response.StatusCode}");
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                
                using var document = JsonDocument.Parse(responseJson);
                var textResponse = document.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text").GetString();

                if (string.IsNullOrEmpty(textResponse))
                {
                    throw new Exception("Empty response text from Gemini");
                }

                var result = JsonSerializer.Deserialize<ChatResponseDto>(textResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result ?? new ChatResponseDto { Intent = "chat", Reply = "I encountered an issue parsing the response." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat with Gemini API.");
                return new ChatResponseDto
                {
                    Intent = "chat",
                    Reply = $"I apologize, but I encountered an error processing your request. Dev Error Details: {ex.Message}"
                };
            }
        }
    }
}
