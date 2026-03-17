/*
  # Create C.R.APP Database Schema

  1. New Tables
    - `restrooms`: Store restroom locations and details
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text - Gas Station, Restaurant, etc)
      - `latitude` (float)
      - `longitude` (float)
      - `address` (text)
      - `rating` (float, average of reviews)
      - `review_count` (integer)
      - `changing_table` (boolean)
      - `accessible` (boolean)
      - `single_stall` (boolean)
      - `well_lit` (boolean)
      - `stocked` (boolean)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `reviews`: User ratings and comments
      - `id` (uuid, primary key)
      - `restroom_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `tags` (text array)
      - `created_at` (timestamp)

    - `user_profiles`: Extended user information
      - `id` (uuid, primary key, foreign key to auth.users)
      - `username` (text, unique)
      - `review_count` (integer)
      - `restroom_added_count` (integer)
      - `badge` (text - Scout, etc)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can read public restroom data
    - Users can create reviews for restrooms
    - Users can see their own profile and contributions
*/

CREATE TABLE IF NOT EXISTS restrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  latitude float NOT NULL,
  longitude float NOT NULL,
  address text,
  rating float DEFAULT 0,
  review_count integer DEFAULT 0,
  changing_table boolean DEFAULT false,
  accessible boolean DEFAULT false,
  single_stall boolean DEFAULT false,
  well_lit boolean DEFAULT true,
  stocked boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restroom_id uuid NOT NULL REFERENCES restrooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  review_count integer DEFAULT 0,
  restroom_added_count integer DEFAULT 0,
  badge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE restrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restrooms are publicly readable"
  ON restrooms FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create restrooms"
  ON restrooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own restrooms"
  ON restrooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Reviews are publicly readable"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE INDEX idx_reviews_restroom ON reviews(restroom_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_restrooms_created_by ON restrooms(created_by);