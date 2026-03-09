import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/stat-card';
import { MessageSquare, AlertTriangle, Loader2, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuperAdminWhatsApp() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [nRes, gRes] = await Promise.all([
      supabase.from('notifications').select('*, gyms(name)').order('created_at', { ascending: false }).limit(200),
      supabase.from('gyms').select('id, name'),
    ]);
    setNotifications(nRes.data || []);
    setGyms(gRes.data || []);
    setLoading(false);
  };

  const totalSent = notifications.filter(n => n.status === 'sent').length;
  const totalPending = notifications.filter(n => n.status === 'pending').length;
  const totalFailed = notifications.filter(n => n.status === 'failed').length;

  // Group by type
  const typeBreakdown = notifications.reduce((acc: Record<string, number>, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(typeBreakdown).map(([type, count]) => ({
    type: type.replace(/_/g, ' '),
    count,
  }));

  // Per gym usage
  const gymUsage = gyms.map(g => ({
    name: g.name,
    total: notifications.filter(n => n.gym_id === g.id).length,
    failed: notifications.filter(n => n.gym_id === g.id && n.status === 'failed').length,
  })).filter(g => g.total > 0).sort((a, b) => b.total - a.total);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">WhatsApp Usage</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Messages" value={notifications.length} icon={MessageSquare} iconColor="text-blue-400" />
        <StatCard title="Sent" value={totalSent} icon={MessageSquare} iconColor="text-success" delay={100} />
        <StatCard title="Pending" value={totalPending} icon={MessageSquare} iconColor="text-warning" delay={200} />
        <StatCard title="Failed" value={totalFailed} icon={AlertTriangle} iconColor="text-destructive" delay={300} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Type */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-heading text-2xl mb-4">Messages by Type</h3>
          {typeData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No messages yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
                <XAxis dataKey="type" stroke="hsl(0 0% 53%)" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="hsl(0 0% 53%)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '8px', color: 'hsl(0 0% 96%)' }} />
                <Bar dataKey="count" fill="hsl(43 52% 54%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cost Tracker */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-heading text-2xl mb-4">Cost Estimate</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Cost per message</span>
              <span className="font-heading text-lg">₹0.50</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Total messages sent</span>
              <span className="font-heading text-lg">{totalSent}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium">Estimated cost</span>
              <span className="font-heading text-2xl gold-text">₹{(totalSent * 0.5).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per Gym Usage */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-2xl mb-4">Per Gym Usage</h3>
        {gymUsage.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No usage data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border font-accent text-xs text-muted-foreground">
                <th className="text-left py-3 px-4">Gym</th>
                <th className="text-left py-3 px-4">Messages This Month</th>
                <th className="text-left py-3 px-4">Failed</th>
                <th className="text-left py-3 px-4">Est. Cost</th>
              </tr></thead>
              <tbody>
                {gymUsage.map(g => (
                  <tr key={g.name} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium">{g.name}</td>
                    <td className="py-3 px-4">{g.total}</td>
                    <td className="py-3 px-4">{g.failed > 0 ? <span className="text-destructive">{g.failed}</span> : '0'}</td>
                    <td className="py-3 px-4 text-muted-foreground">₹{(g.total * 0.5).toFixed(2)}</td>
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
