import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { CalendarCheck, Loader2, Flame, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MemberAttendance() {
  const { memberData } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!memberData?.id) return;
    loadData();
  }, [memberData?.id]);

  const loadData = async () => {
    const { data } = await supabase
      .from('attendance_logs')
      .select('check_in_time, check_in_method')
      .eq('member_id', memberData!.id)
      .order('check_in_time', { ascending: false })
      .limit(200);

    const logsData = data || [];
    setLogs(logsData);

    const today = new Date().toISOString().split('T')[0];
    setTodayCheckedIn(logsData.some(l => l.check_in_time.startsWith(today)));

    // Build heatmap for last 90 days
    const map: Record<string, number> = {};
    for (let i = 0; i < 90; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      map[d] = 0;
    }
    logsData.forEach(l => {
      const d = l.check_in_time.split('T')[0];
      if (map[d] !== undefined) map[d]++;
    });
    setHeatmap(map);
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!memberData?.id || !memberData?.gym_id) return;
    if (todayCheckedIn) { toast.error('Already checked in today!'); return; }
    setCheckingIn(true);
    const { error } = await supabase.from('attendance_logs').insert({
      member_id: memberData.id,
      gym_id: memberData.gym_id,
      check_in_method: 'manual',
    });
    setCheckingIn(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Checked in! 💪');
    loadData();
  };

  const heatmapDays = Object.entries(heatmap).sort(([a], [b]) => a.localeCompare(b));
  const weeks: string[][] = [];
  let currentWeek: string[] = [];
  heatmapDays.forEach(([date]) => {
    const dow = new Date(date).getDay();
    if (dow === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length) weeks.push(currentWeek);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading">Attendance</h1>
          <p className="text-muted-foreground font-accent text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button
          onClick={handleCheckIn}
          disabled={todayCheckedIn || checkingIn}
          className={`rounded-full font-accent tracking-wider px-6 py-5 text-base ${
            todayCheckedIn 
              ? 'bg-success/20 text-success border border-success/30' 
              : 'gold-gradient text-primary-foreground hover:opacity-90'
          }`}
        >
          {todayCheckedIn ? (
            <><CalendarCheck className="h-5 w-5 mr-2" /> Checked In Today ✓</>
          ) : checkingIn ? (
            'Checking in...'
          ) : (
            <><Zap className="h-5 w-5 mr-2" /> Check In Now</>
          )}
        </Button>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 card-glow"
      >
        <h3 className="font-heading text-2xl mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Activity Heatmap
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-[600px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map(date => {
                  const count = heatmap[date] || 0;
                  const isToday = date === new Date().toISOString().split('T')[0];
                  return (
                    <div
                      key={date}
                      title={`${date}: ${count} check-in${count !== 1 ? 's' : ''}`}
                      className={`w-4 h-4 rounded-sm transition-colors ${
                        isToday ? 'ring-1 ring-primary' : ''
                      } ${
                        count >= 2 ? 'bg-primary' : count === 1 ? 'bg-primary/50' : 'bg-secondary'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className="w-3 h-3 rounded-sm bg-primary/50" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      </motion.div>

      {/* Recent Check-ins */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 card-glow"
      >
        <h3 className="font-heading text-2xl mb-4">Recent Check-ins</h3>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No check-ins yet. Start your journey!</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 30).map((log, i) => {
              const date = new Date(log.check_in_time);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${isToday ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'}`}>
                  <div className="flex items-center gap-3">
                    <CalendarCheck className={`h-4 w-4 ${isToday ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">
                        {isToday ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-accent bg-primary/20 text-primary">
                      {log.check_in_method}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
