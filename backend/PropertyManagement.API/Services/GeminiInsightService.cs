using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PropertyManagement.API.DTOs.Insights;

namespace PropertyManagement.API.Services;

/// <summary>
/// Turns an owner's income/deduction chart series into a short trend read plus
/// actionable suggestions, via the Gemini generateContent API.
/// </summary>
public class GeminiInsightService(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<GeminiInsightService> logger)
{
    private const int MaxAttempts = 3;
    private static readonly TimeSpan BaseDelay = TimeSpan.FromMilliseconds(600);

    private readonly string _apiKey = configuration["GEMINI_API_KEY"] ?? "";

    // gemini-2.5-flash-lite is retired for new API keys (404 "no longer available to
    // new users"), so it cannot be the default. Override with Gemini:InsightModel.
    private readonly string _model = configuration["Gemini:InsightModel"] ?? "gemini-3.1-flash-lite";

    private const string SystemInstruction = @"You are an expert property portfolio analyst advising a landlord.

You are given the data behind one chart on the owner's analytics dashboard. Each point may carry
income (rent from occupied units), deductions (approved maintenance claims charged against rent),
and net (income minus deductions).

The prompt states the SERIES KIND. Obey it exactly:

- TIME_SERIES — points are consecutive months, oldest first.
  Lead with the most recent month and state its value. Quantify the change versus the prior month and
  versus the start of the series as percentages. Name the trend: rising, falling, flat, or volatile,
  and say whether it is healthy or concerning for a landlord.

- CATEGORY — points are independent items (properties or units). They have NO time order.
  Never use the words 'recent', 'trend', 'rising', 'falling', or 'volatile'. Nothing here changes over time.
  Instead: compare the items, name the strongest and weakest by net, and quantify the gap. Call out any
  item running at a loss and any vacancy dragging the portfolio down.

RULES (both kinds):
- If deductions are eating an unusual share of income, call that out.
- Ground every number in the data given. Never invent figures, months, properties, or units.
- If there is only one point, say so plainly and describe just that point. Do not compare or trend.
- Keep the insight to 2-3 sentences. No preamble, no markdown, no bullet characters.

SUGGESTIONS:
- Return 2 to 3 short, concrete, actionable suggestions the owner could act on this week.
- Each suggestion must be under 120 characters and directly implied by the data.
- If the data is too sparse to justify a suggestion, return fewer suggestions rather than padding.

OUTPUT FORMAT:
Respond with raw JSON only. No markdown fences.
{ ""insight"": ""string"", ""suggestions"": [""string"", ""string""] }";

    public async Task<FinancialInsightResponseDto> GenerateInsightAsync(FinancialInsightRequestDto request)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            logger.LogError("Gemini API key is not configured; cannot generate financial insight.");
            throw new InvalidOperationException("AI insights are not configured on this server.");
        }

        var prompt = BuildPrompt(request);

        var payload = new
        {
            system_instruction = new { parts = new[] { new { text = SystemInstruction } } },
            contents = new[]
            {
                new { role = "user", parts = new[] { new { text = prompt } } }
            },
            generationConfig = new { responseMimeType = "application/json", temperature = 0.2 }
        };

        var responseJson = await CallWithRetryAsync(JsonSerializer.Serialize(payload));

        using var document = JsonDocument.Parse(responseJson);
        var text = document.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text").GetString();

        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Gemini returned an empty insight.");

        var result = JsonSerializer.Deserialize<FinancialInsightResponseDto>(
            text, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (result is null || string.IsNullOrWhiteSpace(result.Insight))
            throw new InvalidOperationException("Gemini returned an insight that could not be parsed.");

        return result with { Suggestions = result.Suggestions?.Take(3).ToList() ?? [] };
    }

    /// <summary>Formats the series into a compact, unambiguous block for the model.</summary>
    private static string BuildPrompt(FinancialInsightRequestDto request)
    {
        var cur = request.Currency;
        var lines = request.Points.Select(p =>
        {
            var parts = new List<string>();
            if (p.Income.HasValue) parts.Add($"income {cur}{p.Income.Value.ToString("N2", CultureInfo.InvariantCulture)}");
            if (p.Deductions.HasValue) parts.Add($"deductions {cur}{p.Deductions.Value.ToString("N2", CultureInfo.InvariantCulture)}");
            if (p.Net.HasValue) parts.Add($"net {cur}{p.Net.Value.ToString("N2", CultureInfo.InvariantCulture)}");
            if (!string.IsNullOrWhiteSpace(p.Note)) parts.Add(p.Note!);
            return $"- {p.Label}: {string.Join(", ", parts)}";
        });

        var kind = request.Kind == SeriesKind.TimeSeries ? "TIME_SERIES" : "CATEGORY";
        var ordering = request.Kind == SeriesKind.TimeSeries
            ? "consecutive months, oldest first"
            : "independent items with no time order";

        return $"""
        Chart: {request.ChartLabel}
        SERIES KIND: {kind}
        Points ({request.Points.Count}, {ordering}):
        {string.Join("\n", lines)}
        """;
    }

    /// <summary>POSTs to Gemini, retrying on 429 and transient 5xx with exponential backoff.</summary>
    private async Task<string> CallWithRetryAsync(string jsonPayload)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

        for (var attempt = 1; ; attempt++)
        {
            try
            {
                using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                    return await response.Content.ReadAsStringAsync();

                var body = await response.Content.ReadAsStringAsync();

                if (!IsTransient(response.StatusCode) || attempt == MaxAttempts)
                {
                    logger.LogError("Gemini insight call failed ({Status}) after {Attempt} attempt(s): {Body}",
                        response.StatusCode, attempt, body);
                    throw new InvalidOperationException($"Gemini API error: {response.StatusCode}");
                }

                logger.LogWarning("Gemini insight call returned {Status} (attempt {Attempt}/{Max}); retrying.",
                    response.StatusCode, attempt, MaxAttempts);
            }
            catch (HttpRequestException ex) when (attempt < MaxAttempts)
            {
                logger.LogWarning(ex, "Gemini insight call threw (attempt {Attempt}/{Max}); retrying.", attempt, MaxAttempts);
            }

            // Exponential backoff: 600ms, 1200ms, 2400ms...
            await Task.Delay(BaseDelay * Math.Pow(2, attempt - 1));
        }
    }

    private static bool IsTransient(HttpStatusCode status) =>
        status == HttpStatusCode.TooManyRequests || (int)status >= 500;
}
