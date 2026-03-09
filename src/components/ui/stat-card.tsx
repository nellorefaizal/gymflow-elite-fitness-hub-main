import { useEffect, useState } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
  trend?: string;
}

export function StatCard({ title, value, prefix = '', icon: Icon, iconColor = 'text-primary', delay = 0, trend }: StatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const isPositiveTrend = trend && trend.startsWith('+');
  const isNegativeTrend = trend && trend.startsWith('-');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="rounded-xl border border-border bg-card p-6 card-glow hover:border-primary/30 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-accent text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        <div className={`rounded-lg bg-secondary p-2.5 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-heading">
          {prefix}{count.toLocaleString()}
        </p>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositiveTrend ? 'bg-green-500/10 text-green-400' : 
            isNegativeTrend ? 'bg-red-500/10 text-red-400' : 
            'bg-muted text-muted-foreground'
          }`}>
            {isPositiveTrend && <TrendingUp className="h-3 w-3" />}
            {isNegativeTrend && <TrendingDown className="h-3 w-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
