using FleetBooking.Api.Models;
using RouteEntity = FleetBooking.Api.Models.Route;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FleetBooking.Api.Data;

// MySQL has no native type that preserves a UTC offset, so all
// DateTimeOffset values are stored as UTC datetimes.
public sealed class DateTimeOffsetToUtcConverter() : ValueConverter<DateTimeOffset, DateTime>(
    value => value.UtcDateTime,
    stored => new DateTimeOffset(DateTime.SpecifyKind(stored, DateTimeKind.Utc)));

public sealed class FleetDbContext(DbContextOptions<FleetDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<DriverProfile> DriverProfiles => Set<DriverProfile>();
    public DbSet<StudentAddress> StudentAddresses => Set<StudentAddress>();
    public DbSet<StudentChangeRequest> StudentChangeRequests => Set<StudentChangeRequest>();
    public DbSet<Van> Vans => Set<Van>();
    public DbSet<TransportRequest> TransportRequests => Set<TransportRequest>();
    public DbSet<RequestStudent> RequestStudents => Set<RequestStudent>();
    public DbSet<RouteEntity> Routes => Set<RouteEntity>();
    public DbSet<RouteStop> RouteStops => Set<RouteStop>();
    public DbSet<PassengerAttendance> PassengerAttendance => Set<PassengerAttendance>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.FullName).HasColumnName("full_name");
            entity.Property(item => item.Email).HasColumnName("email");
            entity.Property(item => item.PasswordHash).HasColumnName("password_hash");
            entity.Property(item => item.Role).HasColumnName("role").HasConversion<string>().HasMaxLength(32);
            entity.Property(item => item.Status).HasColumnName("status");
            entity.Property(item => item.Phone).HasColumnName("phone");
            entity.Property(item => item.CreatedAt).HasColumnName("created_at")
                .HasConversion<DateTimeOffsetToUtcConverter>();
        });
        modelBuilder.Entity<StudentProfile>(entity =>
        {
            entity.ToTable("student_profiles");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.UserId).HasColumnName("user_id");
            entity.Property(item => item.StudentNumber).HasColumnName("student_number");
            entity.Property(item => item.YearLevel).HasColumnName("year_level");
            entity.Property(item => item.EmergencyNotes).HasColumnName("emergency_notes");
            entity.HasOne(item => item.User).WithOne()
                .HasForeignKey<StudentProfile>(item => item.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(item => item.Addresses).WithOne(item => item.Student)
                .HasForeignKey(item => item.StudentId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<DriverProfile>(entity =>
        {
            entity.ToTable("driver_profiles");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.UserId).HasColumnName("user_id");
            entity.Property(item => item.LicenceNumber).HasColumnName("licence_number");
            entity.Property(item => item.LicenceExpiry).HasColumnName("licence_expiry");
            entity.Property(item => item.Notes).HasColumnName("notes");
            entity.HasOne(item => item.User).WithOne().HasForeignKey<DriverProfile>(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<StudentAddress>(entity =>
        {
            entity.ToTable("student_addresses");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.StudentId).HasColumnName("student_id");
            entity.Property(item => item.AddressLine).HasColumnName("address_line");
            entity.Property(item => item.Suburb).HasColumnName("suburb");
            entity.Property(item => item.City).HasColumnName("city");
            entity.Property(item => item.Postcode).HasColumnName("postcode");
            entity.Property(item => item.IsCurrent).HasColumnName("is_current");
            entity.Property(item => item.CreatedAt).HasColumnName("created_at")
                .HasConversion<DateTimeOffsetToUtcConverter>();
        });
        modelBuilder.Entity<StudentChangeRequest>(entity =>
        {
            entity.ToTable("student_change_requests");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.StudentId).HasColumnName("student_id");
            entity.Property(item => item.RequestedById).HasColumnName("requested_by_id");
            entity.Property(item => item.AddressLine).HasColumnName("address_line");
            entity.Property(item => item.Suburb).HasColumnName("suburb");
            entity.Property(item => item.City).HasColumnName("city");
            entity.Property(item => item.Postcode).HasColumnName("postcode");
            entity.Property(item => item.Status).HasColumnName("status");
            entity.Property(item => item.ReviewedById).HasColumnName("reviewed_by_id");
            entity.Property(item => item.ReviewedAt).HasColumnName("reviewed_at")
                .HasConversion<DateTimeOffsetToUtcConverter>();
            entity.Property(item => item.CreatedAt).HasColumnName("created_at")
                .HasConversion<DateTimeOffsetToUtcConverter>();
        });
        modelBuilder.Entity<Van>(entity =>
        {
            entity.ToTable("vans");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.RegistrationNumber).HasColumnName("registration_number");
            entity.Property(item => item.Name).HasColumnName("name");
            entity.Property(item => item.Capacity).HasColumnName("capacity");
            entity.Property(item => item.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(32);
            entity.Property(item => item.Notes).HasColumnName("notes");
        });
        modelBuilder.Entity<TransportRequest>(entity =>
        {
            entity.ToTable("transport_requests");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.CreatedById).HasColumnName("created_by_id");
            entity.Property(item => item.JourneyType).HasColumnName("journey_type").HasConversion<string>().HasMaxLength(64);
            entity.Property(item => item.Title).HasColumnName("title");
            entity.Property(item => item.Description).HasColumnName("description");
            entity.Property(item => item.JourneyDate).HasColumnName("journey_date");
            entity.Property(item => item.PlannedStartTime).HasColumnName("planned_start_time");
            entity.Property(item => item.PlannedEndTime).HasColumnName("planned_end_time");
            entity.Property(item => item.StandardPickupLocation).HasColumnName("standard_pickup_location");
            entity.Property(item => item.Destination).HasColumnName("destination");
            entity.Property(item => item.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(32);
            entity.Property(item => item.ReviewedById).HasColumnName("reviewed_by_id");
            entity.Property(item => item.ReviewedAt).HasColumnName("reviewed_at")
                .HasConversion<DateTimeOffsetToUtcConverter>();
            entity.Property(item => item.ReviewNotes).HasColumnName("review_notes");
            entity.Property(item => item.CreatedAt).HasColumnName("created_at")
                .HasConversion<DateTimeOffsetToUtcConverter>();
        });
        modelBuilder.Entity<RequestStudent>(entity =>
        {
            entity.ToTable("request_students");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.RequestId).HasColumnName("request_id");
            entity.Property(item => item.StudentId).HasColumnName("student_id");
            entity.Property(item => item.SpecialNotes).HasColumnName("special_notes");
        });
        modelBuilder.Entity<RouteEntity>(entity =>
        {
            entity.ToTable("routes");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.RequestId).HasColumnName("request_id");
            entity.Property(item => item.VanId).HasColumnName("van_id");
            entity.Property(item => item.DriverId).HasColumnName("driver_id");
            entity.Property(item => item.Status).HasColumnName("status");
            entity.HasMany(item => item.Stops).WithOne(item => item.Route).HasForeignKey(item => item.RouteId);
        });
        modelBuilder.Entity<RouteStop>(entity =>
        {
            entity.ToTable("route_stops");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.RouteId).HasColumnName("route_id");
            entity.Property(item => item.StopOrder).HasColumnName("stop_order");
            entity.Property(item => item.Address).HasColumnName("address");
            entity.Property(item => item.PlannedArrival).HasColumnName("planned_arrival");
            entity.Property(item => item.ActualArrival).HasColumnName("actual_arrival")
                .HasConversion<DateTimeOffsetToUtcConverter>();
        });
        modelBuilder.Entity<PassengerAttendance>(entity =>
        {
            entity.ToTable("passenger_attendance");
            entity.Property(item => item.Id).HasColumnName("id");
            entity.Property(item => item.RouteStopId).HasColumnName("route_stop_id");
            entity.Property(item => item.StudentId).HasColumnName("student_id");
            entity.Property(item => item.Status).HasColumnName("status");
            entity.Property(item => item.RecordedAt).HasColumnName("recorded_at")
                .HasConversion<DateTimeOffsetToUtcConverter>();
        });

        modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();
        modelBuilder.Entity<StudentProfile>().HasIndex(student => student.StudentNumber).IsUnique();
        modelBuilder.Entity<Van>().HasIndex(van => van.RegistrationNumber).IsUnique();
        modelBuilder.Entity<TransportRequest>()
            .HasOne(request => request.CreatedBy)
            .WithMany()
            .HasForeignKey(request => request.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<RequestStudent>()
            .HasIndex(item => new { item.RequestId, item.StudentId })
            .IsUnique();
        modelBuilder.Entity<RequestStudent>()
            .HasOne(item => item.Request)
            .WithMany(request => request.Students)
            .HasForeignKey(item => item.RequestId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<RequestStudent>()
            .HasOne(item => item.Student)
            .WithMany()
            .HasForeignKey(item => item.StudentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
