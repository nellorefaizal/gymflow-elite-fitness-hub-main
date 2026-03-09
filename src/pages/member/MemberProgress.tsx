import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { TrendingDown, Loader2, Ruler, Activity, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function MemberProgress() {
  const { memberData } = useAuth();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberData?.id) return;
    loadData();
  }, [memberData?.id]);

  const loadData = async () => {
    const { data } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('member_id', memberData!.id)
      .order('measured_at', { ascending: true });
    setMeasurements(data || []);
    setLoading(false);
  };

  const chartData = measurements.map(m => ({
    date: new Date(m.measured_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: m.weight_kg ? Number(m.weight_kg) : null,
    chest: m.chest_cm ? Number(m.chest_cm) : null,
    waist: m.waist_cm ? Number(m.waist_cm) : null,
    hips: m.hips_cm ? Number(m.hips_cm) : null,
  }));

  const latestWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight_kg : null;
  const firstWeight = measurements.length > 0 ? measurements[0].weight_kg : null;
  const weightChange = latestWeight && firstWeight ? Number(latestWeight) - Number(firstWeight) : null;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">My Progress</h1>

      {measurements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-20 text-center"
        >
          <Ruler className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-heading mb-2">No Measurements Yet</h3>
          <p className="text-muted-foreground">Your trainer will record your body measurements</p>
        </motion.div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Current Weight', value: latestWeight ? `${latestWeight} kg` : '-', icon: Scale, color: 'text-primary' },
              { label: 'Weight Change', value: weightChange ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg` : '-', icon: TrendingDown, color: weightChange && weightChange < 0 ? 'text-success' : 'text-warning' },
              { label: 'Measurements', value: measurements.length, icon: Ruler, color: 'text-blue-400' },
              { label: 'Latest Update', value: new Date(measurements[measurements.length - 1].measured_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), icon: Activity, color: 'text-purple-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-4 card-glow text-center"
              >
                <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl font-heading">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-accent">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Weight Chart */}
          {chartData.some(d => d.weight) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 card-glow"
            >
              <h3 className="font-heading text-2xl mb-4">Weight Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(43 52% 54%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(43 52% 54%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 53%)" fontSize={10} />
                  <YAxis stroke="hsl(0 0% 53%)" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(43 52% 54%)', borderRadius: '12px', color: 'hsl(0 0% 96%)' }} />
                  <Area type="monotone" dataKey="weight" stroke="hsl(43 52% 54%)" strokeWidth={2} fill="url(#colorWeight)" dot={{ fill: 'hsl(43 52% 54%)', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Body Measurements Chart */}
          {chartData.some(d => d.chest || d.waist || d.hips) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 card-glow"
            >
              <h3 className="font-heading text-2xl mb-4">Body Measurements</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 53%)" fontSize={10} />
                  <YAxis stroke="hsl(0 0% 53%)" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 16%)', borderRadius: '12px', color: 'hsl(0 0% 96%)' }} />
                  <Line type="monotone" dataKey="chest" stroke="hsl(200 70% 50%)" strokeWidth={2} dot={{ r: 3 }} name="Chest" />
                  <Line type="monotone" dataKey="waist" stroke="hsl(43 52% 54%)" strokeWidth={2} dot={{ r: 3 }} name="Waist" />
                  <Line type="monotone" dataKey="hips" stroke="hsl(280 50% 60%)" strokeWidth={2} dot={{ r: 3 }} name="Hips" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Measurement History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6 card-glow"
          >
            <h3 className="font-heading text-2xl mb-4">Measurement History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border font-accent text-xs text-muted-foreground">
                    <th className="text-left py-3 px-3">Date</th>
                    <th className="text-left py-3 px-3">Weight</th>
                    <th className="text-left py-3 px-3">Chest</th>
                    <th className="text-left py-3 px-3">Waist</th>
                    <th className="text-left py-3 px-3">Hips</th>
                  </tr>
                </thead>
                <tbody>
                  {[...measurements].reverse().map(m => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="py-3 px-3 font-medium">{new Date(m.measured_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-muted-foreground">{m.weight_kg ? `${m.weight_kg} kg` : '-'}</td>
                      <td className="py-3 px-3 text-muted-foreground">{m.chest_cm ? `${m.chest_cm} cm` : '-'}</td>
                      <td className="py-3 px-3 text-muted-foreground">{m.waist_cm ? `${m.waist_cm} cm` : '-'}</td>
                      <td className="py-3 px-3 text-muted-foreground">{m.hips_cm ? `${m.hips_cm} cm` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
