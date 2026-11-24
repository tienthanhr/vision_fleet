using FleetBooking.Api.Data;
using FleetBooking.Api.Models;
using FleetBooking.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace FleetBooking.Api.Controllers;

[ApiController]
[Route("api/transport-requests")]
[Authorize]
public sealed class TransportRequestsController(FleetDbContext database) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransportRequestResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var requests = await database.TransportRequests
            .AsNoTracking()
            .Include(request => request.CreatedBy)
            .Include(request => request.Students)
            .OrderByDescending(request => request.CreatedAt)
            .ToListAsync(cancellationToken);

        var requestIds = requests.Select(request => request.Id).ToArray();
        var routes = await database.Routes
            .AsNoTracking()
            .Where(route => requestIds.Contains(route.RequestId))
            .ToListAsync(cancellationToken);
        var routeByRequest = routes.GroupBy(route => route.RequestId).ToDictionary(group => group.Key, group => group.First());

        var vanIds = routes.Where(route => route.VanId.HasValue).Select(route => route.VanId!.Value).ToArray();
        var profileIds = routes.Where(route => route.DriverId.HasValue).Select(route => route.DriverId!.Value).ToArray();
        var vans = await database.Vans.AsNoTracking()
            .Where(van => vanIds.Contains(van.Id))
            .ToDictionaryAsync(van => van.Id, van => van.RegistrationNumber, cancellationToken);
        var drivers = await database.DriverProfiles.AsNoTracking()
            .Include(profile => profile.User)
            .Where(profile => profileIds.Contains(profile.Id))
            .ToDictionaryAsync(profile => profile.Id, profile => profile.User?.FullName, cancellationToken);

        var responses = requests.Select(request =>
        {
            string? vanRegistration = null;
            string? driverName = null;
            if (routeByRequest.TryGetValue(request.Id, out var route))
            {
                if (route.VanId is Guid vanId) vans.TryGetValue(vanId, out vanRegistration);
                if (route.DriverId is Guid driverId) drivers.TryGetValue(driverId, out driverName);
            }
            return ToResponse(request, vanRegistration, driverName);
        }).ToList();

        return Ok(responses);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TransportRequestDetailResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var request = await database.TransportRequests
            .AsNoTracking()
            .Include(item => item.CreatedBy)
            .Include(item => item.Students).ThenInclude(item => item.Student).ThenInclude(item => item!.User)
            .Include(item => item.Students).ThenInclude(item => item.Student).ThenInclude(item => item!.Addresses)
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (request is null) return NotFound("The transport request was not found.");

        var route = await database.Routes
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.RequestId == id, cancellationToken);
        string? vanRegistration = null;
        string? driverName = null;
        if (route?.VanId is Guid vanId)
        {
            vanRegistration = await database.Vans
                .AsNoTracking()
                .Where(item => item.Id == vanId)
                .Select(item => item.RegistrationNumber)
                .SingleOrDefaultAsync(cancellationToken);
        }
        if (route?.DriverId is Guid driverProfileId)
        {
            driverName = await database.DriverProfiles
                .AsNoTracking()
                .Include(item => item.User)
                .Where(item => item.Id == driverProfileId)
                .Select(item => item.User != null ? item.User.FullName : null)
                .SingleOrDefaultAsync(cancellationToken);
        }

        return Ok(new TransportRequestDetailResponse(
            request.Id,
            request.Title,
            request.JourneyType,
            request.JourneyDate,
            request.PlannedStartTime,
            request.PlannedEndTime,
            request.StandardPickupLocation,
            request.Destination,
            request.Status,
            request.CreatedBy?.FullName,
            vanRegistration,
            driverName,
            request.CreatedAt,
            request.Students.Select(item => new RequestStudentResponse(
                item.StudentId,
                item.Student?.User?.FullName ?? $"Student {item.StudentId.ToString()[..8]}",
                item.Student?.StudentNumber,
                item.Student?.Addresses.FirstOrDefault(address => address.IsCurrent)?.AddressLine))));
    }

    [HttpPost]
    public async Task<ActionResult<TransportRequestResponse>> Create(
        [FromBody] CreateTransportRequest request,
        CancellationToken cancellationToken)
    {
        if (!DateOnly.TryParseExact(request.JourneyDate, "yyyy-MM-dd", out var journeyDate))
            return BadRequest("Journey date must use YYYY-MM-DD format.");
        if (!TimeOnly.TryParseExact(request.PlannedStartTime, ["HH:mm", "HH:mm:ss"], out var plannedStartTime))
            return BadRequest("Departure time must use HH:mm or HH:mm:ss format.");
        TimeOnly? plannedEndTime = null;
        if (!string.IsNullOrWhiteSpace(request.PlannedEndTime))
        {
            if (!TimeOnly.TryParseExact(request.PlannedEndTime, ["HH:mm", "HH:mm:ss"], out var parsedEndTime))
                return BadRequest("Return time must use HH:mm or HH:mm:ss format.");
            plannedEndTime = parsedEndTime;
        }

        var journeyDateTime = journeyDate.ToDateTime(plannedStartTime);
        var minimumNotice = DateTimeOffset.UtcNow.AddHours(48);
        if (journeyDateTime.ToUniversalTime() < minimumNotice.UtcDateTime)
            return BadRequest("Departure must be at least 48 hours in the future.");
        if (plannedEndTime is TimeOnly endTime)
        {
            var endDateTime = journeyDate.ToDateTime(endTime);
            if (endDateTime < journeyDateTime)
                return BadRequest("The expected return time cannot be before the departure time.");
        }

        // Always attribute a new booking to the signed-in user; ignore any id sent by the client.
        var createdById = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value is string callerId && Guid.TryParse(callerId, out var parsedCaller)
            ? parsedCaller
            : request.CreatedById;
        if (!await database.Users.AnyAsync(user => user.Id == createdById, cancellationToken))
            return BadRequest("The requesting user does not exist.");

        var studentIds = request.StudentIds.Distinct().ToArray();
        var existingStudentIds = await database.StudentProfiles
            .Where(student => studentIds.Contains(student.Id))
            .Select(student => student.Id)
            .ToListAsync(cancellationToken);

        if (existingStudentIds.Count != studentIds.Length)
            return BadRequest("One or more selected students do not exist.");

        var entity = new TransportRequest
        {
            CreatedById = createdById,
            JourneyType = request.JourneyType,
            Title = request.Title,
            Description = request.Description,
            JourneyDate = journeyDate,
            PlannedStartTime = plannedStartTime,
            PlannedEndTime = plannedEndTime,
            StandardPickupLocation = request.StandardPickupLocation,
            Destination = request.Destination,
            Students = studentIds.Select(studentId => new RequestStudent { StudentId = studentId }).ToList()
        };

        database.TransportRequests.Add(entity);
        await database.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, ToResponse(entity));
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "admin,staff")]
    public async Task<ActionResult<TransportRequestResponse>> UpdateStatus(
        Guid id,
        UpdateTransportRequestStatus request,
        CancellationToken cancellationToken)
    {
        var entity = await database.TransportRequests
            .Include(item => item.CreatedBy)
            .Include(item => item.Students)
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (entity is null)
            return NotFound("The transport request was not found.");

        if (!Enum.TryParse<RequestStatus>(request.Status, true, out var status))
            return BadRequest("Status must be Pending, Approved, Declined, Cancelled or Completed.");

        entity.Status = status;
        entity.ReviewedAt = DateTimeOffset.UtcNow;
        entity.ReviewedById = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value is string reviewerId && Guid.TryParse(reviewerId, out var parsedReviewerId) ? parsedReviewerId : null;
        entity.ReviewNotes = request.ReviewNotes;
        await database.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(entity));
    }

    [HttpPut("{id:guid}/assignment")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<AssignmentResponse>> Assign(Guid id, AssignmentRequest request, CancellationToken cancellationToken)
    {
        var transportRequest = await database.TransportRequests
            .Include(item => item.Students).ThenInclude(item => item.Student).ThenInclude(item => item!.User)
            .Include(item => item.Students).ThenInclude(item => item.Student).ThenInclude(item => item!.Addresses)
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (transportRequest is null) return NotFound("The transport request was not found.");
        if (transportRequest.Status != RequestStatus.Approved) return BadRequest("Approve the booking before assigning a driver and van.");
        if (string.IsNullOrWhiteSpace(transportRequest.Destination)) return BadRequest("The booking must have a destination before assignment.");

        var route = await database.Routes.Include(item => item.Stops)
            .SingleOrDefaultAsync(item => item.RequestId == id, cancellationToken);
        var van = await database.Vans.FindAsync([request.VanId], cancellationToken);
        if (van is null || van.Status is VanStatus.Maintenance or VanStatus.Inactive) return BadRequest("The selected van is unavailable.");
        if (van.Status == VanStatus.Assigned && route?.VanId != van.Id) return BadRequest("The selected van is already assigned to another booking.");
        var driver = await database.Users.SingleOrDefaultAsync(user => user.Id == request.DriverUserId && user.Role == UserRole.Driver && user.Status == "active", cancellationToken);
        if (driver is null) return BadRequest("The selected driver is not active.");
        if (transportRequest.Students.Count > van.Capacity)
            return BadRequest("The van capacity is too small for this booking.");
        var profile = await database.DriverProfiles.SingleOrDefaultAsync(item => item.UserId == driver.Id, cancellationToken);
        if (profile is null)
        {
            profile = new DriverProfile { UserId = driver.Id };
            database.DriverProfiles.Add(profile);
        }
        if (route is null)
        {
            route = new FleetBooking.Api.Models.Route { RequestId = id };
            database.Routes.Add(route);
        }
        var routeSetupError = await JourneyRouteBuilder.EnsureStopsAndAttendanceAsync(database, route, transportRequest, cancellationToken);
        if (routeSetupError is not null) return BadRequest(routeSetupError);

        if (route.VanId is Guid previousVanId && previousVanId != van.Id)
        {
            var previousVan = await database.Vans.FindAsync([previousVanId], cancellationToken);
            if (previousVan?.Status == VanStatus.Assigned) previousVan.Status = VanStatus.Available;
        }
        route.VanId = van.Id;
        route.DriverId = profile.Id;
        route.Status = "assigned";
        van.Status = VanStatus.Assigned;
        await database.SaveChangesAsync(cancellationToken);
        return Ok(new AssignmentResponse(route.Id, van.Id, van.RegistrationNumber, driver.Id, driver.FullName, route.Status));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var request = await database.TransportRequests
            .Include(item => item.Students)
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (request is null) return NotFound("The transport request was not found.");

        await using var transaction = await database.Database.BeginTransactionAsync(cancellationToken);
        var routes = await database.Routes.Where(item => item.RequestId == id).ToListAsync(cancellationToken);
        var routeIds = routes.Select(item => item.Id).ToArray();
        if (routeIds.Length > 0)
        {
            var stops = await database.RouteStops.Where(item => routeIds.Contains(item.RouteId)).ToListAsync(cancellationToken);
            var stopIds = stops.Select(item => item.Id).ToArray();
            if (stopIds.Length > 0)
                database.PassengerAttendance.RemoveRange(await database.PassengerAttendance.Where(item => stopIds.Contains(item.RouteStopId)).ToListAsync(cancellationToken));
            database.RouteStops.RemoveRange(stops);
            foreach (var route in routes)
            {
                if (route.VanId is Guid vanId)
                {
                    var van = await database.Vans.FindAsync([vanId], cancellationToken);
                    if (van is not null && van.Status == VanStatus.Assigned) van.Status = VanStatus.Available;
                }
            }
            database.Routes.RemoveRange(routes);
        }
        database.RequestStudents.RemoveRange(request.Students);
        database.TransportRequests.Remove(request);
        await database.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return NoContent();
    }

    private static TransportRequestResponse ToResponse(TransportRequest request, string? vanRegistration = null, string? driverName = null) => new(
        request.Id,
        request.Title,
        request.JourneyType,
        request.JourneyDate,
        request.PlannedStartTime,
        request.Destination,
        request.Status,
        request.CreatedBy?.FullName,
        request.Students.Count,
        vanRegistration,
        driverName,
        request.CreatedAt);
}

