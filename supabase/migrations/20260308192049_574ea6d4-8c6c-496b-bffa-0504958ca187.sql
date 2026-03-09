
-- Add 'member' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'member';

-- Add user_id column to members table for member login
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create unique index on user_id (one user = one member)
CREATE UNIQUE INDEX IF NOT EXISTS members_user_id_unique ON public.members(user_id) WHERE user_id IS NOT NULL;

-- RLS policy: members can read their own member record
CREATE POLICY "Members can read own record"
ON public.members FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy: members can read their own attendance
CREATE POLICY "Members can read own attendance"
ON public.attendance_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members WHERE members.id = attendance_logs.member_id AND members.user_id = auth.uid()
  )
);

-- RLS policy: members can insert their own attendance (self check-in)
CREATE POLICY "Members can self checkin"
ON public.attendance_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members WHERE members.id = attendance_logs.member_id AND members.user_id = auth.uid()
  )
);

-- RLS policy: members can read their assigned workout plans
CREATE POLICY "Members can read own workout assignments"
ON public.member_workout_assignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members WHERE members.id = member_workout_assignments.member_id AND members.user_id = auth.uid()
  )
);

-- RLS policy: members can read workout plans assigned to them
CREATE POLICY "Members can read assigned workouts"
ON public.workout_plans FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.member_workout_assignments mwa
    JOIN public.members m ON m.id = mwa.member_id
    WHERE mwa.workout_plan_id = workout_plans.id AND m.user_id = auth.uid()
  )
  OR owns_gym(gym_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS policy: members can read own body measurements
CREATE POLICY "Members can read own measurements"
ON public.body_measurements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members WHERE members.id = body_measurements.member_id AND members.user_id = auth.uid()
  )
);

-- RLS policy: members can read their own gym info
CREATE POLICY "Members can read own gym"
ON public.gyms FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members WHERE members.gym_id = gyms.id AND members.user_id = auth.uid()
  )
);

-- RLS policy: members can read their membership plan
CREATE POLICY "Members can read own plan"
ON public.membership_plans FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members WHERE members.plan_id = membership_plans.id AND members.user_id = auth.uid()
  )
);

-- RLS policy: members can read own payments
CREATE POLICY "Members can read own payments"
ON public.payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members WHERE members.id = payments.member_id AND members.user_id = auth.uid()
  )
);

-- Allow members to read their own role
CREATE POLICY "Members read own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
