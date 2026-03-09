import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LifeBuoy, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Support() {
  const { gym } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (gym?.id) load(); }, [gym?.id]);

  const load = async () => {
    const { data } = await supabase.from('support_tickets').select('*').eq('gym_id', gym.id).order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) { toast.error('Fill all fields'); return; }
    setSaving(true);
    const { error } = await supabase.from('support_tickets').insert({ gym_id: gym.id, subject: form.subject, message: form.message });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Ticket submitted');
    setShowAdd(false);
    setForm({ subject: '', message: '' });
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-heading">Support</h1>
        <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent"><Plus className="h-4 w-4 mr-2" /> Submit Ticket</Button>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center py-20"><LifeBuoy className="h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-2xl font-heading">No Tickets</h3><p className="text-muted-foreground">Submit a ticket if you need help</p></div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{t.subject}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${t.status === 'open' ? 'bg-warning/20 text-warning' : t.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-success/20 text-success'}`}>{t.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t.message}</p>
              {t.reply && <div className="mt-3 p-3 rounded bg-secondary"><p className="text-xs font-accent text-primary mb-1">Reply:</p><p className="text-sm">{t.reply}</p></div>}
              <p className="text-xs text-muted-foreground mt-2">{new Date(t.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Submit Ticket</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><Label className="font-accent text-xs">Subject *</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <div><Label className="font-accent text-xs">Message *</Label><Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="mt-1 bg-secondary border-border min-h-[120px]" /></div>
            <Button type="submit" disabled={saving} className="w-full gold-gradient text-primary-foreground rounded-full font-accent">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
