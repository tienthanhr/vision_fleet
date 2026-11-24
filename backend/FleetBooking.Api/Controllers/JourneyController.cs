using System.Security.Claims;
using FleetBooking.Api.Data;
using FleetBooking.Api.Models;
using FleetBooking.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace FleetBooking.Api.Controllers;

[ApiController]
[Route("api/journeys")]
[Authorize]
public sealed class JourneyController(FleetDbContext database) : ControllerBase
{
    [HttpGet("assigned")]
    [Authorize(Roles = "driver")]
    public async Task<ActionResult<IEnumerable<AssignedJourneyResponse>>> GetAssigned(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var parsedUserId)) return Unauthorized();
        var driverProfileId = await database.DriverProfiles
            .Where(item => item.UserId == parsedUserId)
            .Select(item => (Guid?)item.Id)
            .SingleOrDefaultAsync(cancellationToken);
        if (driverProfileId is null) return Ok(Array.Empty<AssignedJourneyResponse>());

        var routes = await database.Routes
            .Include(item => item.Stops)
            .Where(item => item.DriverId == driverProfileId)
            .ToListAsync(cancellationToken);
        if (routes.Count == 0) return Ok(Array.Empty<AssignedJourneyResponse>());

        var requestIds = routes.Select(item => item.RequestId).Distinct().ToArray();
        var requests = await database.TransportRequests
            .Include(item => item.Students).ThenInclude(item => item.Student).ThenInclude(item => item!.User)
            .Include(item => item.Students).ThenInclude(item => item.Student).ThenInclude(item => item!.Addresses)
            .Where(item => requestIds.Contains(item.Id))
            .ToListAsync(cancellationToken);
        var requestsById = requests.ToDictionary(item => item.Id);
        routes = routes
            .Where(route => requestsById.TryGetValue(route.RequestId, out var request)
                && request.Status is not RequestStatus.Cancelled and not RequestStatus.Declined)
            .ToList();
        if (routes.Count == 0) return Ok(Array.Empty<AssignedJourneyResponse>());

        foreach (var route in routes)
        {
            var setupError = await JourneyRouteBuilder.EnsureStopsAndAttendanceAsync(
                database, route, requestsById[route.RequestId], cancellationToken);
            if (setupError is not null) return Conflict(setupError);
        }
        await database.SaveChangesAsync(cancellationToken);

        var stopIds = routes.SelectMany(item => item.Stops.Select(stop => stop.Id)).ToArray();
        var passengers = await (
            from attendance in database.PassengerAttendance.AsNoTracking()
            join student in database.StudentProfiles.AsNoTracking() on attendance.StudentId equals student.Id
            join studentUser in database.Users.AsNoTracking() on student.UserId equals (Guid?)studentUser.Id into studentUsers
            from studentUser in studentUsers.DefaultIfEmpty()
            where stopIds.Contains(attendance.RouteStopId)
            select new DriverPassengerResponse(
                attendance.StudentId,
                attendance.Id,
                attendance.RouteStopId,
                studentUser == null ? student.StudentNumber : studentUser.FullName,
                student.StudentNumber,
                attendance.Status,
                attendance.RecordedAt))
            .ToListAsync(cancellationToken);
        var vanIds = routes.Where(item => item.VanId.HasValue).Select(item => item.VanId!.Value).Distinct().ToArray();
        var vans = await database.Vans.AsNoTracking()
            .Where(item => vanIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, cancellationToken);

        var response = routes
            .OrderByDescending(item => item.Status == "active")
            .ThenBy(item => requestsById[item.RequestId].JourneyDate)
            .ThenBy(item => requestsById[item.RequestId].PlannedStartTime)
            .Select(route =>
            {
                var request = requestsById[route.RequestId];
                var van = route.VanId is Guid vanId && vans.TryGetValue(vanId, out var assignedVan) ? assignedVan : null;
                return new AssignedJourneyResponse(
                    route.Id,
                    request.Id,
                    request.Title,
                    request.JourneyType,
                    request.JourneyDate,
                    request.PlannedStartTime,
                    request.PlannedEndTime,
                    request.StandardPickupLocation,
                    request.Destination,
                    route.Status,
                    van?.RegistrationNumber,
                    van?.Name,
                    route.Stops.OrderBy(stop => stop.StopOrder).Select(stop => new DriverStopResponse(
                        stop.Id,
                        stop.StopOrder,
                        stop.Address,
                        stop.PlannedArrival,
                        stop.ActualArrival,
                        passengers.Where(passenger => passenger.RouteStopId == stop.Id))));
            })
            .ToList();
        return Ok(response);
    }

    [HttpGet("attendance")]
    [Authorize(Roles = "admin,staff,driver")]
    public async Task<ActionResult<IEnumerable<AttendanceResponse>>> GetAttendance(
        [FromQuery] Guid? routeId,
        CancellationToken cancellationToken)
    {
        var query =
            from attendance in database.PassengerAttendance.AsNoTracking()
            join stop in database.RouteStops.AsNoTracking() on attendance.RouteStopId equals stop.Id
            join route in database.Routes.AsNoTracking() on stop.RouteId equals route.Id
            join student in database.StudentProfiles.AsNoTracking() on attendance.StudentId equals student.Id
            join studentUser in database.Users.AsNoTracking() on student.UserId equals (Guid?)studentUser.Id into studentUsers
            from studentUser in studentUsers.DefaultIfEmpty()
            select new { attendance, stop, route, student, studentUser };

        if (routeId is Guid requestedRouteId)
            query = query.Where(item => item.route.Id == requestedRouteId);

        if (User.IsInRole("driver"))
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userId, out var parsedUserId)) return Unauthorized();
            var driverProfileId = await database.DriverProfiles
                .Where(item => item.UserId == parsedUserId)
                .Select(item => (Guid?)item.Id)
                .SingleOrDefaultAsync(cancellationToken);
            if (driverProfileId is null) return Ok(Array.Empty<AttendanceResponse>());
            query = query.Where(item => item.route.DriverId == driverProfileId);
        }

        var records = await query
            .OrderBy(item => item.route.Id)
            .ThenBy(item => item.stop.StopOrder)
            .ThenBy(item => item.student.StudentNumber)
            .Select(item => new AttendanceResponse(
                item.attendance.Id,
                item.studentUser == null ? item.student.StudentNumber : item.studentUser.FullName,
                item.attendance.Status,
                item.attendance.RecordedAt,
                item.route.Id,
                item.stop.Id,
                item.stop.StopOrder,
                item.stop.Address,
                item.student.Id,
                item.student.StudentNumber))
            .ToListAsync(cancellationToken);
        return Ok(records);
    }

    [HttpGet("route")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<RouteResponse>> GetRoute([FromQuery] Guid? requestId, CancellationToken cancellationToken)
    {
        var route = await database.Routes.AsNoTracking().Include(item => item.Stops)
            .Where(item => requestId == null || item.RequestId == requestId)
            .OrderByDescending(item => item.Status == "active").ThenByDescending(item => item.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (route is null) return NotFound("No route has been created yet.");
        return Ok(new RouteResponse(route.Id, route.RequestId, route.VanId, route.DriverId, route.Status, route.Stops.OrderBy(stop => stop.StopOrder)
            .Select(stop => new StopResponse(stop.Id, stop.StopOrder, stop.Address, stop.PlannedArrival, stop.ActualArrival))));
    }

    [HttpPut("route/{id:guid}/stops")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<RouteResponse>> SaveStops(Guid id, SaveStopsRequest request, CancellationToken cancellationToken)
    {
        var route = await database.Routes.Include(item => item.Stops).SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (route is null) return NotFound("The route was not found.");
        if (request.Stops.Count == 0) return BadRequest("At least one route stop is required.");
        if (request.Stops.Any(stop => string.IsNullOrWhiteSpace(stop.Address)))
            return BadRequest("Every route stop needs an address.");

        var existingStops = route.Stops.OrderBy(item => item.StopOrder).ToList();
        var existingStopIds = existingStops.Select(item => item.Id).ToArray();
        var attendedStopIds = new HashSet<Guid>();
        if (existingStopIds.Length > 0)
        {
            attendedStopIds = (await database.PassengerAttendance
                .Where(item => existingStopIds.Contains(item.RouteStopId))
                .Select(item => item.RouteStopId)
                .ToListAsync(cancellationToken)).ToHashSet();
        }
        var retainedStopIds = new HashSet<Guid>();
        var updatedStops = new List<RouteStop>();
        for (var index = 0; index < request.Stops.Count; index++)
        {
            var requestedStop = request.Stops.ElementAt(index);
            var existing = existingStops.FirstOrDefault(item =>
                !retainedStopIds.Contains(item.Id) && SameAddress(item.Address, requestedStop.Address));
            existing ??= existingStops.ElementAtOrDefault(index) is { } stop && !retainedStopIds.Contains(stop.Id)
                ? stop
                : null;

            if (existing is null)
            {
                updatedStops.Add(new RouteStop
                {
                    RouteId = id,
                    StopOrder = index + 1,
                    Address = requestedStop.Address.Trim(),
                    PlannedArrival = requestedStop.PlannedArrival,
                });
                continue;
            }

            retainedStopIds.Add(existing.Id);
            existing.StopOrder = index + 1;
            existing.Address = requestedStop.Address.Trim();
            existing.PlannedArrival = requestedStop.PlannedArrival;
            updatedStops.Add(existing);
        }

        var removedStops = existingStops.Where(item => !retainedStopIds.Contains(item.Id)).ToList();
        if (removedStops.Any(item => attendedStopIds.Contains(item.Id)))
            return BadRequest("A stop with assigned passengers cannot be removed. Reorder it or update its address instead.");
        database.RouteStops.RemoveRange(removedStops);
        route.Stops = updatedStops;
        route.Status = "planned";
        await database.SaveChangesAsync(cancellationToken);
        return Ok(new RouteResponse(route.Id, route.RequestId, route.VanId, route.DriverId, route.Status, route.Stops.OrderBy(stop => stop.StopOrder).Select(stop => new StopResponse(stop.Id, stop.StopOrder, stop.Address, stop.PlannedArrival, stop.ActualArrival))));
    }

    [HttpGet("monitoring")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<MonitoringResponse>> GetMonitoring(CancellationToken cancellationToken)
    {
        var route = await database.Routes.AsNoTracking().Include(item => item.Stops).OrderByDescending(item => item.Status == "active").ThenByDescending(item => item.Id).FirstOrDefaultAsync(cancellationToken);
        if (route is null) return NotFound("No journey is currently available.");
        return Ok(new MonitoringResponse(route.Id, route.RequestId, route.Status, route.Stops.Count(item => item.ActualArrival is not null), route.Stops.Count, route.Stops.OrderBy(item => item.StopOrder).Select(item => new StopResponse(item.Id, item.StopOrder, item.Address, item.PlannedArrival, item.ActualArrival))));
    }

    [HttpPut("attendance/{id:guid}")]
    [Authorize(Roles = "admin,staff,driver")]
    public async Task<IActionResult> UpdateAttendance(Guid id, AttendanceUpdate request, CancellationToken cancellationToken)
    {
        var attendance = await database.PassengerAttendance.FindAsync([id], cancellationToken);
        if (attendance is null) return NotFound("Attendance record was not found.");
        var status = request.Status.Trim().ToLowerInvariant();
        if (status is not ("pending" or "picked_up" or "absent" or "dropped_off"))
            return BadRequest("Status must be pending, picked_up, absent or dropped_off.");

        if (User.IsInRole("driver"))
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userId, out var parsedUserId)) return Unauthorized();
            var driverProfileId = await database.DriverProfiles
                .Where(item => item.UserId == parsedUserId)
                .Select(item => (Guid?)item.Id)
                .SingleOrDefaultAsync(cancellationToken);
            if (driverProfileId is null) return Forbid();
            var assignedToDriver = await database.Routes.AnyAsync(route =>
                route.DriverId == driverProfileId
                && route.Stops.Any(stop => stop.Id == attendance.RouteStopId), cancellationToken);
            if (!assignedToDriver) return Forbid();
        }

        attendance.Status = status;
        attendance.RecordedAt = status == "pending" ? null : DateTimeOffset.UtcNow;
        await database.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPut("assigned/{routeId:guid}/start")]
    [Authorize(Roles = "driver")]
    public async Task<ActionResult<JourneyStatusResponse>> StartAssignedJourney(Guid routeId, CancellationToken cancellationToken)
    {
        var driverProfileId = await CurrentDriverProfileIdAsync(cancellationToken);
        if (driverProfileId is null) return Forbid();
        var route = await database.Routes.SingleOrDefaultAsync(
            item => item.Id == routeId && item.DriverId == driverProfileId, cancellationToken);
        if (route is null) return NotFound("The assigned journey was not found.");
        if (route.Status == "completed") return Conflict("This journey has already been completed.");

        route.Status = "active";
        await database.SaveChangesAsync(cancellationToken);
        return Ok(new JourneyStatusResponse(route.Id, route.Status));
    }

    [HttpPut("assigned/{routeId:guid}/stops/{stopId:guid}/arrival")]
    [Authorize(Roles = "driver")]
    public async Task<ActionResult<JourneyArrivalResponse>> MarkStopArrival(
        Guid routeId,
        Guid stopId,
        CancellationToken cancellationToken)
    {
        var driverProfileId = await CurrentDriverProfileIdAsync(cancellationToken);
        if (driverProfileId is null) return Forbid();
        var route = await database.Routes.SingleOrDefaultAsync(
            item => item.Id == routeId && item.DriverId == driverProfileId, cancellationToken);
        if (route is null) return NotFound("The assigned journey was not found.");
        var stop = await database.RouteStops.SingleOrDefaultAsync(
            item => item.Id == stopId && item.RouteId == routeId, cancellationToken);
        if (stop is null) return NotFound("The route stop was not found.");

        stop.ActualArrival ??= DateTimeOffset.UtcNow;
        route.Status = "active";
        var finalStopOrder = await database.RouteStops
            .Where(item => item.RouteId == routeId)
            .MaxAsync(item => item.StopOrder, cancellationToken);
        if (stop.StopOrder == finalStopOrder)
        {
            var stopIds = await database.RouteStops
                .Where(item => item.RouteId == routeId)
                .Select(item => item.Id)
                .ToArrayAsync(cancellationToken);
            var hasPendingPassengers = await database.PassengerAttendance
                .AnyAsync(item => stopIds.Contains(item.RouteStopId) && item.Status == "pending", cancellationToken);
            if (!hasPendingPassengers)
            {
                route.Status = "completed";
                var request = await database.TransportRequests.FindAsync([route.RequestId], cancellationToken);
                if (request is not null) request.Status = RequestStatus.Completed;
            }
        }

        await database.SaveChangesAsync(cancellationToken);
        return Ok(new JourneyArrivalResponse(route.Id, stop.Id, stop.ActualArrival, route.Status));
    }

    private async Task<Guid?> CurrentDriverProfileIdAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var parsedUserId)) return null;
        return await database.DriverProfiles
            .Where(item => item.UserId == parsedUserId)
            .Select(item => (Guid?)item.Id)
            .SingleOrDefaultAsync(cancellationToken);
    }

    private static bool SameAddress(string left, string right) =>
        string.Equals(left.Trim(), right.Trim(), StringComparison.OrdinalIgnoreCase);
}

