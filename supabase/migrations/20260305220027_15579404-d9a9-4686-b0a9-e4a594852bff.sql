
-- Fix overly permissive insert policy on attendance_logs
DROP POLICY IF EXISTS "Public checkin insert" ON public.attendance_logs;
-- Allow public insert only if member exists
CREATE POLICY "Public checkin insert" ON public.attendance_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.members WHERE id = member_id)
);
