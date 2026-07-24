using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PropertyManagement.API.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseMySql(
                "Server=localhost;Port=3306;Database=property_mgmt;User=root;Password=root123;",
                new MySqlServerVersion(new Version(8, 0, 0))
            )
            .Options;

        return new AppDbContext(options);
    }
}
