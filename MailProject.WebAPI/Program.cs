using MailProject.Infrastructure;
using MailProject.Application;
using Hangfire;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddScoped<MailProject.WebAPI.Filters.QuotaCheckFilter>();
builder.Services.AddScoped<MailProject.Application.Common.Interfaces.INotificationService, MailProject.WebAPI.Services.NotificationService>();

// Clean Architecture Layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularClient",
        b => b.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = System.Text.Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"]!);
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Set WebRootPath explicitly to ensure it points to wwwroot even if created after startup
builder.Environment.WebRootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(builder.Environment.WebRootPath)) Directory.CreateDirectory(builder.Environment.WebRootPath);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseStaticFiles(); // Now serves from builder.Environment.WebRootPath
app.UseCors("AllowAngularClient");

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard();

app.MapControllers();
app.MapHub<MailProject.WebAPI.Hubs.NotificationHub>("/notificationHub");

// Seed Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<MailProject.Infrastructure.Persistence.MailDbContext>();
        await MailProject.Infrastructure.Persistence.MailDbContextSeed.SeedAsync(context);
    }
    catch (Exception ex)
    {
        // Log error
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();
