CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('admin', 'staff', 'driver', 'student', 'parent');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'declined', 'cancelled', 'completed');
CREATE TYPE journey_type AS ENUM ('standard_van_booking', 'student_home_pickup', 'student_home_dropoff', 'return_student_transport');
CREATE TYPE van_status AS ENUM ('available', 'assigned', 'maintenance', 'inactive');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_number VARCHAR(50) NOT NULL UNIQUE,
    year_level VARCHAR(30),
    emergency_notes TEXT
);

CREATE TABLE vans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status van_status NOT NULL DEFAULT 'available',
    notes TEXT
);

CREATE TABLE transport_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by_id UUID NOT NULL REFERENCES users(id),
    journey_type journey_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    journey_date DATE NOT NULL,
    planned_start_time TIME NOT NULL,
    planned_end_time TIME,
    standard_pickup_location TEXT,
    destination TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    reviewed_by_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE request_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES transport_requests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    special_notes TEXT,
    UNIQUE (request_id, student_id)
);

CREATE TABLE student_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    address_line TEXT NOT NULL,
    suburb VARCHAR(100),
    city VARCHAR(100),
    postcode VARCHAR(20),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    requested_by_id UUID NOT NULL REFERENCES users(id),
    address_line TEXT NOT NULL,
    suburb VARCHAR(100),
    city VARCHAR(100),
    postcode VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewed_by_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    licence_number VARCHAR(100),
    licence_expiry DATE,
    notes TEXT
);

CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL UNIQUE REFERENCES transport_requests(id),
    van_id UUID REFERENCES vans(id),
    driver_id UUID REFERENCES driver_profiles(id),
    planned_start_time TIME,
    planned_end_time TIME,
    status VARCHAR(30) NOT NULL DEFAULT 'planned',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL CHECK (stop_order > 0),
    address TEXT NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    planned_arrival TIME,
    actual_arrival TIMESTAMPTZ,
    UNIQUE (route_id, stop_order)
);

CREATE TABLE journey_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    event_type VARCHAR(40) NOT NULL,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE passenger_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_stop_id UUID NOT NULL REFERENCES route_stops(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'picked_up', 'dropped_off', 'absent')),
    recorded_at TIMESTAMPTZ,
    UNIQUE (route_stop_id, student_id)
);

CREATE INDEX ix_transport_requests_date ON transport_requests (journey_date);
CREATE INDEX ix_route_stops_route_order ON route_stops (route_id, stop_order);

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Olivia Mensah',
    'olivia.mensah@visioncollege.ac.nz',
    'demo-account-hash-replace-before-production',
    'admin'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_profiles (id, user_id, student_number, year_level)
VALUES
    ('10000000-0000-0000-0000-000000000001', NULL, 'VC/ICT/23/0142', 'Year 3'),
    ('10000000-0000-0000-0000-000000000002', NULL, 'VC/ICT/24/0089', 'Year 2'),
    ('10000000-0000-0000-0000-000000000003', NULL, 'VC/ICT/24/0176', 'Year 2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vans (id, registration_number, name, capacity, status)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'VC-01', 'Ford Transit', 18, 'available'),
    ('20000000-0000-0000-0000-000000000002', 'VC-02', 'Ford Transit', 18, 'available'),
    ('20000000-0000-0000-0000-000000000003', 'VC-03', 'Toyota Hiace', 15, 'assigned'),
    ('20000000-0000-0000-0000-000000000004', 'VC-04', 'Toyota Hiace', 15, 'available'),
    ('20000000-0000-0000-0000-000000000005', 'VC-05', 'Ford Transit', 18, 'maintenance'),
    ('20000000-0000-0000-0000-000000000006', 'VC-06', 'Toyota Hiace', 15, 'available')
ON CONFLICT (id) DO NOTHING;
