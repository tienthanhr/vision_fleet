# Vision College Fleet Booking and Tracking System

## Database schema specification

Database: **PostgreSQL**  
Database name: **fleet_booking**  
Identifier strategy: **UUID**  
Time storage: **TIMESTAMPTZ** for auditable events, `DATE` for journey dates, and `TIME` for planned times.

## Enumerated values

| Type | Values |
|---|---|
| `user_role` | `admin`, `staff`, `driver`, `student`, `parent` |
| `request_status` | `pending`, `approved`, `declined`, `cancelled`, `completed` |
| `journey_type` | `standard_van_booking`, `student_home_pickup`, `student_home_dropoff`, `return_student_transport` |
| `van_status` | `available`, `assigned`, `maintenance`, `inactive` |

## Tables

### `users`

Stores authenticated portal accounts and their roles.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key, generated automatically |
| `full_name` | VARCHAR(150) | Required |
| `email` | VARCHAR(255) | Required, unique |
| `password_hash` | TEXT | Required; never expose through API |
| `role` | `user_role` | Required |
| `status` | VARCHAR(20) | Required, defaults to `active` |
| `phone` | VARCHAR(30) | Optional |
| `created_at` | TIMESTAMPTZ | Required, defaults to current time |

### `student_profiles`

Stores student-specific academic and safety information.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Optional unique foreign key to `users.id` |
| `student_number` | VARCHAR(50) | Required, unique |
| `year_level` | VARCHAR(30) | Optional |
| `emergency_notes` | TEXT | Optional |

### `student_addresses`

Stores current and historical pickup addresses.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `student_id` | UUID | Required foreign key to `student_profiles.id`; cascade delete |
| `address_line` | TEXT | Required |
| `suburb` | VARCHAR(100) | Optional |
| `city` | VARCHAR(100) | Optional |
| `postcode` | VARCHAR(20) | Optional |
| `latitude` | DECIMAL(10,7) | Optional |
| `longitude` | DECIMAL(10,7) | Optional |
| `is_current` | BOOLEAN | Required, defaults to `TRUE` |
| `created_at` | TIMESTAMPTZ | Required |

### `student_change_requests`

Stores parent/guardian requests to change protected student information.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `student_id` | UUID | Required foreign key to `student_profiles.id` |
| `requested_by_id` | UUID | Required foreign key to `users.id` |
| `address_line` | TEXT | Required |
| `suburb` | VARCHAR(100) | Optional |
| `city` | VARCHAR(100) | Optional |
| `postcode` | VARCHAR(20) | Optional |
| `status` | VARCHAR(20) | Required; `pending`, `approved`, or `declined` |
| `reviewed_by_id` | UUID | Optional foreign key to `users.id` |
| `reviewed_at` | TIMESTAMPTZ | Optional |
| `created_at` | TIMESTAMPTZ | Required |

### `vans`

Stores fleet vehicles and availability.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `registration_number` | VARCHAR(30) | Required, unique |
| `name` | VARCHAR(100) | Optional |
| `capacity` | INTEGER | Required, greater than zero |
| `status` | `van_status` | Required |
| `notes` | TEXT | Optional |

### `driver_profiles`

Stores driver-specific licensing details.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Required, unique foreign key to `users.id` |
| `licence_number` | VARCHAR(100) | Optional |
| `licence_expiry` | DATE | Optional |
| `notes` | TEXT | Optional |

### `transport_requests`

Stores standard bookings and student transport requests.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `created_by_id` | UUID | Required foreign key to `users.id` |
| `journey_type` | `journey_type` | Required |
| `title` | VARCHAR(200) | Required |
| `description` | TEXT | Optional |
| `journey_date` | DATE | Required |
| `planned_start_time` | TIME | Required |
| `planned_end_time` | TIME | Optional |
| `standard_pickup_location` | TEXT | Optional |
| `destination` | TEXT | Required |
| `status` | `request_status` | Required, defaults to `pending` |
| `reviewed_by_id` | UUID | Optional foreign key to `users.id` |
| `reviewed_at` | TIMESTAMPTZ | Optional |
| `review_notes` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | Required |
| `updated_at` | TIMESTAMPTZ | Required |

### `request_students`

Join table for the many-to-many relationship between transport requests and students.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `request_id` | UUID | Required foreign key to `transport_requests.id`; cascade delete |
| `student_id` | UUID | Required foreign key to `student_profiles.id` |
| `special_notes` | TEXT | Optional |
| `(request_id, student_id)` | Composite key | Unique combination |

### `routes`

Stores the route generated for a transport request.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `request_id` | UUID | Required unique foreign key to `transport_requests.id` |
| `van_id` | UUID | Optional foreign key to `vans.id` |
| `driver_id` | UUID | Optional foreign key to `driver_profiles.id` |
| `planned_start_time` | TIME | Optional |
| `planned_end_time` | TIME | Optional |
| `status` | VARCHAR(30) | Required, defaults to `planned` |
| `created_at` | TIMESTAMPTZ | Required |

### `route_stops`

Stores ordered stops for a route.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `route_id` | UUID | Required foreign key to `routes.id`; cascade delete |
| `stop_order` | INTEGER | Required, greater than zero |
| `address` | TEXT | Required |
| `latitude` | DECIMAL(10,7) | Optional |
| `longitude` | DECIMAL(10,7) | Optional |
| `planned_arrival` | TIME | Optional |
| `actual_arrival` | TIMESTAMPTZ | Optional |
| `(route_id, stop_order)` | Composite key | Unique stop order per route |

### `journey_events`

Stores an audit trail for route progress.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `route_id` | UUID | Required foreign key to `routes.id`; cascade delete |
| `event_type` | VARCHAR(40) | Required |
| `event_time` | TIMESTAMPTZ | Required |
| `notes` | TEXT | Optional |

### `passenger_attendance`

Stores pickup and drop-off status for each student at a route stop.

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `route_stop_id` | UUID | Required foreign key to `route_stops.id`; cascade delete |
| `student_id` | UUID | Required foreign key to `student_profiles.id` |
| `status` | VARCHAR(20) | `pending`, `picked_up`, `dropped_off`, or `absent` |
| `recorded_at` | TIMESTAMPTZ | Optional |
| `(route_stop_id, student_id)` | Composite key | Unique combination |

## Indexes

| Index | Purpose |
|---|---|
| `users.email` unique index | Prevents duplicate accounts and supports account lookup. |
| `student_profiles.student_number` unique index | Prevents duplicate student records. |
| `vans.registration_number` unique index | Prevents duplicate fleet registrations. |
| `ix_transport_requests_date` | Speeds up booking searches by journey date. |
| `ix_route_stops_route_order` | Speeds up ordered route-stop retrieval. |

## Integrity and privacy rules

1. A student number and vehicle registration number must be unique.
2. A route belongs to at most one transport request.
3. A route cannot contain duplicate stop-order values.
4. A student cannot have duplicate attendance for the same stop.
5. Parent address changes are stored as requests and require approval.
6. Current address history is preserved by marking the previous address as not current.
7. Deleting a student removes their dependent addresses, but booking history is protected by foreign-key restrictions where appropriate.
