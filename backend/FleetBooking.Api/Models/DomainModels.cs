namespace FleetBooking.Api.Models;

public enum UserRole { Admin, Staff, Driver, Student, Parent }
public enum RequestStatus { Pending, Approved, Declined, Cancelled, Completed }
public enum JourneyType { StandardVanBooking, StudentHomePickup, StudentHomeDropoff, ReturnStudentTransport }
public enum VanStatus { Available, Assigned, Maintenance, Inactive }

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public string Status { get; set; } = "active";
    public string? Phone { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class StudentProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public required string StudentNumber { get; set; }
    public string? YearLevel { get; set; }
    public string? EmergencyNotes { get; set; }
    public User? User { get; set; }
    public ICollection<StudentAddress> Addresses { get; set; } = [];
}

public sealed class DriverProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string? LicenceNumber { get; set; }
    public DateOnly? LicenceExpiry { get; set; }
    public string? Notes { get; set; }
    public User? User { get; set; }
}

public sealed class StudentAddress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public required string AddressLine { get; set; }
    public string? Suburb { get; set; }
    public string? City { get; set; }
    public string? Postcode { get; set; }
    public bool IsCurrent { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public StudentProfile? Student { get; set; }
}

public sealed class StudentChangeRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Guid RequestedById { get; set; }
    public required string AddressLine { get; set; }
    public string? Suburb { get; set; }
    public string? City { get; set; }
    public string? Postcode { get; set; }
    public string Status { get; set; } = "pending";
    public Guid? ReviewedById { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Van
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string RegistrationNumber { get; set; }
    public string? Name { get; set; }
    public int Capacity { get; set; }
    public VanStatus Status { get; set; } = VanStatus.Available;
    public string? Notes { get; set; }
}

public sealed class TransportRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CreatedById { get; set; }
    public JourneyType JourneyType { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateOnly JourneyDate { get; set; }
    public TimeOnly PlannedStartTime { get; set; }
    public TimeOnly? PlannedEndTime { get; set; }
    public string? StandardPickupLocation { get; set; }
    public required string Destination { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public Guid? ReviewedById { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? ReviewNotes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public User? CreatedBy { get; set; }
    public ICollection<RequestStudent> Students { get; set; } = [];
}

public sealed class RequestStudent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public Guid StudentId { get; set; }
    public string? SpecialNotes { get; set; }
    public TransportRequest? Request { get; set; }
    public StudentProfile? Student { get; set; }
}

public sealed class Route
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public Guid? VanId { get; set; }
    public Guid? DriverId { get; set; }
    public string Status { get; set; } = "planned";
    public ICollection<RouteStop> Stops { get; set; } = [];
}

public sealed class RouteStop
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RouteId { get; set; }
    public int StopOrder { get; set; }
    public required string Address { get; set; }
    public TimeOnly? PlannedArrival { get; set; }
    public DateTimeOffset? ActualArrival { get; set; }
    public Route? Route { get; set; }
}

public sealed class PassengerAttendance
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RouteStopId { get; set; }
    public Guid StudentId { get; set; }
    public required string Status { get; set; }
    public DateTimeOffset? RecordedAt { get; set; }
}
