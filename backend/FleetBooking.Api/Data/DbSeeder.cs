using FleetBooking.Api.Models;
using FleetBooking.Api.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RouteEntity = FleetBooking.Api.Models.Route;

namespace FleetBooking.Api.Data;

public static class DbSeeder
{
    // Demo password for freshly seeded accounts; rotate via Manage Users.
    public const string DemoPassword = "Vision@2026";
    private static readonly Guid SeededMorningRequestId = Guid.Parse("20000000-0000-0000-0000-000000003001");
    private static readonly Guid SeededMorningRouteId = Guid.Parse("20000000-0000-0000-0000-000000004001");

    public static void Seed(FleetDbContext db)
    {
        if (db.Users.Any())
            return;

        var now = DateTimeOffset.UtcNow;
        var admin = new User { Id = Guid.Parse("20000000-0000-0000-0000-000000000001"), FullName = "Tien Thanh Nguyen", Email = "thanh@visioncollege.ac.nz", PasswordHash = PasswordService.Hash(DemoPassword), Role = UserRole.Admin, Phone = "+64 21 000 0001", CreatedAt = now };
        var staff = new User { Id = Guid.Parse("20000000-0000-0000-0000-000000000002"), FullName = "Daniel Owusu", Email = "daniel.owusu@visioncollege.ac.nz", PasswordHash = PasswordService.Hash(DemoPassword), Role = UserRole.Staff, Phone = "+64 21 000 0002", CreatedAt = now };
        var driver = new User { Id = Guid.Parse("20000000-0000-0000-0000-000000000003"), FullName = "Kwame Asare", Email = "kwame.asare@visioncollege.ac.nz", PasswordHash = PasswordService.Hash(DemoPassword), Role = UserRole.Driver, Phone = "+64 21 000 0003", CreatedAt = now };
        db.Users.AddRange(admin, staff, driver);
        var driverProfile = new DriverProfile { Id = Guid.Parse("20000000-0000-0000-0000-000000005001"), UserId = driver.Id, LicenceNumber = "NZ-DL-88921", LicenceExpiry = new DateOnly(DateTime.UtcNow.Year + 3, 6, 30), Notes = "P-E endorsement, school transport trained." };
        db.DriverProfiles.Add(driverProfile);

        var vans = new List<Van>
        {
            new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000101"), RegistrationNumber = "VC-01", Name = "Toyota Coaster A", Capacity = 18 },
            new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000102"), RegistrationNumber = "VC-02", Name = "Toyota Coaster B", Capacity = 18 },
            new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000103"), RegistrationNumber = "VC-03", Name = "Ford Transit A", Capacity = 15 },
            new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000104"), RegistrationNumber = "VC-04", Name = "Ford Transit B", Capacity = 15 },
            new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000106"), RegistrationNumber = "VC-06", Name = "Mercedes Sprinter", Capacity = 15 },
        };
        db.Vans.AddRange(vans);

        var students = new List<StudentProfile>();
        string[,] seed =
        {
            { "V1001", "Aroha Ngata", "Year 11", "12 Cornwall Park Rd, Grafton, Auckland 1023" },
            { "V1002", "Manu Rei", "Year 12", "48 Kingsland Dr, Kingsland, Auckland 1021" },
            { "V1003", "Grace Tui", "Year 11", "7 Symonds St, Grafton, Auckland 1023" },
            { "V1004", "Liam Walker", "Year 13", "220 Newmarket Hwy, Newmarket, Auckland 1023" },
            { "V1005", "Sina Faleolo", "Year 12", "35 Remuera Rd, Remuera, Auckland 1050" },
            { "V1006", "Hemi Barlow", "Year 10", "9 Ponsonby Rd, Ponsonby, Auckland 1044" },
        };
        for (var i = 0; i < seed.GetLength(0); i++)
        {
            // Students keep a portal-user row for their identity (name/email);
            // the login endpoints block Student accounts from signing in.
            var studentUser = new User
            {
                Id = Guid.Parse($"20000000-0000-0000-0000-0000000060{i:D2}"),
                FullName = seed[i, 1],
                Email = $"{seed[i, 0].ToLowerInvariant()}@student.visioncollege.ac.nz",
                PasswordHash = "managed-by-portal",
                Role = UserRole.Student,
                CreatedAt = now,
            };
            db.Users.Add(studentUser);
            var student = new StudentProfile
            {
                Id = Guid.Parse($"20000000-0000-0000-0000-0000000020{i:D2}"),
                UserId = studentUser.Id,
                User = studentUser,
                StudentNumber = seed[i, 0],
                YearLevel = seed[i, 2],
                EmergencyNotes = "Standard school transport.",
            };
            student.Addresses.Add(new StudentAddress { AddressLine = seed[i, 3], City = "Auckland", IsCurrent = true, CreatedAt = now });
            students.Add(student);
        }
        db.StudentProfiles.AddRange(students);

        var approved = new TransportRequest
        {
            Id = SeededMorningRequestId,
            CreatedById = staff.Id,
            JourneyType = JourneyType.StandardVanBooking,
            Title = "Morning shuttle — Grafton loop",
            Description = "Group transport from Grafton Bridge to Vision College, Auckland City Campus.",
            JourneyDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            PlannedStartTime = new TimeOnly(7, 30),
            PlannedEndTime = new TimeOnly(8, 30),
            StandardPickupLocation = "Grafton Bridge",
            Destination = "Vision College, Auckland City Campus",
            Status = RequestStatus.Approved,
            ReviewedById = admin.Id,
            ReviewedAt = now,
            ReviewNotes = "Approved for the term.",
            CreatedAt = now,
        };
        var pending = new TransportRequest
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000003002"),
            CreatedById = staff.Id,
            JourneyType = JourneyType.ReturnStudentTransport,
            Title = "Sports trip return — botanic gardens",
            Description = "Late return run for the cross-country squad.",
            JourneyDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
            PlannedStartTime = new TimeOnly(16, 0),
            StandardPickupLocation = "Mysol Park Ave",
            Destination = "Vision College, Auckland City Campus",
            Status = RequestStatus.Pending,
            CreatedAt = now,
        };
        approved.Students.Add(new RequestStudent { StudentId = students[0].Id });
        approved.Students.Add(new RequestStudent { StudentId = students[1].Id });
        approved.Students.Add(new RequestStudent { StudentId = students[2].Id });
        pending.Students.Add(new RequestStudent { StudentId = students[3].Id, SpecialNotes = "Carries sports equipment." });
        db.TransportRequests.AddRange(approved, pending);

