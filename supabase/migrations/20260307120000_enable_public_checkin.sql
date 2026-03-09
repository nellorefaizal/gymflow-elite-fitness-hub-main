-- Enable public read access for members table (for QR check-in)
-- This allows unauthenticated users to read member data when scanning QR codes

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read for check-in" ON members;
DROP POLICY IF EXISTS "Allow public read gyms for check-in" ON gyms;
DROP POLICY IF EXISTS "Allow public insert attendance" ON attendance_logs;

-- Allow public to read members (needed for QR check-in verification)
CREATE POLICY "Allow public read for check-in"
ON members
FOR SELECT
TO anon
USING (true);

-- Allow public to read gym info (needed to verify gym status during check-in)
CREATE POLICY "Allow public read gyms for check-in"
ON gyms
FOR SELECT
TO anon
USING (true);

-- Allow public to insert attendance logs (needed for QR check-in)
CREATE POLICY "Allow public insert attendance"
ON attendance_logs
FOR INSERT
TO anon
WITH CHECK (true);

-- Note: These policies allow unauthenticated access for the QR check-in feature
-- The check-in page validates membership status, expiry, and location before recording attendance
