/*
  # Add New York City and Oklahoma Restroom Data

  Adds sample bathroom locations for:
  - New York City, NY (Upper West Side and Midtown)
  - Oklahoma City, OK
  - Tulsa, OK

  Each location includes realistic details like ratings, amenities, and addresses.
*/

DO $$
DECLARE
  sample_user_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- New York City - Upper West Side locations
  INSERT INTO restrooms (name, type, latitude, longitude, address, rating, review_count, changing_table, accessible, single_stall, well_lit, stocked, created_by)
  VALUES
    ('Whole Foods Columbus Circle', 'Grocery Store', 40.7688, -73.9830, '10 Columbus Cir, New York, NY 10019', 4.3, 45, true, true, false, true, true, sample_user_id),
    ('American Museum of Natural History', 'Museum', 40.7813, -73.9740, '200 Central Park West, New York, NY 10024', 4.6, 67, true, true, false, true, true, sample_user_id),
    ('Lincoln Center Atrium', 'Performing Arts Center', 40.7722, -73.9844, '70 Lincoln Center Plaza, New York, NY 10023', 4.4, 38, true, true, false, true, true, sample_user_id),
    ('Trader Joes 72nd Street', 'Grocery Store', 40.7767, -73.9862, '2073 Broadway, New York, NY 10023', 3.8, 29, false, true, false, true, true, sample_user_id),

  -- New York City - Midtown locations
    ('Grand Central Terminal', 'Transit Station', 40.7527, -73.9772, '89 E 42nd St, New York, NY 10017', 4.2, 89, true, true, false, true, false, sample_user_id),
    ('Bryant Park Public Restroom', 'Park', 40.7536, -73.9832, 'Bryant Park, New York, NY 10018', 4.5, 52, true, true, false, true, true, sample_user_id),
    ('Times Square Visitor Center', 'Tourist Center', 40.7580, -73.9855, '1560 Broadway, New York, NY 10036', 3.9, 41, true, true, false, true, false, sample_user_id),
    ('New York Public Library', 'Library', 40.7532, -73.9822, '476 5th Ave, New York, NY 10018', 4.7, 63, true, true, false, true, true, sample_user_id),
    ('Macys Herald Square', 'Department Store', 40.7508, -73.9877, '151 W 34th St, New York, NY 10001', 4.0, 55, true, true, false, true, true, sample_user_id),

  -- Oklahoma City, OK locations
    ('Oklahoma City Museum of Art', 'Museum', 35.4676, -97.5164, '415 Couch Dr, Oklahoma City, OK 73102', 4.5, 18, true, true, false, true, true, sample_user_id),
    ('Bricktown Entertainment District', 'Entertainment District', 35.4634, -97.5089, 'E Sheridan Ave, Oklahoma City, OK 73104', 4.1, 24, true, true, false, true, true, sample_user_id),
    ('Whole Foods OKC', 'Grocery Store', 35.5234, -97.5310, '6543 N Western Ave, Oklahoma City, OK 73116', 4.3, 16, true, true, false, true, true, sample_user_id),
    ('Will Rogers World Airport', 'Airport', 35.3931, -97.6007, '7100 Terminal Dr, Oklahoma City, OK 73159', 4.0, 31, true, true, false, true, true, sample_user_id),
    ('Penn Square Mall', 'Shopping Mall', 35.5245, -97.5439, '1901 NW Expressway, Oklahoma City, OK 73118', 4.2, 22, true, true, false, true, true, sample_user_id),

  -- Tulsa, OK locations
    ('Gathering Place Park', 'Park', 36.0544, -95.9684, '2650 S John Williams Way, Tulsa, OK 74114', 4.8, 34, true, true, false, true, true, sample_user_id),
    ('Tulsa International Airport', 'Airport', 36.1984, -95.8881, '7777 E Apache St, Tulsa, OK 74115', 4.1, 26, true, true, false, true, true, sample_user_id),
    ('Woodland Hills Mall', 'Shopping Mall', 36.0628, -95.8897, '7021 S Memorial Dr, Tulsa, OK 74133', 4.3, 28, true, true, false, true, true, sample_user_id),
    ('BOK Center', 'Event Venue', 36.1553, -95.9928, '200 S Denver Ave, Tulsa, OK 74103', 4.2, 19, true, true, false, true, true, sample_user_id),
    ('Philbrook Museum', 'Museum', 36.1353, -95.9599, '2727 S Rockford Rd, Tulsa, OK 74114', 4.6, 21, true, true, false, true, true, sample_user_id);

END $$;