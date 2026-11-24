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
        if (string.IsNullOrWhiteSpace(request.Destination))
            return "A destination is required before this journey can be assigned.";

        var students = request.Students
            .OrderBy(item => item.Student?.StudentNumber)
            .ToList();
        var stops = route.Stops.OrderBy(item => item.StopOrder).ToList();
        var isHomePickup = request.JourneyType == JourneyType.StudentHomePickup;
        List<string> studentAddresses = isHomePickup
            ? students.Select(item => CurrentAddress(item.Student) ?? string.Empty).ToList()
            : [];

        if (stops.Count == 0)
        {
            if (isHomePickup)
            {
                var missingAddressIndex = studentAddresses.FindIndex(string.IsNullOrWhiteSpace);
                if (missingAddressIndex >= 0)
                    return "A current address is required for every student before assigning this home-pickup journey.";

                foreach (var address in studentAddresses)
                {
                    if (!stops.Any(stop => SameAddress(stop.Address, address)))
                    {
                        var stop = new RouteStop
                        {
                            RouteId = route.Id,
                            StopOrder = stops.Count + 1,
                            Address = address,
                            PlannedArrival = stops.Count == 0 ? request.PlannedStartTime : null,
                        };
                        stops.Add(stop);
                        route.Stops.Add(stop);
                    }
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.StandardPickupLocation))
                    return "A pickup location is required before this journey can be assigned.";

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
            var address = isHomePickup ? studentAddresses[index] : null;
            var stop = isHomePickup && !string.IsNullOrWhiteSpace(address)
                ? pickupStops.FirstOrDefault(item => SameAddress(item.Address, address))
                    ?? (pickupStops.Count >= students.Count ? pickupStops[index] : pickupStops[0])
                : pickupStops[0];

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

    private static string? CurrentAddress(StudentProfile? student) =>
        student?.Addresses
            .Where(address => address.IsCurrent)
            .OrderByDescending(address => address.CreatedAt)
            .Select(address => address.AddressLine.Trim())
            .FirstOrDefault();

    private static bool SameAddress(string left, string? right) =>
        string.Equals(left.Trim(), right?.Trim(), StringComparison.OrdinalIgnoreCase);
}
