using Microsoft.EntityFrameworkCore;
using PropertyManagement.API.Models;

namespace PropertyManagement.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<PropertyUnit> PropertyUnits => Set<PropertyUnit>();
    public DbSet<PropertyResident> PropertyResidents => Set<PropertyResident>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MaintenanceRequest> MaintenanceRequests => Set<MaintenanceRequest>();
    public DbSet<RequestEvidence> RequestEvidence => Set<RequestEvidence>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<PropertyResident>()
            .HasIndex(pr => new { pr.PropertyId, pr.ResidentId })
            .IsUnique();

        var seedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // Seed default categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Plumbing",    Description = "Water leaks, pipe issues, drainage problems", IsActive = true, CreatedAt = seedDate },
            new Category { Id = 2, Name = "Electrical",  Description = "Power outages, wiring, sockets, lighting",    IsActive = true, CreatedAt = seedDate },
            new Category { Id = 3, Name = "HVAC",        Description = "Air conditioning, heating, ventilation",       IsActive = true, CreatedAt = seedDate },
            new Category { Id = 4, Name = "Structural",  Description = "Walls, ceiling, flooring, roof damage",        IsActive = true, CreatedAt = seedDate },
            new Category { Id = 5, Name = "Appliances",  Description = "Built-in appliance faults",                    IsActive = true, CreatedAt = seedDate },
            new Category { Id = 6, Name = "Pest Control",Description = "Insects, rodents, infestations",               IsActive = true, CreatedAt = seedDate },
            new Category { Id = 7, Name = "Cleaning",    Description = "Common area cleaning requests",                IsActive = true, CreatedAt = seedDate },
            new Category { Id = 8, Name = "Security",    Description = "Locks, doors, access control",                 IsActive = true, CreatedAt = seedDate },
            new Category { Id = 9, Name = "Other",       Description = "Miscellaneous issues",                         IsActive = true, CreatedAt = seedDate }
        );

        // Seed default admin
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            FullName = "System Admin",
            Email = "admin@propms.com",
            PasswordHash = "$2a$11$s6uCwI5Gx28bhWEHpMPAA.iY8wim3w8BzbzhecLK.FFjcn8CWk6HW",
            Role = UserRole.Admin,
            Phone = "0000000000",
            IsActive = true,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
