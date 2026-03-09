
-- Fix: Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- attendance_logs
DROP POLICY IF EXISTS "Gym owners manage attendance" ON public.attendance_logs;
DROP POLICY IF EXISTS "Public checkin insert" ON public.attendance_logs;

CREATE POLICY "Gym owners manage attendance" ON public.attendance_logs
  FOR ALL TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Public checkin insert" ON public.attendance_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE members.id = attendance_logs.member_id));

-- body_measurements
DROP POLICY IF EXISTS "Gym owners manage measurements" ON public.body_measurements;
CREATE POLICY "Gym owners manage measurements" ON public.body_measurements
  FOR ALL TO authenticated
  USING (owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- gyms
DROP POLICY IF EXISTS "Owners insert own gym" ON public.gyms;
DROP POLICY IF EXISTS "Owners see own gym" ON public.gyms;
DROP POLICY IF EXISTS "Owners update own gym" ON public.gyms;
DROP POLICY IF EXISTS "Public read gyms for checkin" ON public.gyms;
DROP POLICY IF EXISTS "Super admins delete gyms" ON public.gyms;

CREATE POLICY "Owners insert own gym" ON public.gyms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners manage own gym" ON public.gyms
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Public read gyms for checkin" ON public.gyms
  FOR SELECT TO anon, authenticated
  USING (true);

-- members
DROP POLICY IF EXISTS "Gym owners manage members" ON public.members;
DROP POLICY IF EXISTS "Public read members for checkin" ON public.members;

CREATE POLICY "Gym owners manage members" ON public.members
  FOR ALL TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Public read members for checkin" ON public.members
  FOR SELECT TO anon, authenticated
  USING (true);

-- membership_plans
DROP POLICY IF EXISTS "Gym owners manage plans" ON public.membership_plans;
CREATE POLICY "Gym owners manage plans" ON public.membership_plans
  FOR ALL TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- notifications
DROP POLICY IF EXISTS "Gym owners manage notifications" ON public.notifications;
CREATE POLICY "Gym owners manage notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- payments
DROP POLICY IF EXISTS "Gym owners manage payments" ON public.payments;
CREATE POLICY "Gym owners manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- subscriptions
DROP POLICY IF EXISTS "Gym owners view subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Super admins manage subscriptions" ON public.subscriptions;

CREATE POLICY "Gym owners view subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- support_tickets
DROP POLICY IF EXISTS "Gym owners manage tickets" ON public.support_tickets;
CREATE POLICY "Gym owners manage tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- trainers
DROP POLICY IF EXISTS "Gym owners manage trainers" ON public.trainers;
CREATE POLICY "Gym owners manage trainers" ON public.trainers
  FOR ALL TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- user_roles
DROP POLICY IF EXISTS "Super admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- workout_plans
DROP POLICY IF EXISTS "Gym owners manage workouts" ON public.workout_plans;
CREATE POLICY "Gym owners manage workouts" ON public.workout_plans
  FOR ALL TO authenticated
  USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- member_workout_assignments
DROP POLICY IF EXISTS "Gym owners manage assignments" ON public.member_workout_assignments;
CREATE POLICY "Gym owners manage assignments" ON public.member_workout_assignments
  FOR ALL TO authenticated
  USING (owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role));
