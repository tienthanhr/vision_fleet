/*
    Vision College Fleet Booking and Tracking System
    SQL Server / SSMS setup script

    Run with:
    sqlcmd -S .\SQLEXPRESS -E -i database\sqlserver-setup.sql
*/

IF DB_ID(N'FleetBooking') IS NULL
BEGIN
    CREATE DATABASE FleetBooking;
END;
GO

USE FleetBooking;
GO

IF OBJECT_ID(N'dbo.PassengerAttendance', N'U') IS NOT NULL DROP TABLE dbo.PassengerAttendance;
IF OBJECT_ID(N'dbo.JourneyEvents', N'U') IS NOT NULL DROP TABLE dbo.JourneyEvents;
IF OBJECT_ID(N'dbo.RouteStops', N'U') IS NOT NULL DROP TABLE dbo.RouteStops;
IF OBJECT_ID(N'dbo.Routes', N'U') IS NOT NULL DROP TABLE dbo.Routes;
IF OBJECT_ID(N'dbo.RequestStudents', N'U') IS NOT NULL DROP TABLE dbo.RequestStudents;
IF OBJECT_ID(N'dbo.StudentChangeRequests', N'U') IS NOT NULL DROP TABLE dbo.StudentChangeRequests;
IF OBJECT_ID(N'dbo.StudentAddresses', N'U') IS NOT NULL DROP TABLE dbo.StudentAddresses;
IF OBJECT_ID(N'dbo.TransportRequests', N'U') IS NOT NULL DROP TABLE dbo.TransportRequests;
IF OBJECT_ID(N'dbo.DriverProfiles', N'U') IS NOT NULL DROP TABLE dbo.DriverProfiles;
IF OBJECT_ID(N'dbo.Vans', N'U') IS NOT NULL DROP TABLE dbo.Vans;
IF OBJECT_ID(N'dbo.StudentProfiles', N'U') IS NOT NULL DROP TABLE dbo.StudentProfiles;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Users PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(255) NOT NULL CONSTRAINT UQ_Users_Email UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    Role NVARCHAR(20) NOT NULL CONSTRAINT CK_Users_Role CHECK (Role IN ('admin', 'staff', 'driver', 'student', 'parent')),
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Status DEFAULT 'active',
    Phone NVARCHAR(30) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE dbo.StudentProfiles (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_StudentProfiles PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    UserId UNIQUEIDENTIFIER NULL CONSTRAINT UQ_StudentProfiles_UserId UNIQUE,
    StudentNumber NVARCHAR(50) NOT NULL CONSTRAINT UQ_StudentProfiles_StudentNumber UNIQUE,
    YearLevel NVARCHAR(30) NULL,
    EmergencyNotes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_StudentProfiles_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);

CREATE TABLE dbo.Vans (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Vans PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    RegistrationNumber NVARCHAR(30) NOT NULL CONSTRAINT UQ_Vans_RegistrationNumber UNIQUE,
    Name NVARCHAR(100) NULL,
    Capacity INT NOT NULL CONSTRAINT CK_Vans_Capacity CHECK (Capacity > 0),
    Status NVARCHAR(20) NOT NULL CONSTRAINT CK_Vans_Status CHECK (Status IN ('available', 'assigned', 'maintenance', 'inactive')),
    Notes NVARCHAR(MAX) NULL
);

CREATE TABLE dbo.DriverProfiles (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_DriverProfiles PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    UserId UNIQUEIDENTIFIER NOT NULL CONSTRAINT UQ_DriverProfiles_UserId UNIQUE,
    LicenceNumber NVARCHAR(100) NULL,
    LicenceExpiry DATE NULL,
    Notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_DriverProfiles_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);

