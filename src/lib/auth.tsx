import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { isDemoMode, supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface MemberData {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  gym_id: string;
  gymName?: string;
  planName?: string;
  trainerName?: string;
  status: string;
  join_date?: string;
  expiry_date?: string | null;
  notes?: string | null;
  photo_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'super_admin' | 'gym_owner' | 'member' | null;
  gym: any | null;
  memberData: MemberData | null;
  signOut: () => Promise<void>;
  refreshGym: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, userRole: null, gym: null, memberData: null, signOut: async () => {}, refreshGym: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'super_admin' | 'gym_owner' | 'member' | null>(null);
  const [gym, setGym] = useState<any | null>(null);
  const [memberData, setMemberData] = useState<MemberData | null>(null);

  const enableDemoSession = useCallback(() => {
    const storedRole = localStorage.getItem('gymflow-demo-role') as 'super_admin' | 'gym_owner' | 'member' | null;
    const role = storedRole || 'gym_owner';
    setUser({ id: 'demo-user', email: role === 'super_admin' ? 'admin@demo.gymflow' : role === 'member' ? 'member@demo.gymflow' : 'owner@demo.gymflow' } as User);
    setSession(null);
    setUserRole(role);
    if (role === 'gym_owner') {
      setGym({ id: 'demo-gym', name: 'Demo Fitness Hub', status: 'active', subscription_plan: 'pro' });
    } else if (role === 'member') {
      setMemberData({
        id: 'demo-member', name: 'Demo Member', phone: '9876543210',
        gym_id: 'demo-gym', gymName: 'Demo Fitness Hub', planName: 'Pro Plan',
        status: 'active', join_date: '2025-01-01', expiry_date: '2026-12-31',
      });
    }
    setLoading(false);
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    // Fetch role - retry once if not found (trigger may be slow)
    let roles: any[] | null = null;
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    roles = rolesData;

    if (!roles || roles.length === 0) {
      await new Promise(r => setTimeout(r, 1000));
      const { data: retryRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      roles = retryRoles;
    }

    const role = roles && roles.length > 0 ? roles[0].role : null;
    setUserRole(role as any);

    if (role === 'member') {
      // Fetch member data
      const { data: member } = await supabase
        .from('members')
        .select('*, gyms(name), membership_plans(name), trainers(name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (member) {
        setMemberData({
          id: member.id,
          name: member.name,
          phone: member.phone,
          email: member.email,
          gym_id: member.gym_id,
          gymName: (member.gyms as any)?.name,
          planName: (member.membership_plans as any)?.name,
          trainerName: (member.trainers as any)?.name,
          status: member.status,
          join_date: member.join_date,
          expiry_date: member.expiry_date,
          notes: member.notes,
          photo_url: member.photo_url,
        });
      }
    } else {
      setMemberData(null);
      // Fetch gym for gym_owner
      const { data: gyms } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', userId);
      
      if (gyms && gyms.length > 0) {
        setGym(gyms[0]);
      } else {
        setGym(null);
      }
    }
  }, []);

  const refreshGym = useCallback(async () => {
    if (!user?.id) return;
    const { data: gyms } = await supabase
      .from('gyms')
      .select('*')
      .eq('owner_id', user.id);
    if (gyms && gyms.length > 0) {
      setGym(gyms[0]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isDemoMode) {
      enableDemoSession();
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id).then(() => setLoading(false));
        }, 0);
      } else {
        setUserRole(null);
        setGym(null);
        setMemberData(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [enableDemoSession, fetchUserData]);

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('gymflow-demo-role');
      setUser(null); setSession(null); setUserRole(null); setGym(null); setMemberData(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null); setSession(null); setUserRole(null); setGym(null); setMemberData(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, gym, memberData, signOut, refreshGym }}>
      {children}
    </AuthContext.Provider>
  );
}
