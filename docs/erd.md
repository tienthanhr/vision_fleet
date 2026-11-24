# Vision College Fleet Booking and Tracking System

## Entity relationship diagram

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : "may have"
    USERS ||--o| DRIVER_PROFILES : "may have"
    USERS ||--o{ TRANSPORT_REQUESTS : creates
    USERS ||--o{ STUDENT_CHANGE_REQUESTS : submits
    USERS ||--o{ STUDENT_CHANGE_REQUESTS : reviews
    STUDENT_PROFILES ||--o{ STUDENT_ADDRESSES : has
    STUDENT_PROFILES ||--o{ REQUEST_STUDENTS : selected
    STUDENT_PROFILES ||--o{ PASSENGER_ATTENDANCE : receives
    STUDENT_PROFILES ||--o{ STUDENT_CHANGE_REQUESTS : concerns
    TRANSPORT_REQUESTS ||--o{ REQUEST_STUDENTS : contains
    TRANSPORT_REQUESTS ||--o| ROUTES : generates
    VANS ||--o{ ROUTES : assigned
    DRIVER_PROFILES ||--o{ ROUTES : drives
    ROUTES ||--o{ ROUTE_STOPS : contains
    ROUTES ||--o{ JOURNEY_EVENTS : records
    ROUTE_STOPS ||--o{ PASSENGER_ATTENDANCE : records

    USERS {
        uuid id PK
        varchar full_name
        varchar email UK
        user_role role
        varchar status
        varchar phone
        timestamptz created_at
    }

    STUDENT_PROFILES {
        uuid id PK
        uuid user_id FK,UK
        varchar student_number UK
        varchar year_level
        text emergency_notes
    }

    STUDENT_ADDRESSES {
        uuid id PK
        uuid student_id FK
        text address_line
        varchar suburb
        varchar city
        varchar postcode
        decimal latitude
        decimal longitude
        boolean is_current
        timestamptz created_at
    }

    DRIVER_PROFILES {
        uuid id PK
        uuid user_id FK,UK
        varchar licence_number
        date licence_expiry
        text notes
    }

    VANS {
        uuid id PK
        varchar registration_number UK
        varchar name
        integer capacity
        van_status status
        text notes
    }

    TRANSPORT_REQUESTS {
        uuid id PK
        uuid created_by_id FK
        journey_type journey_type
        varchar title
        date journey_date
        time planned_start_time
        time planned_end_time
        text destination
        request_status status
        uuid reviewed_by_id FK
        timestamptz created_at
    }

    REQUEST_STUDENTS {
        uuid id PK
        uuid request_id FK
        uuid student_id FK
        text special_notes
    }

    STUDENT_CHANGE_REQUESTS {
        uuid id PK
        uuid student_id FK
        uuid requested_by_id FK
        text address_line
        varchar suburb
        varchar city
        varchar postcode
        varchar status
        uuid reviewed_by_id FK
        timestamptz reviewed_at
        timestamptz created_at
    }

    ROUTES {
        uuid id PK
        uuid request_id FK,UK
        uuid van_id FK
        uuid driver_id FK
        time planned_start_time
        time planned_end_time
        varchar status
        timestamptz created_at
    }

    ROUTE_STOPS {
        uuid id PK
        uuid route_id FK
        integer stop_order
        text address
        decimal latitude
        decimal longitude
        time planned_arrival
        timestamptz actual_arrival
    }

    JOURNEY_EVENTS {
        uuid id PK
        uuid route_id FK
        varchar event_type
        timestamptz event_time
        text notes
    }

    PASSENGER_ATTENDANCE {
        uuid id PK
        uuid route_stop_id FK
        uuid student_id FK
        varchar status
        timestamptz recorded_at
    }
```

## Relationship summary

| Relationship | Meaning |
|---|---|
| `users` to `student_profiles` | A student profile is linked to one user account. |
| `users` to `driver_profiles` | A driver profile is linked to one user account. |
| `users` to `transport_requests` | A staff member or other authorised user can create requests. |
| `transport_requests` to `request_students` | A request can contain multiple students. |
| `student_profiles` to `student_addresses` | A student can have address history, with one current address. |
| `transport_requests` to `routes` | An approved request can have one generated route. |
| `routes` to `route_stops` | A route contains ordered pickup and destination stops. |
| `route_stops` to `passenger_attendance` | Attendance is recorded for a student at a stop. |
| `student_profiles` to `student_change_requests` | Parents can propose address changes for a student. |
| `student_change_requests` to `users` | Staff or administrators review and approve/decline requests. |