CREATE TABLE dbo.TransportRequests (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_TransportRequests PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    CreatedById UNIQUEIDENTIFIER NOT NULL,
    JourneyType NVARCHAR(40) NOT NULL CONSTRAINT CK_TransportRequests_JourneyType CHECK (JourneyType IN ('standard_van_booking', 'student_home_pickup', 'student_home_dropoff', 'return_student_transport')),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    JourneyDate DATE NOT NULL,
    PlannedStartTime TIME NOT NULL,
    PlannedEndTime TIME NULL,
    StandardPickupLocation NVARCHAR(MAX) NULL,
    Destination NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_TransportRequests_Status DEFAULT 'pending',
    ReviewedById UNIQUEIDENTIFIER NULL,
    ReviewedAt DATETIMEOFFSET NULL,
    ReviewNotes NVARCHAR(MAX) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_TransportRequests_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_TransportRequests_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT CK_TransportRequests_Status CHECK (Status IN ('pending', 'approved', 'declined', 'cancelled', 'completed')),
    CONSTRAINT FK_TransportRequests_CreatedBy FOREIGN KEY (CreatedById) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_TransportRequests_ReviewedBy FOREIGN KEY (ReviewedById) REFERENCES dbo.Users(Id)
);

CREATE TABLE dbo.RequestStudents (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_RequestStudents PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    RequestId UNIQUEIDENTIFIER NOT NULL,
    StudentId UNIQUEIDENTIFIER NOT NULL,
    SpecialNotes NVARCHAR(MAX) NULL,
    CONSTRAINT UQ_RequestStudents_RequestStudent UNIQUE (RequestId, StudentId),
    CONSTRAINT FK_RequestStudents_Requests FOREIGN KEY (RequestId) REFERENCES dbo.TransportRequests(Id) ON DELETE CASCADE,
    CONSTRAINT FK_RequestStudents_Students FOREIGN KEY (StudentId) REFERENCES dbo.StudentProfiles(Id)
);

CREATE TABLE dbo.StudentAddresses (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_StudentAddresses PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    StudentId UNIQUEIDENTIFIER NOT NULL,
    AddressLine NVARCHAR(MAX) NOT NULL,
    Suburb NVARCHAR(100) NULL,
    City NVARCHAR(100) NULL,
    Postcode NVARCHAR(20) NULL,
    Latitude DECIMAL(10, 7) NULL,
    Longitude DECIMAL(10, 7) NULL,
    IsCurrent BIT NOT NULL CONSTRAINT DF_StudentAddresses_IsCurrent DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_StudentAddresses_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT FK_StudentAddresses_Students FOREIGN KEY (StudentId) REFERENCES dbo.StudentProfiles(Id) ON DELETE CASCADE
);

CREATE TABLE dbo.StudentChangeRequests (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_StudentChangeRequests PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    StudentId UNIQUEIDENTIFIER NOT NULL,
    RequestedById UNIQUEIDENTIFIER NOT NULL,
    AddressLine NVARCHAR(MAX) NOT NULL,
    Suburb NVARCHAR(100) NULL,
    City NVARCHAR(100) NULL,
    Postcode NVARCHAR(20) NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_StudentChangeRequests_Status DEFAULT 'pending',
    ReviewedById UNIQUEIDENTIFIER NULL,
    ReviewedAt DATETIMEOFFSET NULL,
    CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_StudentChangeRequests_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT CK_StudentChangeRequests_Status CHECK (Status IN ('pending', 'approved', 'declined')),
    CONSTRAINT FK_StudentChangeRequests_Students FOREIGN KEY (StudentId) REFERENCES dbo.StudentProfiles(Id) ON DELETE CASCADE,
    CONSTRAINT FK_StudentChangeRequests_RequestedBy FOREIGN KEY (RequestedById) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_StudentChangeRequests_ReviewedBy FOREIGN KEY (ReviewedById) REFERENCES dbo.Users(Id)
);

CREATE TABLE dbo.Routes (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Routes PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    RequestId UNIQUEIDENTIFIER NOT NULL CONSTRAINT UQ_Routes_RequestId UNIQUE,
    VanId UNIQUEIDENTIFIER NULL,
    DriverId UNIQUEIDENTIFIER NULL,
    PlannedStartTime TIME NULL,
    PlannedEndTime TIME NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_Routes_Status DEFAULT 'planned',
    CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Routes_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT FK_Routes_Requests FOREIGN KEY (RequestId) REFERENCES dbo.TransportRequests(Id),
    CONSTRAINT FK_Routes_Vans FOREIGN KEY (VanId) REFERENCES dbo.Vans(Id),
    CONSTRAINT FK_Routes_Drivers FOREIGN KEY (DriverId) REFERENCES dbo.DriverProfiles(Id)
);

