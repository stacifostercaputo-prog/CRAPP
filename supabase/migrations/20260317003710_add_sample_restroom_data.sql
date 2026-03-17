/*
  # Add Sample Restroom Data

  Adds sample bathroom locations across Texas and California cities:
  - Austin, TX
  - Spicewood, TX
  - Oak Park, CA
  - Bakersfield, CA
  - San Antonio, TX

  Each location includes realistic details like ratings, amenities, and addresses.
*/

-- Create a temporary user for sample data
DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Insert or get a sample user ID for demo purposes
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'sample@crapp.demo',
    crypt('samplepass123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;

  sample_user_id := '00000000-0000-0000-0000-000000000001';

  -- Austin, TX locations
  INSERT INTO restrooms (name, type, latitude, longitude, address, rating, review_count, changing_table, accessible, single_stall, well_lit, stocked, created_by)
  VALUES
    ('Whole Foods Downtown', 'Grocery Store', 30.2672, -97.7431, '525 N Lamar Blvd, Austin, TX 78703', 4.5, 12, true, true, false, true, true, sample_user_id),
    ('Austin-Bergstrom Airport Terminal', 'Airport', 30.1975, -97.6664, '3600 Presidential Blvd, Austin, TX 78719', 4.2, 28, true, true, false, true, true, sample_user_id),
    ('Barton Springs Pool', 'Park', 30.2634, -97.7714, '2131 William Barton Dr, Austin, TX 78746', 3.8, 15, true, true, false, true, false, sample_user_id),
    ('Texas State Capitol', 'Government Building', 30.2747, -97.7404, '1100 Congress Ave, Austin, TX 78701', 4.7, 22, true, true, false, true, true, sample_user_id),
    ('H-E-B Mueller', 'Grocery Store', 30.2943, -97.7148, '1801 E 51st St, Austin, TX 78723', 4.3, 18, true, true, false, true, true, sample_user_id),

  -- Spicewood, TX locations
    ('Spicewood Cafe', 'Restaurant', 30.4717, -98.1542, '22714 TX-71, Spicewood, TX 78669', 4.0, 8, false, true, true, true, true, sample_user_id),
    ('Spicewood Grocery & Deli', 'Gas Station', 30.4738, -98.1528, 'TX-71, Spicewood, TX 78669', 3.5, 5, false, false, true, false, true, sample_user_id),

  -- Oak Park, CA locations
    ('Oak Park Community Center', 'Community Center', 34.1836, -118.7617, '5867 Kanan Rd, Oak Park, CA 91377', 4.4, 10, true, true, false, true, true, sample_user_id),
    ('Starbucks Oak Park', 'Coffee Shop', 34.1851, -118.7642, 'Kanan Rd, Oak Park, CA 91377', 3.9, 14, false, true, true, true, true, sample_user_id),

  -- Bakersfield, CA locations
    ('Bakersfield Amtrak Station', 'Transit Station', 35.3733, -119.0187, '601 Truxtun Ave, Bakersfield, CA 93301', 3.2, 9, true, true, false, false, false, sample_user_id),
    ('Valley Plaza Mall', 'Shopping Mall', 35.3528, -119.0187, '2701 Ming Ave, Bakersfield, CA 93304', 4.1, 25, true, true, false, true, true, sample_user_id),
    ('Rabobank Arena', 'Event Venue', 35.3739, -119.0183, '1001 Truxtun Ave, Bakersfield, CA 93301', 4.0, 17, true, true, false, true, true, sample_user_id),
    ('Target Bakersfield East', 'Retail Store', 35.3642, -118.9834, '8200 Rosedale Hwy, Bakersfield, CA 93312', 4.2, 20, true, true, false, true, true, sample_user_id),

  -- San Antonio, TX locations
    ('The Alamo', 'Historical Site', 29.4260, -98.4861, '300 Alamo Plaza, San Antonio, TX 78205', 4.6, 35, true, true, false, true, true, sample_user_id),
    ('San Antonio River Walk - Shops', 'Tourist Area', 29.4252, -98.4946, 'River Walk, San Antonio, TX 78205', 4.3, 42, true, true, false, true, true, sample_user_id),
    ('San Antonio International Airport', 'Airport', 29.5337, -98.4698, '9800 Airport Blvd, San Antonio, TX 78216', 4.1, 31, true, true, false, true, true, sample_user_id),
    ('H-E-B Plus! Broadway', 'Grocery Store', 29.4687, -98.4744, '1601 N Loop 1604 E, San Antonio, TX 78232', 4.5, 27, true, true, false, true, true, sample_user_id),
    ('La Cantera Shops', 'Shopping Mall', 29.5729, -98.6158, '15900 La Cantera Pkwy, San Antonio, TX 78256', 4.4, 23, true, true, false, true, true, sample_user_id);

END $$;