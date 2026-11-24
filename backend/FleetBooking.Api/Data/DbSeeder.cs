using FleetBooking.Api.Models;
using FleetBooking.Api.Security;
using RouteEntity = FleetBooking.Api.Models.Route;

namespace FleetBooking.Api.Data;

public static class DbSeeder
{
    // Demo password for freshly seeded accounts; rotate via Manage Users.
    public const string DemoPassword = "Vision@2026";

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
            Id = Guid.Parse("20000000-0000-0000-0000-000000003001"),
            CreatedById = staff.Id,
            JourneyType = JourneyType.StudentHomePickup,
            Title = "Morning pickup — Grafton loop",
            Description = "Daily AM pickup for five students from the Grafton area.",
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

        var route = new RouteEntity { Id = Guid.Parse("20000000-0000-0000-0000-000000004001"), RequestId = approved.Id, VanId = vans[0].Id, DriverId = driverProfile.Id, Status = "assigned" };
        route.Stops.Add(new RouteStop { RouteId = route.Id, StopOrder = 1, Address = seed[0, 3], PlannedArrival = new TimeOnly(7, 30) });
        route.Stops.Add(new RouteStop { RouteId = route.Id, StopOrder = 2, Address = seed[1, 3], PlannedArrival = new TimeOnly(7, 45) });
        route.Stops.Add(new RouteStop { RouteId = route.Id, StopOrder = 3, Address = seed[2, 3], PlannedArrival = new TimeOnly(8, 0) });
        db.Routes.Add(route);
        vans[0].Status = VanStatus.Assigned;

        db.SaveChanges();
    }
}
