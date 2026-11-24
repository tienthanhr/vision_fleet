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

## Automated deployment via Git (recommended)

The repository has a CI pipeline (`.github/workflows/deploy.yml`) that automates
everything:

1. Any push to `main` triggers GitHub Actions.
2. CI builds the frontend (`npm run build` with `VITE_API_BASE_URL=/api`) and
   publishes the backend (`dotnet publish`) into one deploy tree.
3. CI force-pushes the tree to the `deploy` branch.
4. CI calls the Plesk Git webhook, which pulls the `deploy` branch and deploys
   it automatically to the document root of
   `booking.dipwww.visioncollege.ac.nz`.

So the normal workflow is: edit code → commit → `git push origin main` —
the live site updates on its own a couple of minutes later. In Plesk the
repository `vision_fleet.git` (Websites & Domains → booking domain → Git)
shows the deploy status; `Pull now` / `Deploy now` are available if the
webhook ever needs a manual retry.

After a deployment that replaced backend DLLs, the .NET Core application may
need a restart (toggle Enabled OFF/ON in the .NET Core settings) before the
new DLLs are loaded.

## Manual frontend build (fallback)

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
