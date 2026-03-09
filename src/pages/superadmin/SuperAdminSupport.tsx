import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, LifeBuoy } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('support_tickets').select('*, gyms(name)').order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const reply = async (id: string) => {
    const text = replyText[id];
    if (!text) return;
    const { error } = await supabase.from('support_tickets').update({ reply: text, status: 'closed' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Reply sent');
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">Support Tickets</h1>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center py-20"><LifeBuoy className="h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-2xl font-heading">No Tickets</h3></div>
      ) : (
        <div className="space-y-4">
          {tickets.map(t => (
            <div key={t.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium">{t.subject}</h3>
                  <p className="text-xs text-muted-foreground">{t.gyms?.name} · {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-accent ${t.status === 'open' ? 'bg-warning/20 text-warning' : t.status === 'closed' ? 'bg-success/20 text-success' : 'bg-blue-500/20 text-blue-400'}`}>{t.status}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t.message}</p>
              {t.reply && <div className="p-3 rounded bg-secondary mb-3"><p className="text-xs font-accent text-primary mb-1">Your Reply:</p><p className="text-sm">{t.reply}</p></div>}
              {t.status !== 'closed' && (
                <div className="flex gap-2">
                  <Textarea value={replyText[t.id] || ''} onChange={e => setReplyText(r => ({ ...r, [t.id]: e.target.value }))} placeholder="Type reply..." className="bg-secondary border-border text-sm min-h-[60px]" />
                  <Button onClick={() => reply(t.id)} className="gold-gradient text-primary-foreground font-accent shrink-0">Reply</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
