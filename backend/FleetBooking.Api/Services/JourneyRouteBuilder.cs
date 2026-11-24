using FleetBooking.Api.Data;
using FleetBooking.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FleetBooking.Api.Services;

public static class JourneyRouteBuilder
{
    public static async Task<string?> EnsureStopsAndAttendanceAsync(
        FleetDbContext database,
        FleetBooking.Api.Models.Route route,
        TransportRequest request,
        CancellationToken cancellationToken)
    {
        if (request.JourneyType is JourneyType.StudentHomePickup or JourneyType.StudentHomeDropoff)
            return "Home pickup and home drop-off are no longer supported. Create a standard booking with one pickup location and a destination.";
        if (string.IsNullOrWhiteSpace(request.Destination))
            return "A destination is required before this journey can be assigned.";
        if (string.IsNullOrWhiteSpace(request.StandardPickupLocation))
            return "A pickup location is required before this journey can be assigned.";

        var students = request.Students
            .OrderBy(item => item.Student?.StudentNumber)
            .ToList();
        var stops = route.Stops.OrderBy(item => item.StopOrder).ToList();

        if (stops.Count == 0)
        {
            var pickupStop = new RouteStop
            {
                RouteId = route.Id,
                StopOrder = 1,
                Address = request.StandardPickupLocation.Trim(),
                PlannedArrival = request.PlannedStartTime,
            };
            stops.Add(pickupStop);
            route.Stops.Add(pickupStop);
        }

        var destinationStop = stops.FirstOrDefault(stop => SameAddress(stop.Address, request.Destination));
        if (students.Count > 0 && destinationStop is not null && stops.Count == 1)
            return "At least one pickup stop is required for the selected passengers.";

        if (destinationStop is null)
        {
            destinationStop = new RouteStop
            {
                RouteId = route.Id,
                StopOrder = stops.Count == 0 ? 1 : stops.Max(stop => stop.StopOrder) + 1,
                Address = request.Destination.Trim(),
                PlannedArrival = request.PlannedEndTime,
            };
            stops.Add(destinationStop);
            route.Stops.Add(destinationStop);
        }

        var pickupStops = stops
            .Where(stop => !ReferenceEquals(stop, destinationStop))
            .ToList();
        if (students.Count > 0 && pickupStops.Count == 0)
            return "At least one pickup stop is required for the selected passengers.";

        var stopIds = pickupStops.Select(stop => stop.Id).ToArray();
        var existingAttendance = stopIds.Length == 0
            ? []
            : await database.PassengerAttendance
                .Where(item => stopIds.Contains(item.RouteStopId))
                .ToListAsync(cancellationToken);

        for (var index = 0; index < students.Count; index++)
        {
            var requestStudent = students[index];
            var stop = pickupStops[0];

            if (existingAttendance.Any(item => item.RouteStopId == stop.Id && item.StudentId == requestStudent.StudentId))
                continue;

            var attendance = new PassengerAttendance
            {
                RouteStopId = stop.Id,
                StudentId = requestStudent.StudentId,
                Status = "pending",
            };
            database.PassengerAttendance.Add(attendance);
            existingAttendance.Add(attendance);
        }

        return null;
    }

    private static bool SameAddress(string left, string? right) =>
        string.Equals(left.Trim(), right?.Trim(), StringComparison.OrdinalIgnoreCase);
}
