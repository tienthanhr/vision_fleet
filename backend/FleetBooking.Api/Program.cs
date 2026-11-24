using FleetBooking.Api.Data;
using FleetBooking.Api.Security;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // Hosting providers (e.g. Plesk/Passenger) may start the process from a
    // different working directory; pin the content root to the app assembly
    // so appsettings.json is always found.
    ContentRootPath = AppContext.BaseDirectory
});

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "fleet_booking_session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });
var connectionString = builder.Configuration.GetConnectionString("FleetDatabase");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Connection string 'FleetDatabase' was not found. Check that appsettings.json sits next to the application assembly.");
}
// MariaDB 10.11 runs on the school Plesk host; pinning the version avoids a
// startup probe against the database server.
var serverVersion = new MySqlServerVersion(new Version(10, 11, 14));
builder.Services.AddDbContext<FleetDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion);
    if (builder.Configuration.GetValue<bool>("Database:LogSql"))
    {
        options.LogTo(message => System.IO.File.AppendAllText(
            Path.Combine(AppContext.BaseDirectory, "query.log"), $"{DateTime.UtcNow:O} {message}{Environment.NewLine}"));
        options.EnableSensitiveDataLogging();
    }
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins(
            "http://localhost:5173",
            "http://localhost:8443",
            "https://tienproject2.dipwww.visioncollege.ac.nz",
            "https://booking.dipwww.visioncollege.ac.nz")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

// Surface unhandled exceptions as structured JSON; details go to the standard
// application log (visible in the Plesk log browser) rather than a web-served file.
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Unhandled {Method} {Path}", context.Request.Method, context.Request.Path);
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        var payload = System.Text.Json.JsonSerializer.Serialize(new
        {
            error = ex.GetType().Name,
            message = ex.Message,
            inner = ex.InnerException?.GetType().Name + ": " + ex.InnerException?.Message,
        });
        await context.Response.WriteAsync(payload);
    }
});

if (app.Configuration.GetValue<bool>("Database:AutoMigrate"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<FleetDbContext>();
    db.Database.Migrate();
}

if (app.Configuration.GetValue<bool>("Database:AutoSeed"))
{
    using var scope = app.Services.CreateScope();
    DbSeeder.Seed(scope.ServiceProvider.GetRequiredService<FleetDbContext>());
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

var buildVersion = Assembly.GetExecutingAssembly()
    .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? "local";
app.MapGet("/health", () => Results.Ok(new
{
    service = "Vision College Fleet Booking API",
    status = "running",
    build = buildVersion,
    api = "/api",
    swagger = "/swagger"
}));

app.MapControllers();

// The React build (index.html + assets) is deployed into this site's document
// root; any unknown, non-API path is served the SPA so deep links such as
// /booking-details/{id} work after a refresh.
app.MapFallback(async context =>
{
    var path = context.Request.Path;
    if (path.StartsWithSegments("/api") || path.StartsWithSegments("/health") || path.StartsWithSegments("/swagger"))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    var indexPath = Path.Combine(AppContext.BaseDirectory, "index.html");
    if (File.Exists(indexPath))
    {
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync(indexPath);
        return;
    }

    context.Response.StatusCode = StatusCodes.Status404NotFound;
});

app.Run();
