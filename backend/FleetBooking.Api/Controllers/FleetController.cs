using FleetBooking.Api.Data;
using FleetBooking.Api.Models;
using FleetBooking.Api.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace FleetBooking.Api.Controllers;

[ApiController]
[Route("api/fleet")]
[Authorize]
public sealed class FleetController(FleetDbContext database) : ControllerBase
{
    [HttpGet("users")]
    [Authorize(Roles = "admin,staff")]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers(CancellationToken cancellationToken)
    {
        var users = await database.Users.AsNoTracking().OrderBy(user => user.FullName)
            .Select(user => new UserResponse(user.Id, user.FullName, user.Email, user.Role, user.Status))
            .ToListAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("vans")]
    [Authorize(Roles = "admin,staff,driver")]
    public async Task<ActionResult<IEnumerable<VanResponse>>> GetVans(CancellationToken cancellationToken)
    {
        var vans = await database.Vans.AsNoTracking().OrderBy(van => van.RegistrationNumber)
            .Select(van => new VanResponse(van.Id, van.RegistrationNumber, van.Name, van.Capacity, van.Status))
            .ToListAsync(cancellationToken);
        return Ok(vans);
    }

    [HttpGet("summary")]
    [Authorize(Roles = "admin,staff,driver")]
    public async Task<ActionResult<FleetSummaryResponse>> GetSummary(CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var totalBookings = await database.TransportRequests.CountAsync(cancellationToken);
        var pendingBookings = await database.TransportRequests.CountAsync(item => item.Status == RequestStatus.Pending, cancellationToken);
        var availableVans = await database.Vans.CountAsync(item => item.Status == VanStatus.Available, cancellationToken);
        var onJourneyVans = await database.Vans.CountAsync(item => item.Status == VanStatus.Assigned, cancellationToken);
        var maintenanceVans = await database.Vans.CountAsync(item => item.Status == VanStatus.Maintenance, cancellationToken);
        var totalVans = await database.Vans.CountAsync(cancellationToken);
        var upcomingJourneys = await database.TransportRequests.CountAsync(item => item.JourneyDate >= today && item.Status != RequestStatus.Declined && item.Status != RequestStatus.Cancelled, cancellationToken);
        return Ok(new FleetSummaryResponse(totalBookings, pendingBookings, availableVans, onJourneyVans, maintenanceVans, totalVans, upcomingJourneys));
    }

