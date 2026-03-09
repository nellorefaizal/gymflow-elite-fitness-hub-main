
-- Fix existing user: assign gym_owner role
INSERT INTO public.user_roles (user_id, role)
VALUES ('702e27ed-084f-4f44-bc64-c6542a5bc014', 'gym_owner')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create trigger to auto-assign gym_owner role on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'gym_owner')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
