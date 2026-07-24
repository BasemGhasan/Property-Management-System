using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.API.DTOs.Insights;

/// <summary>A single point on a financial chart the owner is looking at.</summary>
public record InsightPointDto(
    string Label,
    decimal? Income = null,
    decimal? Deductions = null,
    decimal? Net = null,
    string? Note = null
);

/// <summary>
/// Whether a chart's points are ordered in time or are independent categories.
/// Trend language ("most recent", "rising") is only meaningful for a time series.
/// </summary>
public enum SeriesKind
{
    TimeSeries,
    Category
}

public record FinancialInsightRequestDto
{
    /// <summary>Stable identifier for the chart, e.g. "net-trend". Used for prompt shaping.</summary>
    [Required, MaxLength(60)]
    public string ChartKey { get; init; } = string.Empty;

    /// <summary>Human-readable chart title shown to the owner.</summary>
    [Required, MaxLength(120)]
    public string ChartLabel { get; init; } = string.Empty;

    public SeriesKind Kind { get; init; } = SeriesKind.TimeSeries;

    [Required, MinLength(1), MaxLength(60)]
    public List<InsightPointDto> Points { get; init; } = [];

    [MaxLength(8)]
    public string Currency { get; init; } = "$";
}

public record FinancialInsightResponseDto(
    string Insight,
    List<string> Suggestions
);
