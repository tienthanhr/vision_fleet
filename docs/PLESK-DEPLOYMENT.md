# Plesk deployment (Project 2 hosting)

## Architecture on the hosting

| Piece | Where |
|---|---|
| React frontend (Vite build) | Served from the document root of `booking.dipwww.visioncollege.ac.nz` (`index.html`, `assets/`) |
| ASP.NET Core 8 API | Same domain, run by Plesk's .NET Core module (Phusion Passenger), startup file `FleetBooking.Api.dll` |
| MariaDB database | Plesk database `Tien_fleet_booking` on `localhost:3306` |
| HTTPS | Let's Encrypt certificate issued from Plesk (auto-renewal), HTTP→HTTPS redirect enabled |

Serving the SPA and the API from one origin avoids CORS entirely.
`Program.cs` maps a fallback route that returns `index.html` for any non-API
path, so deep links such as `/booking-details/{id}/` keep working after a
browser refresh (Back/Forward friendly URLs).

## Frontend build

The API base URL is taken from `VITE_API_BASE_URL`
(see `.env.production`); local development falls back to
`http://localhost:5075/api`.

```powershell
npm run build     # output: dist/  -> upload contents to the document root
```

## Backend publish

```powershell
dotnet publish backend/FleetBooking.Api/FleetBooking.Api.csproj -c Release -o backend/FleetBooking.Api/publish
```

Upload the contents of `publish/` to the domain document root (zip + extract
in the Plesk File Manager is the quickest way), then in **Websites & Domains →
.NET Core** select `FleetBooking.Api.dll` as the application startup file and
restart the application.

## Configuration via Plesk environment variables

Set in the .NET Core page (Environment variables → Edit):

| Variable | Purpose |
|---|---|
| `ConnectionStrings__FleetDatabase` | MariaDB connection string (host, db, user, password) — keeps credentials out of the repo |
| `Database__AutoMigrate=true` | Applies EF Core migrations on start (creates `Tien_fleet_booking` tables) |
| `Database__AutoSeed=true` | Inserts demo accounts, vans, students and bookings once, only when the users table is empty |

`database/mysql-setup.sql` is the equivalent schema script generated from the
migrations (importable through phpMyAdmin for the assessment evidence).

## Useful URLs

- App: `https://booking.dipwww.visioncollege.ac.nz/`
- Health check: `https://booking.dipwww.visioncollege.ac.nz/health`
