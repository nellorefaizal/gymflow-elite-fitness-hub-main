import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dumbbell, Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Trainers() {
  const { gym } = useAuth();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', specialization: '', schedule: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (gym?.id) load(); }, [gym?.id]);

  const load = async () => {
    const { data } = await supabase.from('trainers').select('*').eq('gym_id', gym.id).order('created_at', { ascending: false });
    setTrainers(data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    const { error } = await supabase.from('trainers').insert({ gym_id: gym.id, ...form });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Trainer added');
    setShowAdd(false);
    setForm({ name: '', phone: '', email: '', specialization: '', schedule: '' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete trainer?')) return;
    await supabase.from('trainers').delete().eq('id', id);
    toast.success('Deleted');
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-heading">Trainers</h1>
        <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent"><Plus className="h-4 w-4 mr-2" /> Add Trainer</Button>
      </div>

      {trainers.length === 0 ? (
        <div className="flex flex-col items-center py-20"><Dumbbell className="h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-2xl font-heading">No Trainers</h3><p className="text-muted-foreground mb-4">Add trainers to your gym</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainers.map(t => (
            <div key={t.id} className="rounded-lg border border-border bg-card p-6 card-glow hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gold-gradient flex items-center justify-center font-heading text-xl text-primary-foreground">{t.name[0]}</div>
                  <div>
                    <h3 className="font-heading text-xl">{t.name}</h3>
                    {t.specialization && <p className="text-xs font-accent text-primary">{t.specialization}</p>}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${t.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>{t.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              {t.phone && <p className="text-sm text-muted-foreground mt-3">{t.phone}</p>}
              {t.schedule && <p className="text-xs text-muted-foreground mt-1">{t.schedule}</p>}
              <Button variant="ghost" size="sm" className="mt-3 text-destructive" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Add Trainer</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><Label className="font-accent text-xs">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-accent text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
              <div><Label className="font-accent text-xs">Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            </div>
            <div><Label className="font-accent text-xs">Specialization</Label><Input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <div><Label className="font-accent text-xs">Schedule</Label><Input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <Button type="submit" disabled={saving} className="w-full gold-gradient text-primary-foreground rounded-full font-accent">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Trainer'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
