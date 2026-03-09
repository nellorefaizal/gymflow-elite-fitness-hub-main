import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { MessageSquare, Info, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WhatsApp() {
  const { gym } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    expiry7: true, expiry3: true, expiryDay: true, paymentReminder: false,
    welcome: true, workoutAssigned: true, attendance: false,
  });

  useEffect(() => { if (gym?.id) loadNotifications(); }, [gym?.id]);

  const loadNotifications = async () => {
    const { data } = await supabase.from('notifications')
      .select('*, members(name)')
      .eq('gym_id', gym.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  };

  const toggle = (key: string) => setSettings(s => ({ ...s, [key]: !s[key as keyof typeof s] }));

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/20 text-warning',
    sent: 'bg-success/20 text-success',
    failed: 'bg-destructive/20 text-destructive',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">WhatsApp Notifications</h1>

      <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">WhatsApp Integration Required</p>
          <p className="text-xs text-muted-foreground mt-1">Connect your WhatsApp Business API key in Settings to enable real message sending. Currently, messages are simulated and logged.</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-2xl mb-6">Automation Settings</h3>
        <div className="space-y-4">
          {[
            { key: 'expiry7', label: 'Expiry reminder 7 days before' },
            { key: 'expiry3', label: 'Expiry reminder 3 days before' },
            { key: 'expiryDay', label: 'Expiry reminder on day of expiry' },
            { key: 'paymentReminder', label: 'Payment pending reminder' },
            { key: 'welcome', label: 'Welcome message on join' },
            { key: 'workoutAssigned', label: 'Workout assigned notification' },
            { key: 'attendance', label: 'Attendance confirmation' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <Label className="text-sm">{item.label}</Label>
              <Switch checked={settings[item.key as keyof typeof settings]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
        <Button onClick={() => toast.success('Settings saved (stored locally)')} className="mt-6 gold-gradient text-primary-foreground rounded-full font-accent">Save Settings</Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-2xl mb-4">Notification Log</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border font-accent text-xs text-muted-foreground">
                <th className="text-left py-3 px-3">Member</th><th className="text-left py-3 px-3">Type</th>
                <th className="text-left py-3 px-3 hidden md:table-cell">Message</th><th className="text-left py-3 px-3">Status</th><th className="text-left py-3 px-3">Date</th>
              </tr></thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="py-3 px-3 font-medium">{n.members?.name || n.phone_number || '-'}</td>
                    <td className="py-3 px-3 font-accent text-xs">{n.type.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{n.message}</td>
                    <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-accent ${statusColors[n.status] || ''}`}>{n.status}</span></td>
                    <td className="py-3 px-3 text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</td>
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