public sealed record CreateTransportRequest(
    Guid CreatedById,
    JourneyType JourneyType,
    string Title,
    string? Description,
    string JourneyDate,
    string PlannedStartTime,
    string? PlannedEndTime,
    string? StandardPickupLocation,
    string Destination,
    IReadOnlyCollection<Guid> StudentIds);

public sealed record TransportRequestResponse(
    Guid Id,
    string Title,
    JourneyType JourneyType,
    DateOnly JourneyDate,
    TimeOnly PlannedStartTime,
    string Destination,
    RequestStatus Status,
    string? CreatedBy,
    int StudentCount,
    string? VanRegistration,
    string? DriverName,
    DateTimeOffset CreatedAt);

public sealed record TransportRequestDetailResponse(
    Guid Id,
    string Title,
    JourneyType JourneyType,
    DateOnly JourneyDate,
    TimeOnly PlannedStartTime,
    TimeOnly? PlannedEndTime,
    string? PickupLocation,
    string Destination,
    RequestStatus Status,
    string? CreatedBy,
    string? VanRegistration,
    string? DriverName,
    DateTimeOffset CreatedAt,
    IEnumerable<RequestStudentResponse> Students);

public sealed record RequestStudentResponse(Guid Id, string Name, string? StudentNumber, string? Address);

public sealed record UpdateTransportRequestStatus(string Status, string? ReviewNotes);
public sealed record AssignmentRequest(Guid VanId, Guid DriverUserId);
public sealed record AssignmentResponse(Guid RouteId, Guid VanId, string VanRegistration, Guid DriverUserId, string DriverName, string Status);
