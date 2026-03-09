import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Flame, CalendarCheck, Trophy, Dumbbell, Clock, TrendingUp, Zap, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function MemberDashboard() {
  const { memberData } = useAuth();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [thisMonthCheckIns, setThisMonthCheckIns] = useState(0);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const calculateStreak = useCallback((logs: any[]) => {
    if (!logs.length) return { current: 0, longest: 0 };

    const dates = [...new Set(logs.map(l => new Date(l.check_in_time).toISOString().split('T')[0]))].sort().reverse();
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let current = 0;
    let startIdx = dates[0] === today ? 0 : dates[0] === yesterday ? 0 : -1;
    
    if (startIdx === -1) return { current: 0, longest: calculateLongest(dates) };
    
    for (let i = startIdx; i < dates.length; i++) {
      const expected = new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0];
      if (dates[i] === expected) {
        current++;
      } else break;
    }

    return { current, longest: Math.max(current, calculateLongest(dates)) };
  }, []);

  const calculateLongest = (dates: string[]) => {
    let longest = 1, curr = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const cur = new Date(dates[i]);
      const diff = (prev.getTime() - cur.getTime()) / 86400000;
      if (diff === 1) { curr++; longest = Math.max(longest, curr); }
      else curr = 1;
    }
    return longest;
  };

  useEffect(() => {
    if (!memberData?.id) return;
    loadData();
  }, [memberData?.id]);

  const loadData = async () => {
    const memberId = memberData!.id;
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [attendanceRes, assignmentsRes] = await Promise.all([
      supabase.from('attendance_logs').select('check_in_time').eq('member_id', memberId).order('check_in_time', { ascending: false }),
      supabase.from('member_workout_assignments').select('*, workout_plans(name, category, exercises, description)').eq('member_id', memberId).order('assigned_at', { ascending: false }).limit(5),
    ]);

    const logs = attendanceRes.data || [];
    const { current, longest } = calculateStreak(logs);
    setStreak(current);
    setLongestStreak(longest);
    setTotalCheckIns(logs.length);
    setThisMonthCheckIns(logs.filter(l => l.check_in_time >= monthStart).length);
    setTodayCheckedIn(logs.some(l => l.check_in_time.startsWith(today)));
    setWorkoutPlans(assignmentsRes.data || []);

    if (memberData?.expiry_date) {
      const diff = Math.ceil((new Date(memberData.expiry_date).getTime() - Date.now()) / 86400000);
      setDaysLeft(diff);
    }

    setLoading(false);
  };

  const handleSelfCheckIn = async () => {
    if (!memberData?.id || !memberData?.gym_id) return;
    if (todayCheckedIn) { toast.error('Already checked in today!'); return; }
    
    setCheckingIn(true);
    const { error } = await supabase.from('attendance_logs').insert({
      member_id: memberData.id,
      gym_id: memberData.gym_id,
      check_in_method: 'manual',
    });
    setCheckingIn(false);
    
    if (error) { toast.error('Check-in failed: ' + error.message); return; }
    toast.success('Checked in successfully! 💪');
    setTodayCheckedIn(true);
    setStreak(s => s + (s > 0 ? 1 : 1));
    setTotalCheckIns(t => t + 1);
    setThisMonthCheckIns(t => t + 1);
  };

  const streakEmoji = streak >= 30 ? '🔥🏆' : streak >= 14 ? '🔥💪' : streak >= 7 ? '🔥' : streak >= 3 ? '✨' : '💪';
  const streakColor = streak >= 14 ? 'from-orange-500 to-red-500' : streak >= 7 ? 'from-primary to-orange-500' : 'from-primary to-yellow-500';

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8"
      >
        <div className="relative z-10">
          <p className="text-muted-foreground font-accent text-sm">Welcome back</p>
          <h1 className="text-3xl sm:text-5xl font-heading gold-text mt-1">{memberData?.name} {streakEmoji}</h1>
          <p className="text-muted-foreground mt-2">{memberData?.gymName}</p>
          
          {daysLeft !== null && (
            <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-xs font-accent ${
              daysLeft <= 7 ? 'bg-destructive/20 text-destructive' : daysLeft <= 30 ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
            }`}>
              <Clock className="h-3 w-3" />
              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Membership expired'}
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Streak Card - Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`relative overflow-hidden rounded-2xl border border-primary/30 p-6 sm:p-8 bg-gradient-to-r ${streakColor}`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Flame className="h-10 w-10 text-white drop-shadow-lg" />
              <div>
                <p className="text-white/80 font-accent text-sm">Current Streak</p>
                <p className="text-5xl sm:text-6xl font-heading text-white">{streak} <span className="text-2xl">DAYS</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <Trophy className="h-4 w-4" />
                <span>Best: {longestStreak} days</span>
              </div>
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <Target className="h-4 w-4" />
                <span>This month: {thisMonthCheckIns}</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleSelfCheckIn}
            disabled={todayCheckedIn || checkingIn}
            className={`rounded-full px-8 py-6 text-lg font-accent tracking-wider shadow-xl ${
              todayCheckedIn 
                ? 'bg-white/20 text-white border border-white/30 cursor-default' 
                : 'bg-white text-primary-foreground hover:bg-white/90'
            }`}
          >
            {todayCheckedIn ? (
              <><CalendarCheck className="h-5 w-5 mr-2" /> Checked In ✓</>
            ) : checkingIn ? (
              'Checking in...'
            ) : (
              <><Zap className="h-5 w-5 mr-2" /> Check In Now</>
            )}
          </Button>
        </div>
        
        {/* Streak milestones */}
        <div className="mt-6 flex gap-2 justify-center sm:justify-start">
          {[3, 7, 14, 30, 60, 100].map(milestone => (
            <div
              key={milestone}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-heading ${
                streak >= milestone 
                  ? 'bg-white text-primary-foreground shadow-lg' 
                  : 'bg-white/10 text-white/40 border border-white/20'
              }`}
            >
              {milestone}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Visits', value: totalCheckIns, icon: CalendarCheck, color: 'text-blue-400' },
          { label: 'This Month', value: thisMonthCheckIns, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Best Streak', value: `${longestStreak}d`, icon: Trophy, color: 'text-primary' },
          { label: 'Workouts', value: workoutPlans.length, icon: Dumbbell, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4 card-glow text-center"
          >
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-heading">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-accent">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Workout Plans */}
      {workoutPlans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 card-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-2xl flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Your Workout Plans
            </h3>
            <Button onClick={() => navigate('/member/workouts')} variant="ghost" className="text-primary font-accent text-sm">
              View All →
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {workoutPlans.slice(0, 4).map((assignment: any) => (
              <div key={assignment.id} className="rounded-lg border border-border bg-secondary/50 p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => navigate('/member/workouts')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{assignment.workout_plans?.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(assignment.workout_plans?.exercises as any[])?.length || 0} exercises
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-accent bg-primary/20 text-primary">
                    {assignment.workout_plans?.category?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent p-6 text-center"
      >
        <Star className="h-6 w-6 text-primary mx-auto mb-2" />
        <p className="text-muted-foreground italic">
          {streak >= 7 
            ? `"${streak} days strong! You're unstoppable. Keep pushing!"` 
            : streak >= 3 
              ? `"Great momentum! ${7 - streak} more days to your next milestone!"` 
              : '"The only bad workout is the one that didn\'t happen. Let\'s go!"'}
        </p>
      </motion.div>
    </div>
  );
}
