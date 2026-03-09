import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Search, Loader2, QrCode, Download, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export default function Members() {
  const { gym } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', plan_id: '', trainer_id: '', notes: '', createAccount: false, password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!gym?.id) return;
    loadData();
    
    // Set up real-time subscription for members
    const subscription = supabase
      .channel('members-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'members',
        filter: `gym_id=eq.${gym.id}`
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gym?.id]);

  const loadData = async () => {
    const [mRes, pRes, tRes] = await Promise.all([
      supabase.from('members').select('*, membership_plans(name), trainers(name)').eq('gym_id', gym.id).order('created_at', { ascending: false }),
      supabase.from('membership_plans').select('*').eq('gym_id', gym.id).eq('is_active', true),
      supabase.from('trainers').select('*').eq('gym_id', gym.id).eq('is_active', true),
    ]);
    setMembers(mRes.data || []);
    setPlans(pRes.data || []);
    setTrainers(tRes.data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return; }
    if (form.createAccount && (!form.email || !form.password)) { toast.error('Email and password required for member login'); return; }
    if (form.createAccount && form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    
    setSaving(true);
    const plan = plans.find(p => p.id === form.plan_id);
    const expiryDate = plan ? new Date(Date.now() + plan.duration_days * 86400000).toISOString().split('T')[0] : null;

    let memberUserId: string | null = null;

    // Create auth account for member if requested
    if (form.createAccount && form.email && form.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });
      if (authError) { setSaving(false); toast.error('Failed to create account: ' + authError.message); return; }
      memberUserId = authData.user?.id || null;

      // Create member role
      if (memberUserId) {
        await supabase.from('user_roles').insert({ user_id: memberUserId, role: 'member' as any });
      }
    }

    const { error, data } = await supabase.from('members').insert({
      gym_id: gym.id,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      plan_id: form.plan_id || null,
      trainer_id: form.trainer_id || null,
      expiry_date: expiryDate,
      notes: form.notes || null,
      user_id: memberUserId,
    } as any).select();
    
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    
    toast.success(`Member "${form.name}" added${form.createAccount ? ' with login account' : ''}`);
    setShowAdd(false);
    setForm({ name: '', phone: '', email: '', plan_id: '', trainer_id: '', notes: '', createAccount: false, password: '' });
    await loadData();
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this member?')) return;
    await supabase.from('members').delete().eq('id', id);
    toast.success('Member deleted');
    loadData();
  };

  const showMemberQR = async (member: any) => {
    setSelectedMember(member);
    const qrUrl = `${window.location.origin}/checkin/${member.id}`;
    console.log('Generating QR code for member:', { id: member.id, name: member.name, url: qrUrl });
    try {
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrDataUrl);
      setShowQR(true);
      toast.success(`QR code generated for ${member.name}`);
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQRCard = () => {
    if (!selectedMember || !qrCodeUrl) return;
    
    // Create a canvas to draw the member card
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 600, 800);

    // Header
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(0, 0, 600, 100);
    
    // Gym name
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gym.name.toUpperCase(), 300, 60);

    // Member info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(selectedMember.name, 300, 180);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#888888';
    ctx.fillText(`ID: ${selectedMember.id.slice(0, 8)}`, 300, 220);
    ctx.fillText(selectedMember.phone, 300, 250);

    // QR Code
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 100, 300, 400, 400);
      
      // Instructions
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText('Scan to Check In', 300, 740);
      
      // Download
      const link = document.createElement('a');
      link.download = `${selectedMember.name}-QR-Card.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('QR card downloaded');
    };
    qrImage.src = qrCodeUrl;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-heading">Members</h1>
        <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent tracking-wider">
          <Plus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="pl-10 bg-card border-border" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-heading mb-2">No Members Yet</h3>
          <p className="text-muted-foreground mb-4">Add your first member to get started</p>
          <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent">
            <Plus className="h-4 w-4 mr-2" /> Add Member
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-muted-foreground font-accent text-xs">
              <th className="text-left py-3 px-4">Member</th><th className="text-left py-3 px-4">Phone</th>
              <th className="text-left py-3 px-4 hidden md:table-cell">Plan</th><th className="text-left py-3 px-4 hidden lg:table-cell">Expiry</th>
              <th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center text-xs font-heading text-primary-foreground">{m.name[0]}</div>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{m.phone}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{m.membership_plans?.name || '-'}</td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    {m.expiry_date ? (
                      <span className={new Date(m.expiry_date) < new Date() ? 'text-destructive' : 'text-muted-foreground'}>{m.expiry_date}</span>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${m.status === 'active' ? 'bg-success/20 text-success' : m.status === 'expired' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}`}>{m.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => showMemberQR(m)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Add Member</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-accent text-xs">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
              <div><Label className="font-accent text-xs">Phone *</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            </div>
            <div><Label className="font-accent text-xs">Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-accent text-xs">Plan</Label>
                <select value={form.plan_id} onChange={e => setForm(f => ({ ...f, plan_id: e.target.value }))} className="mt-1 w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm text-foreground">
                  <option value="">No plan</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
                </select>
              </div>
              <div>
                <Label className="font-accent text-xs">Trainer</Label>
                <select value={form.trainer_id} onChange={e => setForm(f => ({ ...f, trainer_id: e.target.value }))} className="mt-1 w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm text-foreground">
                  <option value="">No trainer</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="font-accent text-xs">Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1 bg-secondary border-border" /></div>
            
            {/* Member Login Account */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.createAccount} onChange={e => setForm(f => ({ ...f, createAccount: e.target.checked }))} className="w-4 h-4 rounded accent-primary" />
                <div>
                  <p className="text-sm font-medium flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Create Member Login</p>
                  <p className="text-xs text-muted-foreground">Member can login to view workouts, track attendance & streaks</p>
                </div>
              </label>
              {form.createAccount && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div><Label className="font-accent text-xs">Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 bg-secondary border-border" placeholder="member@email.com" /></div>
                  <div><Label className="font-accent text-xs">Password *</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="mt-1 bg-secondary border-border" placeholder="Min 6 chars" /></div>
                </div>
              )}
            </div>
            <Button type="submit" disabled={saving} className="w-full gold-gradient text-primary-foreground rounded-full font-accent">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Member'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Member QR Code</DialogTitle></DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-heading mb-1">{selectedMember.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {selectedMember.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
              </div>
              
              {qrCodeUrl && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Member can scan this QR code to check in</p>
                <p className="text-xs mt-1">Check-in URL: {window.location.origin}/checkin/{selectedMember.id.slice(0, 8)}...</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadQRCard} className="flex-1 gold-gradient text-primary-foreground rounded-full font-accent">
                  <Download className="h-4 w-4 mr-2" /> Download Card
                </Button>
                <Button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/checkin/${selectedMember.id}`);
                  toast.success('Link copied to clipboard');
                }} variant="outline" className="flex-1 rounded-full font-accent">
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
