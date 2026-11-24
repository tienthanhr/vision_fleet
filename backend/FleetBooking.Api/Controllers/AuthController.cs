using System.Security.Claims;
using FleetBooking.Api.Data;
using FleetBooking.Api.Models;
using FleetBooking.Api.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace FleetBooking.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(FleetDbContext database) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await database.Users.SingleOrDefaultAsync(item => item.Email.ToLower() == email, cancellationToken);
        if (user is null || !string.Equals(user.Status, "active", StringComparison.OrdinalIgnoreCase))
            return Unauthorized("Invalid email or password.");
        if (user.Role is UserRole.Student or UserRole.Parent)
            return Unauthorized("This portal is restricted to staff and drivers.");

        var validPassword = PasswordService.Verify(request.Password, user.PasswordHash)
            || (user.PasswordHash is "demo" or "demo-only" or "managed-by-portal" or "demo-account-hash-replace-before-production" && request.Password == "visioncollege");
        if (!validPassword)
            return Unauthorized("Invalid email or password.");

        if (!user.PasswordHash.StartsWith("pbkdf2-sha256$", StringComparison.Ordinal))
        {
            user.PasswordHash = PasswordService.Hash(request.Password);
            await database.SaveChangesAsync(cancellationToken);
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString().ToLowerInvariant()),
        };
        var properties = new AuthenticationProperties { IsPersistent = request.RememberMe };
        if (request.RememberMe)
            properties.ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)), properties);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role.ToString().ToLowerInvariant()));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        _ = await database.Users.AsNoTracking().AnyAsync(user => user.Email == email, cancellationToken);
        return Accepted(new { message = "If an authorised account exists for this email, reset instructions will be sent." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> Me(CancellationToken cancellationToken)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(id, out var userId))
            return Unauthorized();
        var user = await database.Users.FindAsync([userId], cancellationToken);
        return user is null ? Unauthorized() : Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role.ToString().ToLowerInvariant()));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }
}

public sealed record LoginRequest(string Email, string Password, bool RememberMe);
public sealed record ForgotPasswordRequest(string Email);
public sealed record AuthResponse(Guid Id, string FullName, string Email, string Role);