        var route = new RouteEntity { Id = SeededMorningRouteId, RequestId = approved.Id, VanId = vans[0].Id, DriverId = driverProfile.Id, Status = "assigned" };
        var pickupStop = new RouteStop { RouteId = route.Id, StopOrder = 1, Address = approved.StandardPickupLocation, PlannedArrival = approved.PlannedStartTime };
        route.Stops.Add(pickupStop);
        route.Stops.Add(new RouteStop { RouteId = route.Id, StopOrder = 2, Address = approved.Destination, PlannedArrival = approved.PlannedEndTime });
        foreach (var requestStudent in approved.Students)
            db.PassengerAttendance.Add(new PassengerAttendance { RouteStopId = pickupStop.Id, StudentId = requestStudent.StudentId, Status = "pending" });
        db.Routes.Add(route);
        vans[0].Status = VanStatus.Assigned;

        db.SaveChanges();
    }

    public static async Task<bool> NormalizeLegacySeedJourneyAsync(
        FleetDbContext db,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var request = await db.TransportRequests
            .Include(item => item.Students)
            .SingleOrDefaultAsync(item => item.Id == SeededMorningRequestId, cancellationToken);
        if (request is null
            || request.JourneyType != JourneyType.StudentHomePickup)
            return false;
        if (string.IsNullOrWhiteSpace(request.StandardPickupLocation)
            || string.IsNullOrWhiteSpace(request.Destination))
        {
            logger.LogError("The legacy seeded morning journey {RequestId} cannot be normalized because its pickup or destination is missing.", request.Id);
            return false;
        }

        var route = await db.Routes
            .Include(item => item.Stops)
            .SingleOrDefaultAsync(item => item.Id == SeededMorningRouteId && item.RequestId == request.Id, cancellationToken);
        var attendance = new List<PassengerAttendance>();
        var extraStops = new List<RouteStop>();
        if (route is not null)
        {
            var stopIds = route.Stops.Select(item => item.Id).ToArray();
            attendance = stopIds.Length == 0
                ? []
                : await db.PassengerAttendance
                    .Where(item => stopIds.Contains(item.RouteStopId))
                    .ToListAsync(cancellationToken);
            if (!string.Equals(route.Status, "assigned", StringComparison.OrdinalIgnoreCase)
                || route.Stops.Any(item => item.ActualArrival is not null)
                || attendance.Any(item => !string.Equals(item.Status, "pending", StringComparison.OrdinalIgnoreCase) || item.RecordedAt is not null))
            {
                logger.LogWarning("The legacy seeded morning journey {RequestId} is already in progress and was not changed.", request.Id);
                return false;
            }

            var existingStops = route.Stops.OrderBy(item => item.StopOrder).ToList();
            var pickupStop = existingStops.FirstOrDefault(item => !SameAddress(item.Address, request.Destination))
                ?? existingStops.FirstOrDefault();
            if (pickupStop is null)
            {
                pickupStop = new RouteStop { RouteId = route.Id, Address = string.Empty };
                route.Stops.Add(pickupStop);
            }

            var destinationStop = existingStops.FirstOrDefault(item =>
                    item.Id != pickupStop.Id && SameAddress(item.Address, request.Destination))
                ?? existingStops.FirstOrDefault(item => item.Id != pickupStop.Id);
            if (destinationStop is null)
            {
                destinationStop = new RouteStop { RouteId = route.Id, Address = string.Empty };
                route.Stops.Add(destinationStop);
            }

            pickupStop.StopOrder = 1;
            pickupStop.Address = request.StandardPickupLocation.Trim();
            pickupStop.PlannedArrival = request.PlannedStartTime;
            destinationStop.StopOrder = 2;
            destinationStop.Address = request.Destination.Trim();
            destinationStop.PlannedArrival = request.PlannedEndTime;

            foreach (var record in attendance)
                record.RouteStopId = pickupStop.Id;
            var passengerIds = attendance.Select(item => item.StudentId).ToHashSet();
            foreach (var requestStudent in request.Students)
            {
                if (passengerIds.Add(requestStudent.StudentId))
                {
                    db.PassengerAttendance.Add(new PassengerAttendance
                    {
                        RouteStopId = pickupStop.Id,
                        StudentId = requestStudent.StudentId,
                        Status = "pending",
                    });
                }
            }

            extraStops = existingStops
                .Where(item => item.Id != pickupStop.Id && item.Id != destinationStop.Id)
                .ToList();
        }

        request.JourneyType = JourneyType.StandardVanBooking;
        request.Title = "Morning shuttle — Grafton loop";
        request.Description = "Group transport from Grafton Bridge to Vision College, Auckland City Campus.";
        await db.SaveChangesAsync(cancellationToken);
        if (route is not null && extraStops.Count > 0)
        {
            foreach (var stop in extraStops)
                route.Stops.Remove(stop);
            db.RouteStops.RemoveRange(extraStops);
            await db.SaveChangesAsync(cancellationToken);
        }
        await transaction.CommitAsync(cancellationToken);
        logger.LogInformation("Converted the legacy seeded home-pickup journey {RequestId} to a standard single-pickup route.", request.Id);
        return true;
    }

    private static bool SameAddress(string left, string right) =>
        string.Equals(left.Trim(), right.Trim(), StringComparison.OrdinalIgnoreCase);
}
