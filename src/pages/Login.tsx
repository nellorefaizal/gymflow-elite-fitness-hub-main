import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isDemoMode, supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Loader2, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'gym_owner' | 'member'>('gym_owner');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill all fields'); return; }

    if (isDemoMode) {
      const role = loginType === 'member' ? 'member' : email.toLowerCase().includes('admin') ? 'super_admin' : 'gym_owner';
      localStorage.setItem('gymflow-demo-role', role);
      toast.success(`Demo login successful (${role.replace('_', ' ')})`);
      navigate(role === 'super_admin' ? '/superadmin' : role === 'member' ? '/member' : '/dashboard');
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { 
      setLoading(false);
      toast.error(error.message); 
      return; 
    }
    
    // Fetch user role to determine redirect
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id);
    
    const role = roles && roles.length > 0 ? roles[0].role : null;

    if (role === 'super_admin') {
      setLoading(false);
      toast.success('Logged in successfully');
      navigate('/superadmin');
      return;
    }

    if (role === 'member') {
      setLoading(false);
      toast.success('Welcome back! 💪');
      navigate('/member');
      return;
    }
    
    // For gym owners, check if they have a gym
    const { data: gyms } = await supabase
      .from('gyms')
      .select('*')
      .eq('owner_id', data.user.id);
    
    setLoading(false);
    toast.success('Logged in successfully');
    
    if (gyms && gyms.length > 0) {
      if (gyms[0].status === 'suspended') {
        navigate('/pending');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-primary/20 bg-card p-6 sm:p-8 card-glow">
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <Dumbbell className="h-7 sm:h-8 w-7 sm:w-8 text-primary" />
          <span className="font-heading text-2xl sm:text-3xl gold-text">GymFlow</span>
        </div>
        <h2 className="text-center text-3xl sm:text-4xl font-heading mb-4 sm:mb-6">Welcome Back</h2>

        {/* Login Type Toggle */}
        <div className="flex rounded-full border border-border bg-secondary p-1 mb-6">
          <button
            type="button"
            onClick={() => setLoginType('gym_owner')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-accent transition-all ${
              loginType === 'gym_owner' ? 'gold-gradient text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Gym Owner
          </button>
          <button
            type="button"
            onClick={() => setLoginType('member')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-accent transition-all ${
              loginType === 'member' ? 'gold-gradient text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            Member
          </button>
        </div>

        {isDemoMode && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            {loginType === 'member' 
              ? 'Demo mode: Use any email/password to login as a gym member.'
              : 'Demo mode: Use any email/password. Include "admin" in email for Super Admin.'
            }
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          <div>
            <Label className="font-accent text-xs uppercase tracking-wider">Email</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="mt-1.5 bg-secondary border-border h-11 sm:h-12 text-base" 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <Label className="font-accent text-xs uppercase tracking-wider">Password</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="mt-1.5 bg-secondary border-border h-11 sm:h-12 text-base" 
              placeholder="••••••••" 
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full gold-gradient text-primary-foreground rounded-full font-accent tracking-wider hover:opacity-90 h-11 sm:h-12 text-base"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : loginType === 'member' ? 'Login as Member' : 'Login'}
          </Button>
        </form>

        {loginType === 'gym_owner' && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Register your gym</Link>
          </p>
        )}
        {loginType === 'member' && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Your gym owner creates your account. Contact them for access.
          </p>
        )}
      </div>
    </div>
  );
}
