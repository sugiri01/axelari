/*
  # Fix Profile Creation Policy

  ## Changes
  - Add policy to allow users to create their own profile during registration
  - This fixes the "new row violates row-level security policy" error during signup
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;

-- Create new policy that allows users to insert their own profile
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);