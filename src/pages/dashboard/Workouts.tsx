import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardList, Plus, Loader2, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise { name: string; sets: string; reps: string; duration: string; rest: string; }

export default function Workouts() {
  const { gym } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'custom', description: '' });
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: '', reps: '', duration: '', rest: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (gym?.id) load(); }, [gym?.id]);

  const load = async () => {
    const { data } = await supabase.from('workout_plans').select('*').eq('gym_id', gym.id).order('created_at', { ascending: false });
    setPlans(data || []);
    setLoading(false);
  };

  const addExercise = () => setExercises([...exercises, { name: '', sets: '', reps: '', duration: '', rest: '' }]);
  const removeExercise = (i: number) => setExercises(exercises.filter((_, idx) => idx !== i));
  const updateExercise = (i: number, key: keyof Exercise, value: string) => {
    const updated = [...exercises];
    updated[i] = { ...updated[i], [key]: value };
    setExercises(updated);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Plan name required'); return; }
    setSaving(true);
    const { error } = await supabase.from('workout_plans').insert([{
      gym_id: gym.id, name: form.name, category: form.category as any,
      description: form.description || null, exercises: JSON.parse(JSON.stringify(exercises.filter(ex => ex.name))),
    }]);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Workout plan created');
    setShowAdd(false);
    setForm({ name: '', category: 'custom', description: '' });
    setExercises([{ name: '', sets: '', reps: '', duration: '', rest: '' }]);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete workout plan?')) return;
    await supabase.from('workout_plans').delete().eq('id', id);
    toast.success('Deleted');
    load();
  };

  const categoryColors: Record<string, string> = {
    weight_loss: 'bg-orange-500/20 text-orange-400',
    muscle_gain: 'bg-blue-500/20 text-blue-400',
    beginner: 'bg-success/20 text-success',
    custom: 'bg-primary/20 text-primary',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-heading">Workout Plans</h1>
        <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent"><Plus className="h-4 w-4 mr-2" /> Create Plan</Button>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center py-20"><ClipboardList className="h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-2xl font-heading">No Workout Plans</h3></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(p => (
            <div key={p.id} className="rounded-lg border border-border bg-card p-6 card-glow hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-heading">{p.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${categoryColors[p.category] || categoryColors.custom}`}>{p.category.replace('_', ' ')}</span>
              </div>
              {p.description && <p className="text-sm text-muted-foreground mb-3">{p.description}</p>}
              <p className="text-xs text-muted-foreground">{(p.exercises as any[])?.length || 0} exercises</p>
              <Button variant="ghost" size="sm" className="mt-3 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Create Workout Plan</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-accent text-xs">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
              <div><Label className="font-accent text-xs">Category</Label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1 w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm text-foreground">
                  <option value="weight_loss">Weight Loss</option><option value="muscle_gain">Muscle Gain</option><option value="beginner">Beginner</option><option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div><Label className="font-accent text-xs">Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            
            <div>
              <Label className="font-accent text-xs mb-2 block">Exercises</Label>
              {exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Exercise" value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)} className="bg-secondary border-border" />
                  <Input placeholder="Sets" value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} className="w-16 bg-secondary border-border" />
                  <Input placeholder="Reps" value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} className="w-16 bg-secondary border-border" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(i)} className="text-destructive shrink-0"><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addExercise}><Plus className="h-3 w-3 mr-1" /> Add Exercise</Button>
            </div>

            <Button type="submit" disabled={saving} className="w-full gold-gradient text-primary-foreground rounded-full font-accent">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Plan'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
