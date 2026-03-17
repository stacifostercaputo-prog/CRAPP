/*
  # Add Favorites and User Preferences

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `restroom_id` (uuid, references restrooms)
      - `created_at` (timestamp)
    
    - `user_preferences`
      - `user_id` (uuid, primary key, references auth.users)
      - `notifications_enabled` (boolean, default true)
      - `location_tracking` (boolean, default true)
      - `dark_mode` (boolean, default false)
      - `distance_unit` (text, default 'miles')
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own favorites
    - Users can only access their own preferences
*/

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restroom_id uuid REFERENCES restrooms(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, restroom_id)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled boolean DEFAULT true,
  location_tracking boolean DEFAULT true,
  dark_mode boolean DEFAULT false,
  distance_unit text DEFAULT 'miles',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
