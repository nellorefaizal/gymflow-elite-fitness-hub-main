import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Dumbbell, Loader2, ChevronDown, ChevronUp, Clock, Repeat, Timer } from 'lucide-react';

export default function MemberWorkouts() {
  const { memberData } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!memberData?.id) return;
    loadData();
  }, [memberData?.id]);

  const loadData = async () => {
    const { data } = await supabase
      .from('member_workout_assignments')
      .select('*, workout_plans(name, category, exercises, description)')
      .eq('member_id', memberData!.id)
      .order('assigned_at', { ascending: false });
    setAssignments(data || []);
    setLoading(false);
  };

  const categoryColors: Record<string, string> = {
    weight_loss: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    muscle_gain: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    beginner: 'bg-success/20 text-success border-success/30',
    custom: 'bg-primary/20 text-primary border-primary/30',
  };

  const categoryIcons: Record<string, string> = {
    weight_loss: '🔥', muscle_gain: '💪', beginner: '🌟', custom: '⚡',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">My Workout Plans</h1>

      {assignments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-20 text-center"
        >
          <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-heading mb-2">No Plans Assigned Yet</h3>
          <p className="text-muted-foreground">Your trainer will assign workout plans for you</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, i) => {
            const plan = assignment.workout_plans;
            if (!plan) return null;
            const exercises = (plan.exercises as any[]) || [];
            const isExpanded = expandedPlan === assignment.id;
            const category = plan.category || 'custom';

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border bg-card overflow-hidden card-glow transition-colors ${
                  isExpanded ? 'border-primary/30' : 'border-border'
                }`}
              >
                <button
                  onClick={() => setExpandedPlan(isExpanded ? null : assignment.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{categoryIcons[category]}</div>
                    <div>
                      <h3 className="text-xl font-heading">{plan.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-accent border ${categoryColors[category]}`}>
                          {category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">{exercises.length} exercises</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    {plan.description && (
                      <p className="px-5 pt-4 text-sm text-muted-foreground">{plan.description}</p>
                    )}
                    <div className="p-5 space-y-3">
                      {exercises.map((ex: any, j: number) => (
                        <div key={j} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border/50">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-heading text-sm flex-shrink-0">
                            {j + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{ex.name}</p>
                            <div className="flex flex-wrap gap-3 mt-1">
                              {ex.sets && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Repeat className="h-3 w-3" /> {ex.sets} sets
                                </span>
                              )}
                              {ex.reps && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Dumbbell className="h-3 w-3" /> {ex.reps} reps
                                </span>
                              )}
                              {ex.duration && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" /> {ex.duration}
                                </span>
                              )}
                              {ex.rest && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Timer className="h-3 w-3" /> {ex.rest} rest
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
