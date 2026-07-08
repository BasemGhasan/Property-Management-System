using System.Text.Json;
using Amazon.S3;
using Amazon.S3.Model;
using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PropertyManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Resident")]
public class MaintenanceController(
    IConfiguration config,
    IAmazonS3 s3,
    ILogger<MaintenanceController> logger) : ControllerBase
{
    private static readonly string[] AllowedTypes = ["image/jpeg", "image/png"];
    private const long MaxBytes = 10 * 1024 * 1024;

    [HttpPost("scan-invoice")]
    public async Task<IActionResult> ScanInvoice(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No invoice image was provided." });

        if (!AllowedTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Only JPEG and PNG invoice images are allowed." });

        if (file.Length > MaxBytes)
            return BadRequest(new { message = "Invoice image must be under 10 MB." });

        var bucketName = config["AWS:BucketName"] ?? config["S3:BucketName"];
        var region = config["AWS:Region"] ?? config["S3:Region"] ?? "ap-southeast-2";
        var geminiApiKey = config["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(bucketName))
            return StatusCode(503, new { message = "S3 bucket configuration is missing." });

        if (string.IsNullOrWhiteSpace(geminiApiKey))
            return StatusCode(503, new { message = "Gemini API configuration is missing." });

        try
        {
            byte[] fileBytes;
            await using (var memory = new MemoryStream())
            {
                await file.CopyToAsync(memory);
                fileBytes = memory.ToArray();
            }

            var safeFileName = Path.GetFileName(file.FileName).Replace(" ", "-");
            var objectKey = $"claims/{Guid.NewGuid()}-{safeFileName}";

            await using (var uploadStream = new MemoryStream(fileBytes))
            {
                await s3.PutObjectAsync(new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = objectKey,
                    InputStream = uploadStream,
                    ContentType = file.ContentType
                });
            }

            var fileUrl = $"https://{bucketName}.s3.{region}.amazonaws.com/{objectKey}";
            var extracted = await ExtractInvoiceFieldsAsync(fileBytes, file.ContentType, geminiApiKey);

            return Ok(new
            {
                fileUrl,
                extracted.MaintenanceType,
                extracted.Date,
                extracted.Amount
            });
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Gemini returned invalid invoice JSON.");
            return StatusCode(502, new { message = "The invoice was uploaded, but Gemini returned an unreadable response." });
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, "Failed to upload invoice image to S3.");
            return StatusCode(502, new { message = "Failed to upload invoice image. Please try again." });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to scan invoice image.");
            return StatusCode(500, new { message = "Failed to scan invoice image. Please try again." });
        }
    }

    private static async Task<InvoiceExtractionResult> ExtractInvoiceFieldsAsync(
        byte[] fileBytes,
        string contentType,
        string apiKey)
    {
        var client = new Client(apiKey: apiKey);
        var schema = new Schema
        {
            Type = Google.GenAI.Types.Type.Object,
            Title = "MaintenanceInvoiceExtraction",
            Required = ["maintenanceType", "date", "amount"],
            PropertyOrdering = ["maintenanceType", "date", "amount"],
            Properties = new Dictionary<string, Schema>
            {
                ["maintenanceType"] = new()
                {
                    Type = Google.GenAI.Types.Type.String,
                    Description = "Maintenance category found on the receipt, such as Plumbing, Electrical, HVAC, Cleaning, Security, Pest Control, Appliances, Structural, or Other."
                },
                ["date"] = new()
                {
                    Type = Google.GenAI.Types.Type.String,
                    Description = "Receipt or service date. Convert any readable date format into YYYY-MM-DD. If the date is completely unreadable, return the raw date text found."
                },
                ["amount"] = new()
                {
                    Type = Google.GenAI.Types.Type.Number,
                    Description = "Final total amount charged as a numeric value only, excluding currency symbols."
                }
            }
        };

        var contents = new List<Content>
        {
            new()
            {
                Role = "user",
                Parts =
                [
                    Part.FromText("Extract only the maintenance type, receipt/service date, and final total amount from this maintenance invoice or receipt."),
                    Part.FromBytes(fileBytes, contentType)
                ]
            }
        };

        var response = await client.Models.GenerateContentAsync(
            model: "gemini-2.5-flash",
            contents: contents,
            config: new GenerateContentConfig
            {
                ResponseMimeType = "application/json",
                ResponseSchema = schema,
                Temperature = 0
            });

        var json = response.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
        if (string.IsNullOrWhiteSpace(json))
            throw new JsonException("Gemini response did not include JSON text.");

        return JsonSerializer.Deserialize<InvoiceExtractionResult>(
            json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new InvoiceExtractionResult();
    }

    private sealed record InvoiceExtractionResult(
        string MaintenanceType = "",
        string Date = "",
        decimal Amount = 0);
}
