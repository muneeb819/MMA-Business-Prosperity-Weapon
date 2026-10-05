
# create-scaffold.ps1
# Usage: open PowerShell in the repo root and run: .\create-scaffold.ps1
# Prerequisites: dotnet 8 SDK installed. Docker is optional for compose.

param(
    [string]$ProjectDir = "server/MMAApp",
    [string]$SolutionName = "MMAAppSolution"
)

Write-Host "Creating project directories..."
New-Item -ItemType Directory -Force -Path $ProjectDir | Out-Null

Write-Host "Creating new webapi project (dotnet 8)..."
dotnet new webapi -o $ProjectDir --no-https --framework net8.0

Push-Location $ProjectDir

Write-Host "Adding required NuGet packages..."
dotnet add package Pomelo.EntityFrameworkCore.MySql --version 8.0.3
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.0

Write-Host "Writing Program.cs..."
$program = @'
using Microsoft.EntityFrameworkCore;
using MMAApp.Data;

var builder = WebApplication.CreateBuilder(args);

var conn = builder.Configuration.GetConnectionString("DefaultConnection")
           ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
           ?? "Server=localhost;Port=3306;Database=appdb;User=appuser;Password=ChangeMe123!";

var serverVersion = new MySqlServerVersion(new Version(8, 0, 32));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(conn, serverVersion));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure database exists (local/dev). For production use migrations.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
'@
Set-Content -Path "./Program.cs" -Value $program -Encoding UTF8 -Force

Write-Host "Adding Data/AppDbContext.cs..."
New-Item -ItemType Directory -Force -Path "./Data" | Out-Null
$ctx = @'
using Microsoft.EntityFrameworkCore;
using MMAApp.Models;

namespace MMAApp.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }
    public DbSet<User> Users => Set<User>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>().ToTable("users");
    }
}
'@
Set-Content -Path "./Data/AppDbContext.cs" -Value $ctx -Encoding UTF8 -Force

Write-Host "Adding Models/User.cs..."
New-Item -ItemType Directory -Force -Path "./Models" | Out-Null
$user = @'
using System.ComponentModel.DataAnnotations;
namespace MMAApp.Models;
public class User
{
    public int Id { get; set; }
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;
    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
'@
Set-Content -Path "./Models/User.cs" -Value $user -Encoding UTF8 -Force

Write-Host "Adding Controllers/UsersController.cs..."
New-Item -ItemType Directory -Force -Path "./Controllers" | Out-Null
$controller = @'
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MMAApp.Data;
using MMAApp.Models;

namespace MMAApp.Controllers;
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public UsersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _db.Users.ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();
        return Ok(u);
    }

    [HttpPost]
    public async Task<IActionResult> Post(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
    }
}
'@
Set-Content -Path "./Controllers/UsersController.cs" -Value $controller -Encoding UTF8 -Force

Pop-Location

Write-Host "Creating solution and adding project..."
dotnet new sln -n $SolutionName
dotnet sln add "$ProjectDir/$([System.IO.Path]::GetFileName($ProjectDir)).csproj"

Write-Host "Creating db/init.sql..."
New-Item -ItemType Directory -Force -Path "./db" | Out-Null
$dbinit = @'
-- Initial schema for MMAApp (users table)
CREATE DATABASE IF NOT EXISTS appdb;
USE appdb;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
'@
Set-Content -Path "./db/init.sql" -Value $dbinit -Encoding UTF8 -Force

Write-Host "Creating .env.example..."
$envexample = @'
# Copy to .env and edit
ConnectionStrings__DefaultConnection=Server=127.0.0.1;Port=3306;Database=appdb;User=appuser;Password=ChangeMe123!
'@
Set-Content -Path "./.env.example" -Value $envexample -Encoding UTF8 -Force

Write-Host "Creating server/Dockerfile..."
$dockerfile = @'
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MMAApp.csproj", "./"]
RUN dotnet restore "MMAApp.csproj"
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "MMAApp.dll"]
'@
Set-Content -Path "./server/Dockerfile" -Value $dockerfile -Encoding UTF8 -Force

Write-Host "Creating docker-compose.yml..."
$compose = @'
version: "3.8"
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: appdb
      MYSQL_USER: appuser
      MYSQL_PASSWORD: ChangeMe123!
    volumes:
      - db_data:/var/lib/mysql
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "3306:3306"

  app:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      - ConnectionStrings__DefaultConnection=Server=db;Port=3306;Database=appdb;User=appuser;Password=ChangeMe123!
    depends_on:
      - db
    ports:
      - "5000:5000"

volumes:
  db_data:
'@
Set-Content -Path "./docker-compose.yml" -Value $compose -Encoding UTF8 -Force

Write-Host "Creating README.md..."
$readme = @'
MMA Business Prosperity Weapon - ASP.NET Core Scaffold

This repo contains a minimal ASP.NET Core Web API scaffold (MMAApp) configured to use MySQL via EF Core (Pomelo). Local-first: run with Visual Studio or Docker Compose.

Quick start:
1) Open solution in Visual Studio or run:
   cd server/MMAApp
   dotnet restore
   dotnet run

2) Or from repo root run:
   docker-compose up --build

API endpoints:
- GET /api/users
- POST /api/users  { name, email }

Notes:
- Uses Database.EnsureCreated() for local convenience. Use EF migrations for production.
- Provide .env or set ConnectionStrings__DefaultConnection for custom DB host/credentials.
'@
Set-Content -Path "./README.md" -Value $readme -Encoding UTF8 -Force

Write-Host "Scaffold complete. Next steps:"
Write-Host "1) Open server/MMAApp in Visual Studio or run 'dotnet restore' and 'dotnet run'."
Write-Host "2) To run with Docker Compose: docker-compose up --build"
Write-Host "3) If you need HTTPS dev certs or EF migrations, implement migrations with 'dotnet ef'."

Write-Host "Done."