    [HttpPost("vans")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<VanResponse>> CreateVan(VanInput input, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(input.RegistrationNumber) || input.Capacity <= 0)
            return BadRequest("Registration number and a positive capacity are required.");
        if (await database.Vans.AnyAsync(van => van.RegistrationNumber == input.RegistrationNumber.Trim(), cancellationToken))
            return Conflict("A van with this registration number already exists.");
        if (!Enum.TryParse<VanStatus>(input.Status, true, out var status))
            return BadRequest("Status must be Available, Assigned, Maintenance or Inactive.");
        var van = new Van { RegistrationNumber = input.RegistrationNumber.Trim(), Name = input.Name?.Trim(), Capacity = input.Capacity, Status = status, Notes = input.Notes?.Trim() };
        database.Vans.Add(van);
        await database.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetVans), new { id = van.Id }, new VanResponse(van.Id, van.RegistrationNumber, van.Name, van.Capacity, van.Status));
    }

    [HttpPut("vans/{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateVan(Guid id, VanInput input, CancellationToken cancellationToken)
    {
        var van = await database.Vans.FindAsync([id], cancellationToken);
        if (van is null) return NotFound("The van was not found.");
        if (string.IsNullOrWhiteSpace(input.RegistrationNumber) || input.Capacity <= 0)
            return BadRequest("Registration number and a positive capacity are required.");
        if (await database.Vans.AnyAsync(item => item.Id != id && item.RegistrationNumber == input.RegistrationNumber.Trim(), cancellationToken))
            return Conflict("A van with this registration number already exists.");
        if (!Enum.TryParse<VanStatus>(input.Status, true, out var status))
            return BadRequest("Status must be Available, Assigned, Maintenance or Inactive.");
        van.RegistrationNumber = input.RegistrationNumber.Trim();
        van.Name = input.Name?.Trim();
        van.Capacity = input.Capacity;
        van.Status = status;
        van.Notes = input.Notes?.Trim();
        await database.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("vans/{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteVan(Guid id, CancellationToken cancellationToken)
    {
        var van = await database.Vans.FindAsync([id], cancellationToken);
        if (van is null) return NotFound("The van was not found.");
        if (await database.Routes.AnyAsync(route => route.VanId == id && (route.Status == "active" || route.Status == "assigned"), cancellationToken))
            return Conflict("An assigned van cannot be deleted.");
        database.Vans.Remove(van);
        await database.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("users")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<UserResponse>> CreateUser(UserInput input, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(input.FullName) || string.IsNullOrWhiteSpace(input.Email) || string.IsNullOrWhiteSpace(input.Password))
            return BadRequest("Full name, email and password are required.");
        if (!Enum.TryParse<UserRole>(input.Role, true, out var role))
            return BadRequest("Role is invalid.");
        if (role is UserRole.Student or UserRole.Parent)
            return BadRequest("Student and parent portal accounts are not supported.");
        var email = input.Email.Trim().ToLowerInvariant();
        if (await database.Users.AnyAsync(user => user.Email == email, cancellationToken))
            return Conflict("A user with this email already exists.");
        var user = new User { FullName = input.FullName.Trim(), Email = email, PasswordHash = PasswordService.Hash(input.Password), Role = role, Status = string.IsNullOrWhiteSpace(input.Status) ? "active" : input.Status.Trim().ToLowerInvariant(), Phone = input.Phone?.Trim() };
        database.Users.Add(user);
        await database.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, new UserResponse(user.Id, user.FullName, user.Email, user.Role, user.Status));
    }

    [HttpPut("users/{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateUser(Guid id, UserInput input, CancellationToken cancellationToken)
    {
        var user = await database.Users.FindAsync([id], cancellationToken);
        if (user is null) return NotFound("The user was not found.");
        if (string.IsNullOrWhiteSpace(input.FullName) || string.IsNullOrWhiteSpace(input.Email))
            return BadRequest("Full name and email are required.");
        if (!Enum.TryParse<UserRole>(input.Role, true, out var role))
            return BadRequest("Role is invalid.");
        if (role is UserRole.Student or UserRole.Parent)
            return BadRequest("Student and parent portal accounts are not supported.");
        var email = input.Email.Trim().ToLowerInvariant();
        if (await database.Users.AnyAsync(item => item.Id != id && item.Email == email, cancellationToken))
            return Conflict("A user with this email already exists.");
        user.FullName = input.FullName.Trim();
        user.Email = email;
        user.Role = role;
        user.Status = string.IsNullOrWhiteSpace(input.Status) ? user.Status : input.Status.Trim().ToLowerInvariant();
        user.Phone = input.Phone?.Trim();
        if (!string.IsNullOrWhiteSpace(input.Password)) user.PasswordHash = PasswordService.Hash(input.Password);
        await database.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("users/{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        var user = await database.Users.FindAsync([id], cancellationToken);
        if (user is null) return NotFound("The user was not found.");
        if (user.Id == Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value))
            return BadRequest("You cannot delete your own account.");
        if (user.Role is UserRole.Student or UserRole.Parent)
        {
            if (user.Role == UserRole.Student)
            {
                var profile = await database.StudentProfiles.SingleOrDefaultAsync(item => item.UserId == user.Id, cancellationToken);
                if (profile is not null) profile.UserId = null;
            }
            var changeRequests = await database.StudentChangeRequests
                .Where(item => item.RequestedById == user.Id)
                .ToListAsync(cancellationToken);
            database.StudentChangeRequests.RemoveRange(changeRequests);
            database.Users.Remove(user);
            await database.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
        database.Users.Remove(user);
        await database.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("students")]
    public async Task<ActionResult<IEnumerable<StudentResponse>>> GetStudents(CancellationToken cancellationToken)
    {
        var students = await database.StudentProfiles.AsNoTracking().Include(student => student.User)
            .OrderBy(student => student.StudentNumber)
            .Select(student => new StudentResponse(student.Id, student.User == null ? "Unnamed student" : student.User.FullName, student.StudentNumber, student.YearLevel, student.Addresses.Where(address => address.IsCurrent).Select(address => new AddressResponse(address.AddressLine, address.Suburb, address.City, address.Postcode)).FirstOrDefault()))
            .ToListAsync(cancellationToken);
        return Ok(students);
    }

    [HttpPost("students")]
    [Authorize(Roles = "admin,staff")]
    public async Task<ActionResult<StudentResponse>> CreateStudent(StudentChangeInput input, CancellationToken cancellationToken)
    {
        if (!CanManageStudents(Request)) return Forbid();
        if (string.IsNullOrWhiteSpace(input.Name) || string.IsNullOrWhiteSpace(input.StudentNumber) || string.IsNullOrWhiteSpace(input.AddressLine))
            return BadRequest("Name, student number and address are required.");
        var user = new User { FullName = input.Name.Trim(), Email = input.Email.Trim(), PasswordHash = "managed-by-portal", Role = UserRole.Student };
        var student = new StudentProfile { User = user, StudentNumber = input.StudentNumber.Trim(), YearLevel = input.YearLevel };
        student.Addresses.Add(ToAddress(input));
        database.StudentProfiles.Add(student);
        await database.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetStudents), new { id = student.Id }, new StudentResponse(student.Id, user.FullName, student.StudentNumber, student.YearLevel, new AddressResponse(input.AddressLine, input.Suburb, input.City, input.Postcode)));
    }

    [HttpPut("students/{id:guid}")]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> UpdateStudent(Guid id, StudentChangeInput input, CancellationToken cancellationToken)
    {
        if (!CanManageStudents(Request)) return Forbid();
        var student = await database.StudentProfiles.Include(item => item.User).Include(item => item.Addresses).SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (student is null) return NotFound();
        if (student.User is null)
        {
            student.User = new User
            {
                FullName = input.Name.Trim(),
                Email = input.Email.Trim(),
                Role = UserRole.Student,
                PasswordHash = "managed-by-portal",
            };
            database.Users.Add(student.User);
            student.UserId = student.User.Id;
        }
        else
        {
            student.User.FullName = input.Name.Trim();
            student.User.Email = input.Email.Trim();
        }
        student.StudentNumber = input.StudentNumber.Trim();
        student.YearLevel = input.YearLevel;
        if (!string.IsNullOrWhiteSpace(input.AddressLine))
        {
            var current = student.Addresses.FirstOrDefault(address => address.IsCurrent);
            var changed = current is null
                || current.AddressLine != input.AddressLine.Trim()
                || current.Suburb != input.Suburb
                || current.City != input.City
                || current.Postcode != input.Postcode;
            if (changed)
            {
                foreach (var address in student.Addresses.Where(address => address.IsCurrent))
                {
                    address.IsCurrent = false;
                }

                var newAddress = ToAddress(input);
                newAddress.StudentId = student.Id;
                // Explicit DbSet.Add so EF marks the row Added (INSERT) rather than inferring Modified.
                database.StudentAddresses.Add(newAddress);
            }
        }
        await database.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("student-change-requests")]
    public async Task<ActionResult<IEnumerable<ChangeRequestResponse>>> GetChangeRequests(CancellationToken cancellationToken)
    {
        if (!CanManageStudents(Request)) return Forbid();
        var requests = await (from request in database.StudentChangeRequests
                              join student in database.StudentProfiles on request.StudentId equals student.Id
                              join user in database.Users on student.UserId equals user.Id
                              orderby request.CreatedAt descending
                              select new ChangeRequestResponse(request.Id, request.StudentId, user.FullName, request.AddressLine, request.Suburb, request.City, request.Postcode, request.Status, request.CreatedAt))
            .AsNoTracking().ToListAsync(cancellationToken);
        return Ok(requests);
    }

    [HttpPost("student-change-requests")]
    public async Task<ActionResult> CreateChangeRequest(StudentChangeRequestInput input, CancellationToken cancellationToken)
    {
        if (!string.Equals(Request.Headers["X-Portal-Role"], "parent", StringComparison.OrdinalIgnoreCase)) return Forbid();
        if (input.StudentId == Guid.Empty || string.IsNullOrWhiteSpace(input.AddressLine)) return BadRequest("Student and address are required.");
        var requester = await database.Users.FirstOrDefaultAsync(user => user.Role == UserRole.Parent, cancellationToken);
        if (requester is null) return BadRequest("No parent account is available for this request.");
        database.StudentChangeRequests.Add(new StudentChangeRequest { StudentId = input.StudentId, RequestedById = requester.Id, AddressLine = input.AddressLine.Trim(), Suburb = input.Suburb, City = input.City, Postcode = input.Postcode });
        await database.SaveChangesAsync(cancellationToken);
        return Accepted();
    }

    [HttpPut("student-change-requests/{id:guid}")]
    public async Task<IActionResult> ReviewChangeRequest(Guid id, ReviewChangeRequestInput input, CancellationToken cancellationToken)
    {
        if (!CanManageStudents(Request)) return Forbid();
        var request = await database.StudentChangeRequests.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (request is null) return NotFound();
        if (input.Status is not ("approved" or "declined")) return BadRequest("Status must be approved or declined.");
        request.Status = input.Status;
        request.ReviewedAt = DateTimeOffset.UtcNow;
        if (input.Status == "approved")
        {
            var student = await database.StudentProfiles.Include(item => item.Addresses).SingleAsync(item => item.Id == request.StudentId, cancellationToken);
            foreach (var address in student.Addresses) address.IsCurrent = false;
            student.Addresses.Add(new StudentAddress { StudentId = student.Id, AddressLine = request.AddressLine, Suburb = request.Suburb, City = request.City, Postcode = request.Postcode });
        }
        await database.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static bool CanManageStudents(HttpRequest request) => request.Headers["X-Portal-Role"].Any(value => string.Equals(value, "admin", StringComparison.OrdinalIgnoreCase) || string.Equals(value, "staff", StringComparison.OrdinalIgnoreCase));
    private static StudentAddress ToAddress(StudentChangeInput input) => new() { AddressLine = input.AddressLine.Trim(), Suburb = input.Suburb, City = input.City, Postcode = input.Postcode };
}

public sealed record VanResponse(Guid Id, string RegistrationNumber, string? Name, int Capacity, VanStatus Status);
public sealed record AddressResponse(string AddressLine, string? Suburb, string? City, string? Postcode);
public sealed record StudentResponse(Guid Id, string Name, string StudentNumber, string? YearLevel, AddressResponse? Address);
public sealed record UserResponse(Guid Id, string FullName, string Email, UserRole Role, string Status);
public sealed record FleetSummaryResponse(int TotalBookings, int PendingBookings, int AvailableVans, int OnJourneyVans, int MaintenanceVans, int TotalVans, int UpcomingJourneys);
public sealed record VanInput(string RegistrationNumber, string? Name, int Capacity, string Status, string? Notes);
public sealed record UserInput(string FullName, string Email, string? Password, string Role, string? Status, string? Phone);
public sealed record StudentChangeInput(string Name, string Email, string StudentNumber, string? YearLevel, string AddressLine, string? Suburb, string? City, string? Postcode);
public sealed record StudentChangeRequestInput(Guid StudentId, string AddressLine, string? Suburb, string? City, string? Postcode);
public sealed record ReviewChangeRequestInput(string Status);
public sealed record ChangeRequestResponse(Guid Id, Guid StudentId, string StudentName, string AddressLine, string? Suburb, string? City, string? Postcode, string Status, DateTimeOffset CreatedAt);