CREATE TABLE dbo.RouteStops (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_RouteStops PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    RouteId UNIQUEIDENTIFIER NOT NULL,
    StopOrder INT NOT NULL CONSTRAINT CK_RouteStops_StopOrder CHECK (StopOrder > 0),
    Address NVARCHAR(MAX) NOT NULL,
    Latitude DECIMAL(10, 7) NULL,
    Longitude DECIMAL(10, 7) NULL,
    PlannedArrival TIME NULL,
    ActualArrival DATETIMEOFFSET NULL,
    CONSTRAINT UQ_RouteStops_RouteOrder UNIQUE (RouteId, StopOrder),
    CONSTRAINT FK_RouteStops_Routes FOREIGN KEY (RouteId) REFERENCES dbo.Routes(Id) ON DELETE CASCADE
);

CREATE TABLE dbo.JourneyEvents (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_JourneyEvents PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    RouteId UNIQUEIDENTIFIER NOT NULL,
    EventType NVARCHAR(40) NOT NULL,
    EventTime DATETIMEOFFSET NOT NULL CONSTRAINT DF_JourneyEvents_EventTime DEFAULT SYSDATETIMEOFFSET(),
    Notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_JourneyEvents_Routes FOREIGN KEY (RouteId) REFERENCES dbo.Routes(Id) ON DELETE CASCADE
);

