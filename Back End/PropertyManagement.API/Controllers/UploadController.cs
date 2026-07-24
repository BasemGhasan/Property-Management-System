using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PropertyManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController(IConfiguration config, ILogger<UploadController> logger) : ControllerBase
{
    private static readonly string[] AllowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    private const long MaxBytes = 10 * 1024 * 1024; // 10 MB

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (!AllowedTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Only JPEG, PNG, WebP and GIF images are allowed." });

        if (file.Length > MaxBytes)
            return BadRequest(new { message = "File size must be under 10 MB." });

        var bucketName = config["S3:BucketName"];
        var region = config["S3:Region"] ?? "ap-southeast-1";

        if (string.IsNullOrWhiteSpace(bucketName))
        {
            logger.LogError("Upload rejected: S3:BucketName is not configured.");
            return StatusCode(503, new { message = "File uploads are temporarily unavailable. Please try again later." });
        }

        var safeFileName = Path.GetFileName(file.FileName).Replace(" ", "-");
        var key = $"evidence/{Guid.NewGuid()}-{safeFileName}";

        try
        {
            var accessKey = config["AWS:AccessKey"];
            var secretKey = config["AWS:SecretKey"];
            using var s3 = !string.IsNullOrEmpty(accessKey) && !string.IsNullOrEmpty(secretKey)
                ? new AmazonS3Client(accessKey, secretKey, RegionEndpoint.GetBySystemName(region))
                : new AmazonS3Client(RegionEndpoint.GetBySystemName(region));
            using var stream = file.OpenReadStream();

            await s3.PutObjectAsync(new PutObjectRequest
            {
                BucketName = bucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType,
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload file to S3 bucket {Bucket}.", bucketName);
            return StatusCode(502, new { message = "Failed to upload the file. Please try again." });
        }

        var url = $"https://{bucketName}.s3.{region}.amazonaws.com/{key}";
        return Ok(new { url });
    }
}
