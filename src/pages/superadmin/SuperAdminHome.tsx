import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/stat-card';
import { Building2, CheckCircle, Clock, Ban, DollarSign, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SuperAdminHome() {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('gyms').select('*').order('created_at', { ascending: false });
    setGyms(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'active' | 'pending' | 'suspended' | 'rejected') => {
    const { error } = await supabase.from('gyms').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Gym ${status}`);
    load();
  };

  const pending = gyms.filter(g => g.status === 'pending');
  const active = gyms.filter(g => g.status === 'active');

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Gyms" value={gyms.length} icon={Building2} iconColor="text-blue-400" />
        <StatCard title="Active Gyms" value={active.length} icon={CheckCircle} iconColor="text-success" delay={100} />
        <StatCard title="Pending Approval" value={pending.length} icon={Clock} iconColor="text-warning" delay={200} />
        <StatCard title="Suspended" value={gyms.filter(g => g.status === 'suspended').length} icon={Ban} iconColor="text-destructive" delay={300} />
      </div>

      {pending.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-card p-6">
          <h3 className="font-heading text-2xl mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            {pending.map(g => (
              <div key={g.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-xs text-muted-foreground">Plan: {g.subscription_plan} · {new Date(g.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateStatus(g.id, 'active')} className="bg-success text-success-foreground hover:bg-success/90 font-accent text-xs">Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(g.id, 'rejected')} className="font-accent text-xs">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-2xl mb-4">All Gyms</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border font-accent text-xs text-muted-foreground">
              <th className="text-left py-3 px-4">Gym</th><th className="text-left py-3 px-4">Plan</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Created</th><th className="text-left py-3 px-4">Actions</th>
            </tr></thead>
            <tbody>
              {gyms.map(g => (
                <tr key={g.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-4 font-medium">{g.name}</td>
                  <td className="py-3 px-4 font-accent text-xs uppercase">{g.subscription_plan}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${g.status === 'active' ? 'bg-success/20 text-success' : g.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>{g.status}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {g.status === 'active' && <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => updateStatus(g.id, 'suspended')}>Suspend</Button>}
                    {g.status === 'suspended' && <Button size="sm" variant="ghost" className="text-success text-xs" onClick={() => updateStatus(g.id, 'active')}>Activate</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
