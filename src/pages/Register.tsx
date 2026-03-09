import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isDemoMode, supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [form, setForm] = useState({
    ownerName: '', email: '', password: '', gymName: '', phone: '', whatsapp: '', address: '', plan: 'starter' as 'starter' | 'pro' | 'enterprise',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ownerName || !form.email || !form.password || !form.gymName) {
      toast.error('Please fill all required fields'); return;
    }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    
    if (isDemoMode) {
      localStorage.setItem('gymflow-demo-role', 'gym_owner');
      setSuccess(true);
      toast.success('Demo gym registered successfully');
      return;
    }

    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.ownerName }, emailRedirectTo: window.location.origin },
    });

    if (authError) { toast.error(authError.message); setLoading(false); return; }
    if (!authData.user) { toast.error('Registration failed'); setLoading(false); return; }

    const { error: gymError } = await supabase.from('gyms').insert({
      owner_id: authData.user.id,
      name: form.gymName,
      phone: form.phone,
      whatsapp_number: form.whatsapp,
      address: form.address,
      subscription_plan: form.plan,
      status: 'active',
    });

    setLoading(false);
    if (gymError) { toast.error('Failed to create gym: ' + gymError.message); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-xl border border-primary/20 bg-card p-6 sm:p-8 card-glow text-center">
          <CheckCircle className="h-14 sm:h-16 w-14 sm:w-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-heading mb-3 sm:mb-4">Registration Successful!</h2>
          <p className="text-muted-foreground mb-2 text-sm sm:text-base">Your gym is now active.</p>
          <p className="text-muted-foreground text-xs sm:text-sm mb-6 sm:mb-8">You can log in immediately and start managing your gym.</p>
          <Button asChild className="gold-gradient text-primary-foreground rounded-full font-accent tracking-wider w-full h-11 sm:h-12">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const plans = [
    { value: 'starter', label: 'Starter', price: '₹500/mo' },
    { value: 'pro', label: 'Pro', price: '₹1,000/mo' },
    { value: 'enterprise', label: 'Enterprise', price: '₹2,000/mo' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg rounded-xl border border-primary/20 bg-card p-6 sm:p-8 card-glow">
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <Dumbbell className="h-7 sm:h-8 w-7 sm:w-8 text-primary" />
          <span className="font-heading text-2xl sm:text-3xl gold-text">GymFlow</span>
        </div>
        <h2 className="text-center text-3xl sm:text-4xl font-heading mb-6 sm:mb-8">Register Your Gym</h2>
        {isDemoMode && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            Demo mode is active. Registration will create a local demo gym and open the dashboard.
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-accent text-xs uppercase tracking-wider">Owner Name *</Label>
              <Input 
                value={form.ownerName} 
                onChange={e => update('ownerName', e.target.value)} 
                className="mt-1.5 bg-secondary border-border h-11 text-base" 
              />
            </div>
            <div>
              <Label className="font-accent text-xs uppercase tracking-wider">Email *</Label>
              <Input 
                type="email" 
                value={form.email} 
                onChange={e => update('email', e.target.value)} 
                className="mt-1.5 bg-secondary border-border h-11 text-base" 
              />
            </div>
          </div>
          <div>
            <Label className="font-accent text-xs uppercase tracking-wider">Password *</Label>
            <Input 
              type="password" 
              value={form.password} 
              onChange={e => update('password', e.target.value)} 
              className="mt-1.5 bg-secondary border-border h-11 text-base" 
              placeholder="Min 6 characters" 
            />
          </div>
          <div>
            <Label className="font-accent text-xs uppercase tracking-wider">Gym Name *</Label>
            <Input 
              value={form.gymName} 
              onChange={e => update('gymName', e.target.value)} 
              className="mt-1.5 bg-secondary border-border h-11 text-base" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-accent text-xs uppercase tracking-wider">Phone</Label>
              <Input 
                value={form.phone} 
                onChange={e => update('phone', e.target.value)} 
                className="mt-1.5 bg-secondary border-border h-11 text-base" 
              />
            </div>
            <div>
              <Label className="font-accent text-xs uppercase tracking-wider">WhatsApp Number</Label>
              <Input 
                value={form.whatsapp} 
                onChange={e => update('whatsapp', e.target.value)} 
                className="mt-1.5 bg-secondary border-border h-11 text-base" 
              />
            </div>
          </div>
          <div>
            <Label className="font-accent text-xs uppercase tracking-wider">Address</Label>
            <Input 
              value={form.address} 
              onChange={e => update('address', e.target.value)} 
              className="mt-1.5 bg-secondary border-border h-11 text-base" 
            />
          </div>
          <div>
            <Label className="font-accent text-xs uppercase tracking-wider mb-2 block">Subscription Plan</Label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {plans.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => update('plan', p.value)}
                  className={`rounded-lg border p-2.5 sm:p-3 text-center transition-all ${form.plan === p.value ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-secondary hover:border-primary/30'}`}
                >
                  <p className="font-heading text-base sm:text-lg">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.price}</p>
                </button>
              ))}
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full gold-gradient text-primary-foreground rounded-full font-accent tracking-wider hover:opacity-90 h-11 sm:h-12 text-base mt-6"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Register Gym'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