public sealed record RouteResponse(Guid Id, Guid RequestId, Guid? VanId, Guid? DriverId, string Status, IEnumerable<StopResponse> Stops);
public sealed record StopResponse(Guid Id, int Order, string Address, TimeOnly? PlannedArrival, DateTimeOffset? ActualArrival);
public sealed record AttendanceUpdate(string Status);
public sealed record AttendanceResponse(Guid Id, string Name, string Status, DateTimeOffset? RecordedAt, Guid RouteId, Guid StopId, int StopOrder, string Address, Guid StudentId, string StudentNumber);
public sealed record SaveStopsRequest(IReadOnlyCollection<SaveStopRequest> Stops);
public sealed record SaveStopRequest(string Address, TimeOnly? PlannedArrival);
public sealed record MonitoringResponse(Guid RouteId, Guid RequestId, string Status, int CompletedStops, int TotalStops, IEnumerable<StopResponse> Stops);
public sealed record AssignedJourneyResponse(
    Guid Id,
    Guid RequestId,
    string Title,
    JourneyType JourneyType,
    DateOnly JourneyDate,
    TimeOnly PlannedStartTime,
    TimeOnly? PlannedEndTime,
    string? PickupLocation,
    string Destination,
    string Status,
    string? VanRegistration,
    string? VanName,
    IEnumerable<DriverStopResponse> Stops);
public sealed record DriverStopResponse(
    Guid Id,
    int Order,
    string Address,
    TimeOnly? PlannedArrival,
    DateTimeOffset? ActualArrival,
    IEnumerable<DriverPassengerResponse> Passengers);
public sealed record DriverPassengerResponse(
    Guid StudentId,
    Guid AttendanceId,
    Guid RouteStopId,
    string Name,
    string StudentNumber,
    string Status,
    DateTimeOffset? RecordedAt);
public sealed record JourneyStatusResponse(Guid RouteId, string Status);
public sealed record JourneyArrivalResponse(Guid RouteId, Guid StopId, DateTimeOffset? ActualArrival, string Status);
