/*
    PostgreSQL setup wrapper.
    Run from the repository root with:
    psql -h localhost -p 5432 -U postgres -f database/postgresql-setup.sql

    The existing backend schema contains the complete PostgreSQL DDL and sample data.
*/
\set ON_ERROR_STOP on
\connect fleet_booking
\ir ../backend/FleetBooking.Api/database/schema.sql

-- Ensure current address samples exist when the base schema has already been applied.
INSERT INTO student_addresses (student_id, address_line, suburb, city, postcode)
SELECT '10000000-0000-0000-0000-000000000001', '14 Nii Martey Street', 'East Legon', 'Accra', '00233'
WHERE NOT EXISTS (SELECT 1 FROM student_addresses WHERE student_id = '10000000-0000-0000-0000-000000000001' AND is_current);

INSERT INTO student_addresses (student_id, address_line, suburb, city, postcode)
SELECT '10000000-0000-0000-0000-000000000002', '8 Boundary Road', 'Shiashie', 'Accra', '00233'
WHERE NOT EXISTS (SELECT 1 FROM student_addresses WHERE student_id = '10000000-0000-0000-0000-000000000002' AND is_current);

INSERT INTO student_addresses (student_id, address_line, suburb, city, postcode)
SELECT '10000000-0000-0000-0000-000000000003', '27 Jungle Avenue', 'Dzorwulu', 'Accra', '00233'
WHERE NOT EXISTS (SELECT 1 FROM student_addresses WHERE student_id = '10000000-0000-0000-0000-000000000003' AND is_current);

UPDATE users
SET email = 'olivia.mensah@visioncollege.ac.nz', phone = '+64 21 555 0101'
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'fleet_booking PostgreSQL setup completed' AS result;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
