import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  active: boolean;
  created_at: string;
}

export default function SuperAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' as 'info' | 'warning' | 'success' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) { toast.error('Fill all fields'); return; }
    const newAnn: Announcement = {
      id: crypto.randomUUID(),
      title: form.title,
      message: form.message,
      type: form.type,
      active: true,
      created_at: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    toast.success('Announcement created');
    setShowAdd(false);
    setForm({ title: '', message: '', type: 'info' });
  };

  const toggleActive = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const remove = (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success('Announcement deleted');
  };

  const typeStyles: Record<string, string> = {
    info: 'border-blue-500/30 bg-blue-500/5',
    warning: 'border-warning/30 bg-warning/5',
    success: 'border-success/30 bg-success/5',
  };

  const typeBadge: Record<string, string> = {
    info: 'bg-blue-500/20 text-blue-400',
    warning: 'bg-warning/20 text-warning',
    success: 'bg-success/20 text-success',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-heading">Announcements</h1>
        <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent tracking-wider">
          <Plus className="h-4 w-4 mr-2" /> Create Announcement
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">Announcements appear as banners at the top of all gym owner dashboards.</p>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-heading mb-2">No Announcements</h3>
          <p className="text-muted-foreground mb-4">Create announcements to notify all gym owners</p>
          <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent">
            <Plus className="h-4 w-4 mr-2" /> Create Announcement
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className={`rounded-lg border p-5 transition-opacity ${typeStyles[a.type]} ${!a.active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{a.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${typeBadge[a.type]}`}>{a.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${a.active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {a.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Switch checked={a.active} onCheckedChange={() => toggleActive(a.id)} />
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Create Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label className="font-accent text-xs">Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="font-accent text-xs">Message *</Label>
              <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="mt-1 bg-secondary border-border min-h-[100px]" />
            </div>
            <div>
              <Label className="font-accent text-xs">Type</Label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="mt-1 w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm text-foreground">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
            </div>
            <Button type="submit" className="w-full gold-gradient text-primary-foreground rounded-full font-accent">
              Create Announcement
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
