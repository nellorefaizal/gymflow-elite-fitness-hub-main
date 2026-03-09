import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Loader2, Download, TrendingUp, TrendingDown, Users, DollarSign, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import Papa from 'papaparse';

export default function Reports() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    active: 0, 
    expired: 0, 
    paused: 0, 
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalMembers: 0,
    avgAttendance: 0,
    pendingPayments: 0
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [planData, setPlanData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [memberGrowthData, setMemberGrowthData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('6months');

  useEffect(() => { if (gym?.id) load(); }, [gym?.id, dateRange]);

  const load = async () => {
    setLoading(true);
    const [membersRes, paymentsRes, attendanceRes, plansRes] = await Promise.all([
      supabase.from('members').select('*, membership_plans(name)').eq('gym_id', gym.id),
      supabase.from('payments').select('*').eq('gym_id', gym.id),
      supabase.from('attendance_logs').select('*').eq('gym_id', gym.id),
      supabase.from('membership_plans').select('*').eq('gym_id', gym.id),
    ]);

    const members = membersRes.data || [];
    const payments = paymentsRes.data || [];
    const attendance = attendanceRes.data || [];
    const plans = plansRes.data || [];

    // Calculate stats
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = payments
      .filter(p => {
        const date = new Date(p.payment_date);
        return p.status === 'paid' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((s, p) => s + Number(p.amount), 0);

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAttendance = attendance.filter(a => new Date(a.check_in_time) >= last30Days);
    const avgAttendance = Math.round(recentAttendance.length / 30);

    setStats({
      active: members.filter(m => m.status === 'active').length,
      expired: members.filter(m => m.status === 'expired').length,
      paused: members.filter(m => m.status === 'paused').length,
      totalRevenue,
      monthlyRevenue,
      totalMembers: members.length,
      avgAttendance,
      pendingPayments: payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0),
    });

    // Revenue trend (last 6 or 12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsToShow = dateRange === '12months' ? 12 : 6;
    const revenueByMonth: { [key: string]: number } = {};
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
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

    // Member growth trend
    const membersByMonth: { [key: string]: number } = {};
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      membersByMonth[monthKey] = 0;
    }

    members.forEach(member => {
      const date = new Date(member.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (membersByMonth.hasOwnProperty(monthKey)) {
        membersByMonth[monthKey]++;
      }
    });

    let cumulative = 0;
    const memberGrowthChartData = Object.entries(membersByMonth).map(([key, count]) => {
      const [year, month] = key.split('-');
      cumulative += count;
      return {
        month: monthNames[parseInt(month) - 1],
        new: count,
        total: cumulative
      };
    });
    setMemberGrowthData(memberGrowthChartData);

    // Attendance by day (last 30 days)
    const attendanceByDay: { [key: string]: number } = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      attendanceByDay[dayKey] = 0;
    }

    attendance.forEach(att => {
      const dayKey = new Date(att.check_in_time).toISOString().split('T')[0];
      if (attendanceByDay.hasOwnProperty(dayKey)) {
        attendanceByDay[dayKey]++;
      }
    });

    const attendanceChartData = Object.entries(attendanceByDay).map(([key, count]) => {
      const date = new Date(key);
      return {
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        count
      };
    });
    setAttendanceData(attendanceChartData);

    // Plan distribution
    const planCounts: { [key: string]: number } = {};
    members.forEach(member => {
      if (member.plan_id) {
        const plan = plans.find(p => p.id === member.plan_id);
        if (plan) {
          planCounts[plan.name] = (planCounts[plan.name] || 0) + 1;
        }
      } else {
        planCounts['No Plan'] = (planCounts['No Plan'] || 0) + 1;
      }
    });

    const planChartData = Object.entries(planCounts).map(([name, value]) => ({
      name,
      value
    }));
    setPlanData(planChartData.length > 0 ? planChartData : [{ name: 'No Data', value: 1 }]);

    // Payment method distribution
    const methodCounts: { [key: string]: number } = {};
    payments.forEach(payment => {
      if (payment.status === 'paid') {
        methodCounts[payment.method] = (methodCounts[payment.method] || 0) + 1;
      }
    });

    const methodChartData = Object.entries(methodCounts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }));
    setPaymentMethodData(methodChartData.length > 0 ? methodChartData : [{ name: 'No Data', value: 1 }]);

    setLoading(false);
  };

  const exportReport = () => {
    const reportData = {
      'Total Members': stats.totalMembers,
      'Active Members': stats.active,
      'Expired Members': stats.expired,
      'Paused Members': stats.paused,
      'Total Revenue': stats.totalRevenue,
      'Monthly Revenue': stats.monthlyRevenue,
      'Pending Payments': stats.pendingPayments,
      'Average Daily Attendance': stats.avgAttendance,
    };
    
    const csv = Papa.unparse([reportData]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const COLORS = ['hsl(43 52% 54%)', 'hsl(145 63% 42%)', 'hsl(0 72% 51%)', 'hsl(38 92% 50%)', 'hsl(200 50% 50%)', 'hsl(280 50% 50%)'];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-heading">Reports & Analytics</h1>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-full bg-secondary border border-border px-4 py-2 text-sm font-accent"
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
          <Button onClick={exportReport} variant="outline" className="rounded-full font-accent">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Members" value={stats.totalMembers} icon={Users} iconColor="text-blue-400" />
        <StatCard title="Active Members" value={stats.active} icon={Users} iconColor="text-green-400" delay={100} />
        <StatCard title="Total Revenue" value={stats.totalRevenue} prefix="₹" icon={DollarSign} iconColor="text-primary" delay={200} />
        <StatCard title="Monthly Revenue" value={stats.monthlyRevenue} prefix="₹" icon={DollarSign} iconColor="text-primary" delay={300} />
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Avg Daily Attendance" value={stats.avgAttendance} icon={Activity} iconColor="text-purple-400" delay={400} />
        <StatCard title="Expired Members" value={stats.expired} icon={Users} iconColor="text-destructive" delay={500} />
        <StatCard title="Paused Members" value={stats.paused} icon={Users} iconColor="text-warning" delay={600} />
        <StatCard title="Pending Payments" value={stats.pendingPayments} prefix="₹" icon={DollarSign} iconColor="text-warning" delay={700} />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43 52% 54%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(43 52% 54%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="month" stroke="hsl(0 0% 53%)" fontSize={10} />
              <YAxis stroke="hsl(0 0% 53%)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(43 52% 54%)', borderRadius: '12px', color: 'hsl(0 0% 96%)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="amount" stroke="hsl(43 52% 54%)" strokeWidth={2} fill="url(#colorRevenue2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Member Growth */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-4">Member Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={memberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="month" stroke="hsl(0 0% 53%)" fontSize={10} />
              <YAxis stroke="hsl(0 0% 53%)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '12px', color: 'hsl(0 0% 96%)', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="new" stroke="hsl(43 52% 54%)" strokeWidth={2} name="New Members" />
              <Line type="monotone" dataKey="total" stroke="hsl(145 63% 42%)" strokeWidth={2} name="Total Members" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-4">Attendance (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="date" stroke="hsl(0 0% 53%)" fontSize={9} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="hsl(0 0% 53%)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '12px', color: 'hsl(0 0% 96%)', fontSize: '12px' }} />
              <Bar dataKey="count" fill="hsl(43 52% 54%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Member Status Distribution */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-4">Member Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={[
                  { name: 'Active', value: stats.active },
                  { name: 'Expired', value: stats.expired },
                  { name: 'Paused', value: stats.paused }
                ]} 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                dataKey="value" 
                label={({ name, value }) => `${name}: ${value}`}
                style={{ fontSize: '11px' }}
              >
                <Cell fill="hsl(145 63% 42%)" />
                <Cell fill="hsl(0 72% 51%)" />
                <Cell fill="hsl(38 92% 50%)" />
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '12px', color: 'hsl(0 0% 96%)', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Plan Distribution */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={planData} 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                dataKey="value" 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                style={{ fontSize: '11px' }}
              >
                {planData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '12px', color: 'hsl(0 0% 96%)', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-glow">
          <h3 className="font-heading text-xl sm:text-2xl mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={paymentMethodData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis type="number" stroke="hsl(0 0% 53%)" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="hsl(0 0% 53%)" fontSize={10} width={60} />
              <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '12px', color: 'hsl(0 0% 96%)', fontSize: '12px' }} />
              <Bar dataKey="value" fill="hsl(43 52% 54%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
