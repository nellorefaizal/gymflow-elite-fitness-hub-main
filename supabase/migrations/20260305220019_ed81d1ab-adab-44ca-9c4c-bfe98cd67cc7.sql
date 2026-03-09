
-- Create enums
CREATE TYPE public.gym_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE public.subscription_plan_type AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE public.member_status AS ENUM ('active', 'expired', 'paused');
CREATE TYPE public.payment_method AS ENUM ('cash', 'upi', 'card', 'other');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'partial');
CREATE TYPE public.checkin_method AS ENUM ('qr', 'manual');
CREATE TYPE public.workout_category AS ENUM ('weight_loss', 'muscle_gain', 'beginner', 'custom');
CREATE TYPE public.notification_type AS ENUM ('expiry_reminder', 'payment_reminder', 'welcome', 'workout_assigned', 'attendance', 'announcement');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'closed');
CREATE TYPE public.app_role AS ENUM ('super_admin', 'gym_owner');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Gyms table
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  logo_url TEXT,
  status gym_status NOT NULL DEFAULT 'pending',
  subscription_plan subscription_plan_type NOT NULL DEFAULT 'starter',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- Membership plans
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  trainer_included BOOLEAN DEFAULT false,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Trainers
CREATE TABLE public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specialization TEXT,
  schedule TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

-- Members
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plan_id UUID REFERENCES public.membership_plans(id),
  trainer_id UUID REFERENCES public.trainers(id),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status member_status NOT NULL DEFAULT 'active',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Body measurements
CREATE TABLE public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  hips_cm DECIMAL(5,2),
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  method payment_method NOT NULL DEFAULT 'cash',
  status payment_status NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Attendance logs
CREATE TABLE public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_in_method checkin_method NOT NULL DEFAULT 'manual'
);
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Workout plans
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category workout_category NOT NULL DEFAULT 'custom',
  description TEXT,
  exercises JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

-- Member workout assignments
CREATE TABLE public.member_workout_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.member_workout_assignments ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  phone_number TEXT,
  status notification_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan subscription_plan_type NOT NULL DEFAULT 'starter',
  price DECIMAL(10,2) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status subscription_status NOT NULL DEFAULT 'active'
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('gym-media', 'gym-media', true);

-- Storage policies
CREATE POLICY "Public read gym media" ON storage.objects FOR SELECT USING (bucket_id = 'gym-media');
CREATE POLICY "Auth users upload gym media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gym-media' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users update gym media" ON storage.objects FOR UPDATE USING (bucket_id = 'gym-media' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users delete gym media" ON storage.objects FOR DELETE USING (bucket_id = 'gym-media' AND auth.role() = 'authenticated');

-- RLS Policies

-- User roles: users can read their own roles, super admins can read all
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Gyms: owners see their own, super admins see all
CREATE POLICY "Owners see own gym" ON public.gyms FOR SELECT USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners insert own gym" ON public.gyms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own gym" ON public.gyms FOR UPDATE USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins delete gyms" ON public.gyms FOR DELETE USING (public.has_role(auth.uid(), 'super_admin'));

-- Helper function to check gym ownership
CREATE OR REPLACE FUNCTION public.owns_gym(_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gyms WHERE id = _gym_id AND owner_id = auth.uid()
  )
$$;

-- Membership plans
CREATE POLICY "Gym owners manage plans" ON public.membership_plans FOR ALL USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Trainers
CREATE POLICY "Gym owners manage trainers" ON public.trainers FOR ALL USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Members
CREATE POLICY "Gym owners manage members" ON public.members FOR ALL USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Body measurements: through member's gym
CREATE OR REPLACE FUNCTION public.owns_member(_member_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members m JOIN public.gyms g ON m.gym_id = g.id WHERE m.id = _member_id AND g.owner_id = auth.uid()
  )
$$;

CREATE POLICY "Gym owners manage measurements" ON public.body_measurements FOR ALL USING (public.owns_member(member_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Payments
CREATE POLICY "Gym owners manage payments" ON public.payments FOR ALL USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Attendance logs
CREATE POLICY "Gym owners manage attendance" ON public.attendance_logs FOR ALL USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public checkin insert" ON public.attendance_logs FOR INSERT WITH CHECK (true);

-- Workout plans
CREATE POLICY "Gym owners manage workouts" ON public.workout_plans FOR ALL USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Member workout assignments
CREATE POLICY "Gym owners manage assignments" ON public.member_workout_assignments FOR ALL USING (public.owns_member(member_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Notifications
CREATE POLICY "Gym owners manage notifications" ON public.notifications FOR ALL USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Subscriptions
CREATE POLICY "Gym owners view subscriptions" ON public.subscriptions FOR SELECT USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins manage subscriptions" ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Support tickets
CREATE POLICY "Gym owners manage tickets" ON public.support_tickets FOR ALL USING (public.owns_gym(gym_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Public access for check-in page: allow reading member name/gym for check-in
CREATE POLICY "Public read members for checkin" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public read gyms for checkin" ON public.gyms FOR SELECT USING (true);

-- Function to create gym owner role on gym creation
CREATE OR REPLACE FUNCTION public.handle_new_gym_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.owner_id, 'gym_owner')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_gym_created
AFTER INSERT ON public.gyms
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_gym_owner();
