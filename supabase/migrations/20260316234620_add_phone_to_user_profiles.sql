/*
  # Add Phone Number to User Profiles

  1. Changes
    - Add `phone` column to `user_profiles` table
    - Add `phone_verified` column to track verification status
    - Add `phone_verified_at` timestamp
  
  2. Notes
    - Phone numbers will be used for SMS reminders
    - 6-digit OTP codes will be sent for verification
*/

-- Add phone columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone_verified_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone_verified_at timestamptz;
  END IF;
END $$;
