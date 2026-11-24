# Fleet Booking API

This backend uses ASP.NET Core 8 Web API, Entity Framework Core and MySQL/MariaDB (Pomelo provider).

## Setup

1. Create a MySQL/MariaDB database (locally: `fleet_booking`; on Plesk: `Tien_fleet_booking`).
2. Let EF Core create the schema: set `Database:AutoMigrate=true` in configuration (or `connectionStrings` + `Database` keys via environment variables) and start the API once. To apply it manually, import [`database/mysql-setup.sql`](../database/mysql-setup.sql) through phpMyAdmin.
3. Point `FleetDatabase` in `FleetBooking.Api/appsettings.json` or user secrets at that database. Do not commit a real password.
4. Start the API:

```powershell
dotnet run --project FleetBooking.Api
```

Swagger is available at `/swagger` in development.

To load demo accounts, vans, students and bookings into an empty database, set `Database:AutoSeed=true` once and restart (the seeder skips an existing database).

## Project design documentation

- [System architecture diagram](../docs/architecture-diagram.md)
- [Entity relationship diagram](../docs/erd.md)
- [Database schema specification](../docs/database-schema.md)

Database setup scripts for MySQL/MariaDB, PostgreSQL and SQL Server/SSMS are available in [`database/README.md`](../database/README.md). Deployment steps for the school Plesk hosting are in [`docs/PLESK-DEPLOYMENT.md`](../docs/PLESK-DEPLOYMENT.md).

## API

- `GET /api/transport-requests` lists transport requests.
- `POST /api/transport-requests` creates a request and validates its requester and selected students.

Example request:

```json
{
  "createdById": "00000000-0000-0000-0000-000000000000",
  "journeyType": "StandardVanBooking",
  "title": "Networking lab visit",
  "description": "ICT class transport",
  "journeyDate": "2026-10-20",
  "plannedStartTime": "08:30:00",
  "plannedEndTime": "16:00:00",
  "standardPickupLocation": "Vision College Main Campus",
  "destination": "Technology Park",
  "studentIds": []
}
```

The React frontend connects to this API (`VITE_API_BASE_URL`); cookie-based authentication and role policies are enforced server-side.
