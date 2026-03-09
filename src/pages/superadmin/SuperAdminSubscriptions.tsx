import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/stat-card';
import { CreditCard, DollarSign, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function SuperAdminSubscriptions() {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('gyms').select('*').order('created_at', { ascending: false });
    setGyms(data || []);
    setLoading(false);
  };

  const planPrices: Record<string, number> = { starter: 500, pro: 1000, enterprise: 2000 };

  const starterCount = gyms.filter(g => g.subscription_plan === 'starter').length;
  const proCount = gyms.filter(g => g.subscription_plan === 'pro').length;
  const enterpriseCount = gyms.filter(g => g.subscription_plan === 'enterprise').length;
  const totalRevenue = gyms.filter(g => g.status === 'active').reduce((s, g) => s + (planPrices[g.subscription_plan] || 0), 0);

  const planData = [
    { name: 'Starter', value: starterCount, price: '₹500/mo' },
    { name: 'Pro', value: proCount, price: '₹1,000/mo' },
    { name: 'Enterprise', value: enterpriseCount, price: '₹2,000/mo' },
  ];
  const COLORS = ['hsl(43 52% 54%)', 'hsl(0 0% 70%)', 'hsl(43 30% 40%)'];

  const revenueByPlan = [
    { plan: 'Starter', revenue: starterCount * 500 },
    { plan: 'Pro', revenue: proCount * 1000 },
    { plan: 'Enterprise', revenue: enterpriseCount * 2000 },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">Subscriptions</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Monthly Revenue" value={totalRevenue} prefix="₹" icon={DollarSign} iconColor="text-primary" />
        <StatCard title="Total Subscriptions" value={gyms.filter(g => g.status === 'active').length} icon={CreditCard} iconColor="text-blue-400" delay={100} />
        <StatCard title="Total Gyms" value={gyms.length} icon={CreditCard} iconColor="text-success" delay={200} />
      </div>

      {/* Plan Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {planData.map((p, i) => (
          <div key={p.name} className="rounded-lg border border-border bg-card p-6 card-glow">
            <h3 className="text-2xl font-heading">{p.name}</h3>
            <p className="text-3xl font-heading gold-text mt-2">{p.price}</p>
            <p className="text-sm text-muted-foreground mt-2">{p.value} gyms subscribed</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${gyms.length > 0 ? (p.value / gyms.length) * 100 : 0}%`, background: COLORS[i] }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribution Chart */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-heading text-2xl mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={planData.filter(p => p.value > 0)} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {planData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '8px', color: 'hsl(0 0% 96%)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Plan */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-heading text-2xl mb-4">Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="plan" stroke="hsl(0 0% 53%)" fontSize={12} />
              <YAxis stroke="hsl(0 0% 53%)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '8px', color: 'hsl(0 0% 96%)' }} />
              <Bar dataKey="revenue" fill="hsl(43 52% 54%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All Subscriptions Table */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-2xl mb-4">All Gym Subscriptions</h3>
        {gyms.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No gyms registered yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border font-accent text-xs text-muted-foreground">
                <th className="text-left py-3 px-4">Gym</th><th className="text-left py-3 px-4">Plan</th>
                <th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Monthly</th>
                <th className="text-left py-3 px-4">Expires</th>
              </tr></thead>
              <tbody>
                {gyms.map(g => (
                  <tr key={g.id} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium">{g.name}</td>
                    <td className="py-3 px-4 font-accent text-xs uppercase">{g.subscription_plan}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${g.status === 'active' ? 'bg-success/20 text-success' : g.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>{g.status}</span>
                    </td>
                    <td className="py-3 px-4 font-heading text-lg">₹{planPrices[g.subscription_plan] || 0}</td>
                    <td className="py-3 px-4 text-muted-foreground">{g.subscription_expires_at ? new Date(g.subscription_expires_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
