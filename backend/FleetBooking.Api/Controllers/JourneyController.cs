using FleetBooking.Api.Data;
using FleetBooking.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace FleetBooking.Api.Controllers;

[ApiController]
[Route("api/journeys")]
[Authorize]
public sealed class JourneyController(FleetDbContext database) : ControllerBase
{
    [HttpGet("attendance")]
    public async Task<ActionResult<IEnumerable<AttendanceResponse>>> GetAttendance(CancellationToken cancellationToken)
    {
        var records = await (from attendance in database.PassengerAttendance
                              join student in database.StudentProfiles on attendance.StudentId equals student.Id
                              join studentUser in database.Users on student.UserId equals (Guid?)studentUser.Id into studentUsers
                              from studentUser in studentUsers.DefaultIfEmpty()
                              orderby student.StudentNumber
                              select new AttendanceResponse(attendance.Id, studentUser == null ? student.StudentNumber : studentUser.FullName, attendance.Status, attendance.RecordedAt))
            .AsNoTracking().ToListAsync(cancellationToken);
        return Ok(records);
    }

    [HttpGet("route")]
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
        database.RouteStops.RemoveRange(route.Stops);
        route.Stops = request.Stops.Select((stop, index) => new RouteStop { RouteId = id, StopOrder = index + 1, Address = stop.Address, PlannedArrival = stop.PlannedArrival }).ToList();
        route.Status = "planned";
        await database.SaveChangesAsync(cancellationToken);
        return Ok(new RouteResponse(route.Id, route.RequestId, route.VanId, route.DriverId, route.Status, route.Stops.OrderBy(stop => stop.StopOrder).Select(stop => new StopResponse(stop.Id, stop.StopOrder, stop.Address, stop.PlannedArrival, stop.ActualArrival))));
    }

    [HttpGet("monitoring")]
    public async Task<ActionResult<MonitoringResponse>> GetMonitoring(CancellationToken cancellationToken)
    {
        var route = await database.Routes.AsNoTracking().Include(item => item.Stops).OrderByDescending(item => item.Status == "active").ThenByDescending(item => item.Id).FirstOrDefaultAsync(cancellationToken);
        if (route is null) return NotFound("No journey is currently available.");
        return Ok(new MonitoringResponse(route.Id, route.RequestId, route.Status, route.Stops.Count(item => item.ActualArrival is not null), route.Stops.Count, route.Stops.OrderBy(item => item.StopOrder).Select(item => new StopResponse(item.Id, item.StopOrder, item.Address, item.PlannedArrival, item.ActualArrival))));
    }

    [HttpPut("attendance/{id:guid}")]
    public async Task<IActionResult> UpdateAttendance(Guid id, AttendanceUpdate request, CancellationToken cancellationToken)
    {
        var attendance = await database.PassengerAttendance.FindAsync([id], cancellationToken);
        if (attendance is null) return NotFound("Attendance record was not found.");
        attendance.Status = request.Status;
        attendance.RecordedAt = DateTimeOffset.UtcNow;
        await database.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}

public sealed record RouteResponse(Guid Id, Guid RequestId, Guid? VanId, Guid? DriverId, string Status, IEnumerable<StopResponse> Stops);
public sealed record StopResponse(Guid Id, int Order, string Address, TimeOnly? PlannedArrival, DateTimeOffset? ActualArrival);
public sealed record AttendanceUpdate(string Status);
public sealed record AttendanceResponse(Guid Id, string Name, string Status, DateTimeOffset? RecordedAt);
public sealed record SaveStopsRequest(IReadOnlyCollection<SaveStopRequest> Stops);
public sealed record SaveStopRequest(string Address, TimeOnly? PlannedArrival);
public sealed record MonitoringResponse(Guid RouteId, Guid RequestId, string Status, int CompletedStops, int TotalStops, IEnumerable<StopResponse> Stops);
