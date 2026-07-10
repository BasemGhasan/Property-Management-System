using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.API.DTOs.Insights;
using PropertyManagement.API.Services;

namespace PropertyManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Owner,Admin")]
public class InsightsController(GeminiInsightService insightService, ILogger<InsightsController> logger) : ControllerBase
{
    /// <summary>Generates a plain-language trend read + suggestions for one analytics chart.</summary>
    [HttpPost("financial")]
    public async Task<IActionResult> Financial([FromBody] FinancialInsightRequestDto request)
    {
        if (request.Points.Count == 0)
            return BadRequest(new { message = "At least one data point is required." });

        try
        {
            return Ok(await insightService.GenerateInsightAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            logger.LogError(ex, "Failed to generate financial insight for chart {ChartKey}.", request.ChartKey);
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "The AI insight service is temporarily unavailable. Please try again." });
        }
    }
}
