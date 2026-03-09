import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/stat-card';
import { CreditCard, Plus, Loader2, DollarSign, Clock, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

export default function Payments() {
  const { gym } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [form, setForm] = useState({ member_id: '', amount: '', method: 'cash', status: 'paid', payment_date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { 
    if (gym?.id) {
      loadData();
      
      // Refresh members list every 5 seconds to ensure it's always up to date
      const refreshInterval = setInterval(() => {
        loadMembers();
      }, 5000);
      
      // Set up real-time subscriptions (works only with real Supabase, not demo mode)
      const paymentsSubscription = supabase
        .channel('payments-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'payments',
          filter: `gym_id=eq.${gym.id}`
        }, (payload) => {
          console.log('Payment change detected:', payload);
          loadData();
        })
        .subscribe();

      const membersSubscription = supabase
        .channel('members-changes-payments')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'members',
          filter: `gym_id=eq.${gym.id}`
        }, (payload) => {
          console.log('Member change detected:', payload);
          loadMembers();
        })
        .subscribe();

      return () => {
        clearInterval(refreshInterval);
        paymentsSubscription.unsubscribe();
        membersSubscription.unsubscribe();
      };
    }
  }, [gym?.id]);

  const loadMembers = async () => {
    const { data } = await supabase.from('members').select('id, name, phone').eq('gym_id', gym.id).order('name');
    setMembers(data || []);
  };

  const loadData = async () => {
    const [pRes, mRes] = await Promise.all([
      supabase.from('payments').select('*, members(name, phone)').eq('gym_id', gym.id).order('payment_date', { ascending: false }),
      supabase.from('members').select('id, name, phone').eq('gym_id', gym.id),
    ]);
    setPayments(pRes.data || []);
    setMembers(mRes.data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.member_id || !form.amount) { toast.error('Select member and enter amount'); return; }
    setSaving(true);
    const { error } = await supabase.from('payments').insert({
      gym_id: gym.id, 
      member_id: form.member_id, 
      amount: parseFloat(form.amount),
      method: form.method as any, 
      status: form.status as any, 
      payment_date: form.payment_date,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Payment recorded');
    setShowAdd(false);
    setForm({ member_id: '', amount: '', method: 'cash', status: 'paid', payment_date: new Date().toISOString().split('T')[0], notes: '' });
    loadData();
  };

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setForm({
      member_id: payment.member_id,
      amount: payment.amount.toString(),
      method: payment.method,
      status: payment.status,
      payment_date: payment.payment_date.split('T')[0],
      notes: payment.notes || ''
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) { toast.error('Enter amount'); return; }
    setSaving(true);
    const { error } = await supabase.from('payments').update({
      amount: parseFloat(form.amount),
      method: form.method as any,
      status: form.status as any,
      payment_date: form.payment_date,
      notes: form.notes || null,
    }).eq('id', editingPayment.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Payment updated');
    setShowEdit(false);
    setEditingPayment(null);
    setForm({ member_id: '', amount: '', method: 'cash', status: 'paid', payment_date: new Date().toISOString().split('T')[0], notes: '' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment record?')) return;
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Payment deleted');
    loadData();
  };

  const exportCSV = () => {
    const csv = Papa.unparse(payments.map(p => ({
      Member: p.members?.name, Amount: p.amount, Method: p.method, Status: p.status, Date: p.payment_date,
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click();
  };

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-heading">Payments</h1>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline" className="rounded-full font-accent"><Download className="h-4 w-4 mr-2" /> Export</Button>
          <Button onClick={() => setShowAdd(true)} className="gold-gradient text-primary-foreground rounded-full font-accent"><Plus className="h-4 w-4 mr-2" /> Add Payment</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Revenue" value={totalRevenue} prefix="₹" icon={DollarSign} iconColor="text-primary" />
        <StatCard title="Pending" value={pendingAmount} prefix="₹" icon={Clock} iconColor="text-warning" delay={100} />
        <StatCard title="Transactions" value={payments.length} icon={CreditCard} iconColor="text-blue-400" delay={200} />
      </div>

      <div className="flex gap-2">
        {['all', 'paid', 'pending', 'partial'].map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className={filter === f ? 'gold-gradient text-primary-foreground' : ''}>
            <span className="font-accent text-xs capitalize">{f}</span>
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20"><CreditCard className="h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-2xl font-heading">No Payments</h3></div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border font-accent text-xs text-muted-foreground">
              <th className="text-left py-3 px-4">Member</th><th className="text-left py-3 px-4">Amount</th><th className="text-left py-3 px-4">Method</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-4 font-medium">{p.members?.name || '-'}</td>
                  <td className="py-3 px-4 font-heading text-lg">₹{p.amount}</td>
                  <td className="py-3 px-4 text-muted-foreground font-accent text-xs uppercase">{p.method}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-accent ${p.status === 'paid' ? 'bg-success/20 text-success' : p.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-blue-500/20 text-blue-400'}`}>{p.status}</span></td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} className="text-primary hover:text-primary">Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (open) loadMembers(); }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-heading text-2xl">Add Payment</DialogTitle>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={loadMembers}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Refresh Members
              </Button>
            </div>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><Label className="font-accent text-xs uppercase tracking-wider">Member *</Label>
              <select value={form.member_id} onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))} className="mt-1.5 w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground">
                <option value="">Select member</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name} - {m.phone}</option>)}
              </select>
              <p className="text-xs text-muted-foreground mt-1">{members.length} members available</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-accent text-xs uppercase tracking-wider">Amount (₹) *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1.5 bg-secondary border-border" /></div>
              <div><Label className="font-accent text-xs uppercase tracking-wider">Payment Date *</Label><Input type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} className="mt-1.5 bg-secondary border-border" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-accent text-xs uppercase tracking-wider">Method</Label>
                <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="mt-1.5 w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground">
                  {['cash', 'upi', 'card', 'other'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>
              <div><Label className="font-accent text-xs uppercase tracking-wider">Status</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="mt-1.5 w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground">
                  {['paid', 'pending', 'partial'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="font-accent text-xs uppercase tracking-wider">Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1.5 bg-secondary border-border" placeholder="Optional notes" /></div>
            <Button type="submit" disabled={saving} className="w-full gold-gradient text-primary-foreground rounded-full font-accent h-11">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Edit Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div><Label className="font-accent text-xs uppercase tracking-wider">Member</Label>
              <Input value={members.find(m => m.id === form.member_id)?.name || ''} disabled className="mt-1.5 bg-secondary/50 border-border text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-accent text-xs uppercase tracking-wider">Amount (₹) *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1.5 bg-secondary border-border" /></div>
              <div><Label className="font-accent text-xs uppercase tracking-wider">Payment Date *</Label><Input type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} className="mt-1.5 bg-secondary border-border" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-accent text-xs uppercase tracking-wider">Method</Label>
                <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="mt-1.5 w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground">
                  {['cash', 'upi', 'card', 'other'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>
              <div><Label className="font-accent text-xs uppercase tracking-wider">Status</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="mt-1.5 w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground">
                  {['paid', 'pending', 'partial'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="font-accent text-xs uppercase tracking-wider">Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1.5 bg-secondary border-border" placeholder="Optional notes" /></div>
            <Button type="submit" disabled={saving} className="w-full gold-gradient text-primary-foreground rounded-full font-accent h-11">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Payment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
