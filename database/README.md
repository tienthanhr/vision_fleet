# Database setup options

The project now includes setup scripts for both database platforms:

| Platform | Database | Tool | Script |
|---|---|---|---|
| Microsoft SQL Server | `FleetBooking` | SQL Server Management Studio (SSMS) | [`sqlserver-setup.sql`](./sqlserver-setup.sql) |
| PostgreSQL (legacy local dev) | `fleet_booking` | pgAdmin, DBeaver, or `psql` | [`postgresql-setup.sql`](./postgresql-setup.sql) |
| MySQL / MariaDB (production + current API) | `Tien_fleet_booking` | phpMyAdmin (Plesk) | [`mysql-setup.sql`](./mysql-setup.sql) |

## SQL Server / SSMS

SQL Server Express was detected locally at:

```text
.\SQLEXPRESS
```

The database has already been created and populated with sample data. To view it:

1. Open SSMS.
2. Connect to `.\SQLEXPRESS`.
3. Expand **Databases**.
4. Open **FleetBooking**.
5. Expand **Tables**.

To recreate the schema and sample data from the command line:

```powershell
sqlcmd -S .\SQLEXPRESS -E -i database\sqlserver-setup.sql
```

The script uses Windows integrated authentication. It creates:

- 12 tables
- Foreign keys and unique constraints
- Check constraints for roles, statuses, and attendance
- Indexes for journey dates and route ordering
- Sample users, students, addresses, vans, driver, booking, route, stops, and attendance

## PostgreSQL (legacy local development)

The application previously ran against a local PostgreSQL database
(`Host: localhost; Port: 5432; Database: fleet_booking`). It is kept for
reference only — the EF Core provider has moved to MySQL because the school's
Plesk hosting only offers MariaDB.

## MySQL / MariaDB (current)

The ASP.NET Core API now uses **MySQL/MariaDB** through the
`Pomelo.EntityFrameworkCore.MySql` provider and the same `FleetDatabase`
connection string name.

Production database (Plesk, `localhost:3306`, database `Tien_fleet_booking`):

- Schema is managed with EF Core migrations (`backend/FleetBooking.Api/Migrations`).
- [`mysql-setup.sql`](./mysql-setup.sql) is the generated idempotent script — it can be imported through phpMyAdmin if needed.
- The API applies migrations automatically on start when `Database:AutoMigrate=true` is set, and inserts demo accounts/vans/students/bookings once when `Database:AutoSeed=true` is set and the users table is empty.
- Connection credentials are supplied through Plesk environment variables
  (`ConnectionStrings__FleetDatabase`), never committed to source control.

## Which database does the running API use?

The deployed API on Plesk uses **MariaDB** (`Tien_fleet_booking` on
`localhost:3306`). The SQL Server database remains a parallel
SSMS-compatible demonstration for the assessment; the PostgreSQL script is
legacy.
