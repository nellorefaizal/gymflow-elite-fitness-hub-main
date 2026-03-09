import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GymSettings() {
  const { gym } = useAuth();
  const [form, setForm] = useState({
    name: gym?.name || '', address: gym?.address || '', phone: gym?.phone || '', whatsapp_number: gym?.whatsapp_number || '',
  });
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!gym?.id) return;
    setSaving(true);
    const { error } = await supabase.from('gyms').update(form).eq('id', gym.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile" className="font-accent text-xs">Gym Profile</TabsTrigger>
          <TabsTrigger value="subscription" className="font-accent text-xs">Subscription</TabsTrigger>
          <TabsTrigger value="whatsapp" className="font-accent text-xs">WhatsApp API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="rounded-lg border border-border bg-card p-6 max-w-lg space-y-4">
            <div><Label className="font-accent text-xs">Gym Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <div><Label className="font-accent text-xs">Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <div><Label className="font-accent text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <div><Label className="font-accent text-xs">WhatsApp Number</Label><Input value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <Button onClick={saveProfile} disabled={saving} className="gold-gradient text-primary-foreground rounded-full font-accent">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <div className="rounded-lg border border-primary/20 bg-card p-6 card-glow max-w-lg">
            <p className="font-accent text-xs text-muted-foreground">Current Plan</p>
            <p className="text-3xl font-heading gold-text mt-1 capitalize">{gym?.subscription_plan || 'Starter'}</p>
            {gym?.subscription_expires_at && <p className="text-sm text-muted-foreground mt-2">Expires: {new Date(gym.subscription_expires_at).toLocaleDateString()}</p>}
            <p className="text-sm text-muted-foreground mt-4">Contact support to upgrade your plan.</p>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <div className="rounded-lg border border-border bg-card p-6 max-w-lg space-y-4">
            <div><Label className="font-accent text-xs">WhatsApp Business API Key</Label><Input placeholder="Enter API key..." className="mt-1 bg-secondary border-border" /></div>
            <div><Label className="font-accent text-xs">Sender Phone Number</Label><Input placeholder="+91..." className="mt-1 bg-secondary border-border" /></div>
            <Button className="gold-gradient text-primary-foreground rounded-full font-accent">Save & Test</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
