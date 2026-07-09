using System.Text;
using System.Text.Json.Serialization;
using Amazon;
using Amazon.S3;
using Amazon.SimpleEmail;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PropertyManagement.API.Data;

// Load .env file variables into environment
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// ── Database ────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("Default"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("Default"))
    )
);

// ── JWT Authentication ───────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    var region = builder.Configuration["AWS:Region"]
        ?? builder.Configuration["S3:Region"]
        ?? "ap-southeast-2";
    var accessKey = builder.Configuration["AWS:AccessKey"];
    var secretKey = builder.Configuration["AWS:SecretKey"];
    var endpoint = RegionEndpoint.GetBySystemName(region);

    return !string.IsNullOrWhiteSpace(accessKey) && !string.IsNullOrWhiteSpace(secretKey)
        ? new AmazonS3Client(accessKey, secretKey, endpoint)
        : new AmazonS3Client(endpoint);
});

builder.Services.AddSingleton<IAmazonSimpleEmailService>(_ =>
{
    var region = builder.Configuration["AWS:Region"]
        ?? builder.Configuration["S3:Region"]
        ?? "ap-southeast-2";
    var accessKey = builder.Configuration["AWS:AccessKey"];
    var secretKey = builder.Configuration["AWS:SecretKey"];
    var endpoint = RegionEndpoint.GetBySystemName(region);

    return !string.IsNullOrWhiteSpace(accessKey) && !string.IsNullOrWhiteSpace(secretKey)
        ? new AmazonSimpleEmailServiceClient(accessKey, secretKey, endpoint)
        : new AmazonSimpleEmailServiceClient(endpoint);
});

builder.Services.AddScoped<PropertyManagement.API.Services.EmailService>();

// ── CORS ─────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        if (allowedOrigins.Length == 0)
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        else
            policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// ── Services ─────────────────────────────────────────────────────────────────
builder.Services.AddHttpClient<PropertyManagement.API.Services.GeminiAssistantService>();

var app = builder.Build();

// ── Migrate & seed on startup ─────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
