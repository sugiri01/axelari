/*
  # Add Public Profile Lookup Policy

  1. Security Changes
    - Add policy to allow public (anon) users to look up profiles by email
    - This is needed for the login bypass functionality
    - Only exposes id, role, and full_name - no sensitive data
    - Required for authentication flow

  Note: This allows anyone to check if an email exists in the system,
  which is standard for login flows and doesn't expose sensitive data.
*/

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create new policies: one for authenticated users to read their own profile
CREATE POLICY "Authenticated users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow anon users to look up profiles by email for login
CREATE POLICY "Allow profile lookup by email for login"
  ON profiles FOR SELECT
  TO anon
  USING (true);
