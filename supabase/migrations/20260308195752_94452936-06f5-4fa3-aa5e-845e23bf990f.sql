
-- Drop ALL existing policies and recreate as PERMISSIVE

-- ============ USER_ROLES ============
DROP POLICY IF EXISTS "Members read own role" ON user_roles;
DROP POLICY IF EXISTS "Super admins manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;

CREATE POLICY "Users read own roles" ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Super admins manage roles" ON user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
-- Allow the trigger to handle role creation, but gym owners need to insert member roles
CREATE POLICY "Gym owners insert member roles" ON user_roles FOR INSERT TO authenticated WITH CHECK (
  role = 'member'::app_role AND has_role(auth.uid(), 'gym_owner'::app_role)
);

-- ============ GYMS ============
DROP POLICY IF EXISTS "Allow public read gyms for check-in" ON gyms;
DROP POLICY IF EXISTS "Members can read own gym" ON gyms;
DROP POLICY IF EXISTS "Owners insert own gym" ON gyms;
DROP POLICY IF EXISTS "Owners manage own gym" ON gyms;
DROP POLICY IF EXISTS "Public read gyms for checkin" ON gyms;

CREATE POLICY "Public read gyms" ON gyms FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated read gyms" ON gyms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners insert own gym" ON gyms FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own gym" ON gyms FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Owners delete own gym" ON gyms FOR DELETE TO authenticated USING (auth.uid() = owner_id OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ MEMBERS ============
DROP POLICY IF EXISTS "Allow public read for check-in" ON members;
DROP POLICY IF EXISTS "Gym owners manage members" ON members;
DROP POLICY IF EXISTS "Members can read own record" ON members;
DROP POLICY IF EXISTS "Public read members for checkin" ON members;

CREATE POLICY "Public read members" ON members FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated read members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gym owners insert members" ON members FOR INSERT TO authenticated WITH CHECK (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update members" ON members FOR UPDATE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners delete members" ON members FOR DELETE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ ATTENDANCE_LOGS ============
DROP POLICY IF EXISTS "Allow public insert attendance" ON attendance_logs;
DROP POLICY IF EXISTS "Gym owners manage attendance" ON attendance_logs;
DROP POLICY IF EXISTS "Members can read own attendance" ON attendance_logs;
DROP POLICY IF EXISTS "Members can self checkin" ON attendance_logs;
DROP POLICY IF EXISTS "Public checkin insert" ON attendance_logs;

CREATE POLICY "Public read attendance" ON attendance_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated read attendance" ON attendance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert attendance" ON attendance_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated insert attendance" ON attendance_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Gym owners update attendance" ON attendance_logs FOR UPDATE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners delete attendance" ON attendance_logs FOR DELETE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ MEMBERSHIP_PLANS ============
DROP POLICY IF EXISTS "Gym owners manage plans" ON membership_plans;
DROP POLICY IF EXISTS "Members can read own plan" ON membership_plans;

CREATE POLICY "Authenticated read plans" ON membership_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gym owners insert plans" ON membership_plans FOR INSERT TO authenticated WITH CHECK (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update plans" ON membership_plans FOR UPDATE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners delete plans" ON membership_plans FOR DELETE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ TRAINERS ============
DROP POLICY IF EXISTS "Gym owners manage trainers" ON trainers;

CREATE POLICY "Authenticated read trainers" ON trainers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gym owners insert trainers" ON trainers FOR INSERT TO authenticated WITH CHECK (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update trainers" ON trainers FOR UPDATE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners delete trainers" ON trainers FOR DELETE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ PAYMENTS ============
DROP POLICY IF EXISTS "Gym owners manage payments" ON payments;
DROP POLICY IF EXISTS "Members can read own payments" ON payments;

CREATE POLICY "Authenticated read payments" ON payments FOR SELECT TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR EXISTS (SELECT 1 FROM members WHERE members.id = payments.member_id AND members.user_id = auth.uid()));
CREATE POLICY "Gym owners insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update payments" ON payments FOR UPDATE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners delete payments" ON payments FOR DELETE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ NOTIFICATIONS ============
DROP POLICY IF EXISTS "Gym owners manage notifications" ON notifications;

CREATE POLICY "Gym owners read notifications" ON notifications FOR SELECT TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update notifications" ON notifications FOR UPDATE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ SUPPORT_TICKETS ============
DROP POLICY IF EXISTS "Gym owners manage tickets" ON support_tickets;

CREATE POLICY "Gym owners read tickets" ON support_tickets FOR SELECT TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners insert tickets" ON support_tickets FOR INSERT TO authenticated WITH CHECK (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update tickets" ON support_tickets FOR UPDATE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ SUBSCRIPTIONS ============
DROP POLICY IF EXISTS "Gym owners view subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Super admins manage subscriptions" ON subscriptions;

CREATE POLICY "Read subscriptions" ON subscriptions FOR SELECT TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins manage subscriptions" ON subscriptions FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- ============ WORKOUT_PLANS ============
DROP POLICY IF EXISTS "Gym owners manage workouts" ON workout_plans;
DROP POLICY IF EXISTS "Members can read assigned workouts" ON workout_plans;

CREATE POLICY "Read workout plans" ON workout_plans FOR SELECT TO authenticated USING (
  owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR 
  EXISTS (SELECT 1 FROM member_workout_assignments mwa JOIN members m ON m.id = mwa.member_id WHERE mwa.workout_plan_id = workout_plans.id AND m.user_id = auth.uid())
);
CREATE POLICY "Gym owners insert workouts" ON workout_plans FOR INSERT TO authenticated WITH CHECK (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update workouts" ON workout_plans FOR UPDATE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners delete workouts" ON workout_plans FOR DELETE TO authenticated USING (owns_gym(gym_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ MEMBER_WORKOUT_ASSIGNMENTS ============
DROP POLICY IF EXISTS "Gym owners manage assignments" ON member_workout_assignments;
DROP POLICY IF EXISTS "Members can read own workout assignments" ON member_workout_assignments;

CREATE POLICY "Read workout assignments" ON member_workout_assignments FOR SELECT TO authenticated USING (
  owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (SELECT 1 FROM members WHERE members.id = member_workout_assignments.member_id AND members.user_id = auth.uid())
);
CREATE POLICY "Gym owners insert assignments" ON member_workout_assignments FOR INSERT TO authenticated WITH CHECK (owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update assignments" ON member_workout_assignments FOR UPDATE TO authenticated USING (owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners delete assignments" ON member_workout_assignments FOR DELETE TO authenticated USING (owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ BODY_MEASUREMENTS ============
DROP POLICY IF EXISTS "Gym owners manage measurements" ON body_measurements;
DROP POLICY IF EXISTS "Members can read own measurements" ON body_measurements;

CREATE POLICY "Read measurements" ON body_measurements FOR SELECT TO authenticated USING (
  owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (SELECT 1 FROM members WHERE members.id = body_measurements.member_id AND members.user_id = auth.uid())
);
CREATE POLICY "Gym owners insert measurements" ON body_measurements FOR INSERT TO authenticated WITH CHECK (owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners update measurements" ON body_measurements FOR UPDATE TO authenticated USING (owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Gym owners delete measurements" ON body_measurements FOR DELETE TO authenticated USING (owns_member(member_id) OR has_role(auth.uid(), 'super_admin'::app_role));