CREATE TABLE dbo.PassengerAttendance (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PassengerAttendance PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    RouteStopId UNIQUEIDENTIFIER NOT NULL,
    StudentId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT CK_PassengerAttendance_Status CHECK (Status IN ('pending', 'picked_up', 'dropped_off', 'absent')),
    RecordedAt DATETIMEOFFSET NULL,
    CONSTRAINT UQ_PassengerAttendance_StopStudent UNIQUE (RouteStopId, StudentId),
    CONSTRAINT FK_PassengerAttendance_Stops FOREIGN KEY (RouteStopId) REFERENCES dbo.RouteStops(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PassengerAttendance_Students FOREIGN KEY (StudentId) REFERENCES dbo.StudentProfiles(Id)
);
GO

CREATE INDEX IX_TransportRequests_JourneyDate ON dbo.TransportRequests (JourneyDate);
CREATE INDEX IX_RouteStops_RouteOrder ON dbo.RouteStops (RouteId, StopOrder);
GO

DECLARE @Admin UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000001';
DECLARE @AmaUser UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000002';
DECLARE @KojoUser UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000003';
DECLARE @NanaUser UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000004';
DECLARE @Parent UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000005';
DECLARE @Driver UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000006';
DECLARE @Ama UNIQUEIDENTIFIER = '10000000-0000-0000-0000-000000000001';
DECLARE @Kojo UNIQUEIDENTIFIER = '10000000-0000-0000-0000-000000000002';
DECLARE @Nana UNIQUEIDENTIFIER = '10000000-0000-0000-0000-000000000003';
DECLARE @Van UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000003';
DECLARE @Request UNIQUEIDENTIFIER = '30000000-0000-0000-0000-000000000001';
DECLARE @Route UNIQUEIDENTIFIER = '40000000-0000-0000-0000-000000000001';
DECLARE @Stop1 UNIQUEIDENTIFIER = '50000000-0000-0000-0000-000000000001';
DECLARE @Stop2 UNIQUEIDENTIFIER = '50000000-0000-0000-0000-000000000002';
DECLARE @Stop3 UNIQUEIDENTIFIER = '50000000-0000-0000-0000-000000000003';
DECLARE @Stop4 UNIQUEIDENTIFIER = '50000000-0000-0000-0000-000000000004';

INSERT dbo.Users (Id, FullName, Email, PasswordHash, Role, Phone)
VALUES
(@Admin, N'Olivia Mensah', N'olivia.mensah@visioncollege.ac.nz', N'demo-only', N'admin', N'+64 21 555 0101'),
(@Driver, N'Michael Brown', N'michael.brown@visioncollege.ac.nz', N'demo-only', N'driver', N'+64 21 555 0106');

INSERT dbo.StudentProfiles (Id, UserId, StudentNumber, YearLevel)
VALUES
(@Ama, NULL, N'VC/ICT/23/0142', N'Year 3'),
(@Kojo, NULL, N'VC/ICT/24/0089', N'Year 2'),
(@Nana, NULL, N'VC/ICT/24/0176', N'Year 2');

INSERT dbo.StudentAddresses (StudentId, AddressLine, Suburb, City, Postcode)
VALUES
(@Ama, N'14 Nii Martey Street', N'East Legon', N'Accra', N'00233'),
(@Kojo, N'8 Boundary Road', N'Shiashie', N'Accra', N'00233'),
(@Nana, N'27 Jungle Avenue', N'Dzorwulu', N'Accra', N'00233');

INSERT dbo.DriverProfiles (Id, UserId, LicenceNumber, LicenceExpiry)
VALUES ('60000000-0000-0000-0000-000000000001', @Driver, N'GHA-DL-20481', '2027-12-31');

INSERT dbo.Vans (Id, RegistrationNumber, Name, Capacity, Status)
VALUES
('20000000-0000-0000-0000-000000000001', N'VC-01', N'Ford Transit', 18, N'available'),
('20000000-0000-0000-0000-000000000002', N'VC-02', N'Ford Transit', 18, N'available'),
(@Van, N'VC-03', N'Toyota Hiace', 15, N'assigned'),
('20000000-0000-0000-0000-000000000004', N'VC-04', N'Toyota Hiace', 15, N'available'),
('20000000-0000-0000-0000-000000000005', N'VC-05', N'Ford Transit', 18, N'maintenance'),
('20000000-0000-0000-0000-000000000006', N'VC-06', N'Toyota Hiace', 15, N'available');

INSERT dbo.TransportRequests (Id, CreatedById, JourneyType, Title, Description, JourneyDate, PlannedStartTime, PlannedEndTime, StandardPickupLocation, Destination, Status, ReviewedById, ReviewedAt)
VALUES (@Request, @Admin, N'student_home_pickup', N'Morning Student Pickup', N'Daily pickup route for ICT students.', CAST(GETDATE() AS DATE), '07:30', '08:20', N'Student home addresses', N'Vision College Main Campus', N'approved', @Admin, SYSDATETIMEOFFSET());

INSERT dbo.RequestStudents (RequestId, StudentId)
VALUES (@Request, @Ama), (@Request, @Kojo), (@Request, @Nana);

INSERT dbo.Routes (Id, RequestId, VanId, DriverId, PlannedStartTime, PlannedEndTime, Status)
VALUES (@Route, @Request, @Van, '60000000-0000-0000-0000-000000000001', '07:30', '08:20', N'active');

INSERT dbo.RouteStops (Id, RouteId, StopOrder, Address, PlannedArrival)
VALUES
(@Stop1, @Route, 1, N'14 Nii Martey Street, East Legon', '07:30'),
(@Stop2, @Route, 2, N'8 Boundary Road, Shiashie', '07:42'),
(@Stop3, @Route, 3, N'27 Jungle Avenue, Dzorwulu', '07:55'),
(@Stop4, @Route, 4, N'Vision College Main Campus', '08:20');

INSERT dbo.PassengerAttendance (RouteStopId, StudentId, Status, RecordedAt)
VALUES (@Stop1, @Ama, N'picked_up', SYSDATETIMEOFFSET()), (@Stop2, @Kojo, N'pending', NULL), (@Stop3, @Nana, N'pending', NULL);

INSERT dbo.JourneyEvents (RouteId, EventType, Notes)
VALUES (@Route, N'journey_started', N'Demo route started for sample data.');

SELECT N'FleetBooking database created and sample data inserted.' AS Result;
SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME;
GO
