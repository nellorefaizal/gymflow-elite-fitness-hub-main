import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function Plans() {
  const { gym } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', duration_days: '', price: '', trainer_included: false, description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (gym?.id) loadPlans(); }, [gym?.id]);

  const loadPlans = async () => {
    const { data } = await supabase.from('membership_plans').select('*').eq('gym_id', gym.id).order('created_at', { ascending: false });
    setPlans(data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.duration_days || !form.price) { toast.error('Fill all required fields'); return; }
    setSaving(true);
    const { error } = await supabase.from('membership_plans').insert({
      gym_id: gym.id, name: form.name, duration_days: parseInt(form.duration_days),
      price: parseFloat(form.price), trainer_included: form.trainer_included, description: form.description || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Plan created');
    setShowAdd(false);
    setForm({ name: '', duration_days: '', price: '', trainer_included: false, description: '' });
    loadPlans();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('membership_plans').update({ is_active: !current }).eq('id', id);
    loadPlans();
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    await supabase.from('membership_plans').delete().eq('id', id);
    toast.success('Plan deleted');
    loadPlans();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-heading">Membership Plans</h1>
        <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent tracking-wider">
          <Plus className="h-4 w-4 mr-2" /> Create Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Award className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-heading mb-2">No Plans Yet</h3>
          <p className="text-muted-foreground mb-4">Create membership plans for your gym</p>
          <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent"><Plus className="h-4 w-4 mr-2" /> Create Plan</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(p => (
            <div key={p.id} className={`rounded-lg border p-6 card-glow transition-colors ${p.is_active ? 'border-primary/20 bg-card' : 'border-border bg-card/50 opacity-60'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-heading">{p.name}</h3>
                  <p className="text-3xl font-heading gold-text mt-1">₹{p.price}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${p.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>{p.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{p.duration_days} days</p>
              {p.trainer_included && <span className="text-xs font-accent text-primary">Trainer Included</span>}
              {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => toggleActive(p.id, p.is_active)}>{p.is_active ? 'Deactivate' : 'Activate'}</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePlan(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Create Plan</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><Label className="font-accent text-xs">Plan Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-accent text-xs">Duration (days) *</Label><Input type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
              <div><Label className="font-accent text-xs">Price (₹) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.trainer_included} onCheckedChange={v => setForm(f => ({ ...f, trainer_included: v }))} />
              <Label className="font-accent text-xs">Trainer Included</Label>
            </div>
            <div><Label className="font-accent text-xs">Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <Button type="submit" disabled={saving} className="w-full gold-gradient text-primary-foreground rounded-full font-accent">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Plan'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
