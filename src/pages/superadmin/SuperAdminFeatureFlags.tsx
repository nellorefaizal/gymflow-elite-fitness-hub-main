import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  starter: boolean;
  pro: boolean;
  enterprise: boolean;
}

const defaultFlags: FeatureFlag[] = [
  { key: 'attendance_qr', label: 'QR Check-in', description: 'Allow QR code-based attendance check-in', starter: false, pro: true, enterprise: true },
  { key: 'trainers', label: 'Trainer Module', description: 'Manage trainers and assign to members', starter: false, pro: true, enterprise: true },
  { key: 'workout_plans', label: 'Workout Plans', description: 'Create and assign workout plans', starter: false, pro: true, enterprise: true },
  { key: 'whatsapp', label: 'WhatsApp Automation', description: 'Automated WhatsApp reminders and notifications', starter: false, pro: true, enterprise: true },
  { key: 'body_measurements', label: 'Body Measurements', description: 'Track member body measurements over time', starter: true, pro: true, enterprise: true },
  { key: 'advanced_reports', label: 'Advanced Reports', description: 'Detailed analytics and export capabilities', starter: false, pro: false, enterprise: true },
];

export default function SuperAdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(defaultFlags);

  const toggleFlag = (key: string, plan: 'starter' | 'pro' | 'enterprise') => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, [plan]: !f[plan] } : f));
  };

  const saveFlags = () => {
    // In production, save to a feature_flags table
    toast.success('Feature flags saved');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-heading">Feature Flags</h1>
        <Button onClick={saveFlags} className="gold-gradient text-primary-foreground rounded-full font-accent tracking-wider">
          Save Changes
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">Toggle features on or off per subscription plan. Changes affect all gyms on that plan.</p>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 font-accent text-xs text-muted-foreground">Feature</th>
              <th className="text-center py-4 px-4 font-accent text-xs text-muted-foreground">Starter</th>
              <th className="text-center py-4 px-4 font-accent text-xs text-muted-foreground">Pro</th>
              <th className="text-center py-4 px-4 font-accent text-xs text-muted-foreground">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {flags.map(flag => (
              <tr key={flag.key} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{flag.label}</p>
                      <p className="text-xs text-muted-foreground">{flag.description}</p>
                    </div>
                  </div>
                </td>
                <td className="text-center py-4 px-4">
                  <Switch checked={flag.starter} onCheckedChange={() => toggleFlag(flag.key, 'starter')} />
                </td>
                <td className="text-center py-4 px-4">
                  <Switch checked={flag.pro} onCheckedChange={() => toggleFlag(flag.key, 'pro')} />
                </td>
                <td className="text-center py-4 px-4">
                  <Switch checked={flag.enterprise} onCheckedChange={() => toggleFlag(flag.key, 'enterprise')} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Feature flags are currently stored in-memory. To persist them, a <code>feature_flags</code> table will be needed in the database.
        </p>
      </div>
    </div>
  );
}
