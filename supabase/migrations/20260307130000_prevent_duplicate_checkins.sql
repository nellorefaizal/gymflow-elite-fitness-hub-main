-- Prevent duplicate check-ins on the same day
-- Add a unique constraint to ensure one check-in per member per day

-- Create an immutable function to extract date from timestamp
CREATE OR REPLACE FUNCTION get_checkin_date(ts TIMESTAMP WITH TIME ZONE)
RETURNS DATE AS $$
BEGIN
  RETURN ts::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a unique index to prevent duplicate check-ins per day
-- This ensures database-level enforcement
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_one_per_day 
ON attendance_logs (member_id, gym_id, get_checkin_date(check_in_time));

-- Add a comment explaining the constraint
COMMENT ON INDEX idx_attendance_one_per_day IS 'Ensures members can only check in once per day per gym';
