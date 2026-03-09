import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { StatCard } from '@/components/ui/stat-card';
import { Users, UserCheck, AlertTriangle, DollarSign, CalendarCheck, Clock, TrendingUp, TrendingDown, Activity, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Card } from '@/components/ui/card';

export default function DashboardHome() {
  const { gym } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, expiring: 0, revenue: 0, todayAttendance: 0, pendingPayments: 0 });
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [planData, setPlanData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [topMembers, setTopMembers] = useState<any[]>([]);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [memberGrowth, setMemberGrowth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gym?.id) return;
    loadData();
  }, [gym?.id]);

  const loadData = async () => {
    const gymId = gym.id;
    
    const [membersRes, paymentsRes, attendanceRes, plansRes] = await Promise.all([
      supabase.from('members').select('*').eq('gym_id', gymId),
      supabase.from('payments').select('*').eq('gym_id', gymId),
      supabase.from('attendance_logs').select('*').eq('gym_id', gymId),
      supabase.from('membership_plans').select('*').eq('gym_id', gymId),
    ]);

    const members = membersRes.data || [];
    const payments = paymentsRes.data || [];
    const allAttendance = attendanceRes.data || [];
    const plans = plansRes.data || [];
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Calculate stats
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
    const todayAttendance = allAttendance.filter(a => new Date(a.check_in_time).toDateString() === today.toDateString()).length;

    setStats({
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      expiring: members.filter(m => m.expiry_date && new Date(m.expiry_date) <= weekFromNow && new Date(m.expiry_date) >= today).length,
      revenue: totalRevenue,
      todayAttendance,
      pendingPayments: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0),
    });

    // Calculate revenue trend for last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth: { [key: string]: number } = {};
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[monthKey] = 0;
    }

    payments.forEach(payment => {
      if (payment.status === 'paid' && payment.payment_date) {
        const date = new Date(payment.payment_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (revenueByMonth.hasOwnProperty(monthKey)) {
          revenueByMonth[monthKey] += Number(payment.amount);
        }
      }
    });

    const revenueChartData = Object.entries(revenueByMonth).map(([key, amount]) => {
      const [year, month] = key.split('-');
      return {
        month: monthNames[parseInt(month) - 1],
        amount: Math.round(amount)
      };
    });

    setRevenueData(revenueChartData);

    // Calculate revenue growth
    if (revenueChartData.length >= 2) {
      const lastMonth = revenueChartData[revenueChartData.length - 1].amount;
      const prevMonth = revenueChartData[revenueChartData.length - 2].amount;
      const growth = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
      setRevenueGrowth(Math.round(growth));
    }

    // Calculate member growth (last 30 days)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newMembers = members.filter(m => new Date(m.created_at) >= thirtyDaysAgo).length;
    const oldMembers = members.length - newMembers;
    const growth = oldMembers > 0 ? (newMembers / oldMembers) * 100 : 0;
    setMemberGrowth(Math.round(growth));

    // Calculate plan distribution
    const planCounts: { [key: string]: number } = {};
    
    members.forEach(member => {
      if (member.plan_id) {
        const plan = plans.find(p => p.id === member.plan_id);
        if (plan) {
          planCounts[plan.name] = (planCounts[plan.name] || 0) + 1;
        }
      }
    });

    const planChartData = Object.entries(planCounts).map(([name, value]) => ({
      name,
      value
    }));

    setPlanData(planChartData.length > 0 ? planChartData : [{ name: 'No Data', value: 1 }]);

    // Calculate attendance for last 7 days
    const attendanceByDay: { [key: string]: number } = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      attendanceByDay[dayKey] = 0;
    }

    allAttendance.forEach(att => {
      const dayKey = new Date(att.check_in_time).toISOString().split('T')[0];
      if (attendanceByDay.hasOwnProperty(dayKey)) {
        attendanceByDay[dayKey]++;
      }
    });

    const attendanceChartData = Object.entries(attendanceByDay).map(([key, count]) => {
      const date = new Date(key);
      return {
        day: dayNames[date.getDay()],
        count
      };
    });

    setAttendanceData(attendanceChartData);

    // Get top 5 most active members (by attendance)
    const memberAttendance: { [key: string]: number } = {};
    allAttendance.forEach(att => {
      memberAttendance[att.member_id] = (memberAttendance[att.member_id] || 0) + 1;
    });

    const topMembersList = Object.entries(memberAttendance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([memberId, count]) => {
        const member = members.find(m => m.id === memberId);
        return { ...member, attendanceCount: count };
      })
      .filter(m => m.name);

    setTopMembers(topMembersList);

    setRecentMembers(members.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
    setLoading(false);
  };

  const COLORS = ['hsl(43 52% 54%)', 'hsl(0 0% 70%)', 'hsl(43 30% 40%)', 'hsl(120 40% 50%)', 'hsl(200 50% 50%)', 'hsl(280 50% 50%)'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-2 gold-text">Welcome Back! 👋</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Here's what's happening with your gym today</p>
        </div>
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Members" 
          value={stats.total} 
          icon={Users} 
          iconColor="text-blue-400" 
          trend={memberGrowth > 0 ? `+${memberGrowth}%` : undefined}
          delay={0} 
        />
        <StatCard 
          title="Active Members" 
          value={stats.active} 
          icon={UserCheck} 
          iconColor="text-green-400" 
          delay={100} 
        />
        <StatCard 
          title="Expiring This Week" 
          value={stats.expiring} 
          icon={AlertTriangle} 
          iconColor="text-orange-400" 
          delay={200} 
        />
        <StatCard 
          title="Total Revenue" 
          value={stats.revenue} 
          prefix="₹" 
          icon={DollarSign} 
          iconColor="text-primary" 
          trend={revenueGrowth !== 0 ? `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%` : undefined}
          delay={300} 
        />
        <StatCard 
          title="Today's Attendance" 
          value={stats.todayAttendance} 
          icon={CalendarCheck} 
          iconColor="text-purple-400" 
          delay={400} 
        />
        <StatCard 
          title="Pending Payments" 
          value={stats.pendingPayments} 
          prefix="₹" 
          icon={Clock} 
          iconColor="text-destructive" 
          delay={500} 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h3 className="font-heading text-xl sm:text-2xl mb-1">Revenue Trend</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Last 6 months performance</p>
            </div>
            {revenueGrowth !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full self-start ${revenueGrowth > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {revenueGrowth > 0 ? <TrendingUp className="h-3 sm:h-4 w-3 sm:w-4" /> : <TrendingDown className="h-3 sm:h-4 w-3 sm:w-4" />}
                <span className="text-xs sm:text-sm font-medium">{Math.abs(revenueGrowth)}%</span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43 52% 54%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(43 52% 54%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="month" stroke="hsl(0 0% 53%)" fontSize={10} />
              <YAxis stroke="hsl(0 0% 53%)" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(0 0% 7%)', 
                  border: '1px solid hsl(43 52% 54%)', 
                  borderRadius: '12px', 
                  color: 'hsl(0 0% 96%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(43 52% 54%)" 
                strokeWidth={2} 
                fill="url(#colorRevenue)"
                dot={{ fill: 'hsl(43 52% 54%)', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-1">Plan Distribution</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">Member breakdown</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={planData} 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                dataKey="value" 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'hsl(0 0% 53%)', strokeWidth: 1 }}
                style={{ fontSize: '11px' }}
              >
                {planData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(0 0% 7%)', 
                  border: '1px solid hsl(0 0% 16%)', 
                  borderRadius: '12px', 
                  color: 'hsl(0 0% 96%)',
                  fontSize: '12px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-1">Weekly Attendance</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">Last 7 days check-ins</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="day" stroke="hsl(0 0% 53%)" fontSize={10} />
              <YAxis stroke="hsl(0 0% 53%)" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(0 0% 7%)', 
                  border: '1px solid hsl(0 0% 16%)', 
                  borderRadius: '12px', 
                  color: 'hsl(0 0% 96%)',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="count" fill="hsl(43 52% 54%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
            <div>
              <h3 className="font-heading text-xl sm:text-2xl">Top Members</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Most active this month</p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {topMembers.length > 0 ? topMembers.map((member, idx) => (
              <div key={member.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 text-primary font-heading text-xs sm:text-sm flex-shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm sm:text-base">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.phone}</p>
                </div>
                <div className="flex items-center gap-1 text-primary flex-shrink-0">
                  <Activity className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="font-medium text-sm sm:text-base">{member.attendanceCount}</span>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No attendance data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Members */}
      {recentMembers.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-4">Recent Members</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-accent text-xs">
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2 hidden sm:table-cell">Phone</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2 hidden md:table-cell">Join Date</th>
                    <th className="text-left py-3 px-2">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMembers.map(m => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-2 font-medium">{m.name}</td>
                      <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{m.phone}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-accent whitespace-nowrap ${
                          m.status === 'active' ? 'bg-success/20 text-success' : 
                          m.status === 'expired' ? 'bg-destructive/20 text-destructive' : 
                          'bg-warning/20 text-warning'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{new Date(m.join_date).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-muted-foreground">{m.expiry_date ? new Date(m.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
