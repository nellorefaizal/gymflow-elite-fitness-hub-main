import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, CreditCard, Dumbbell, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MemberProfile() {
  const { memberData, user, signOut } = useAuth();

  const daysLeft = memberData?.expiry_date
    ? Math.ceil((new Date(memberData.expiry_date).getTime() - Date.now()) / 86400000)
    : null;

  const infoItems = [
    { icon: User, label: 'Name', value: memberData?.name },
    { icon: Phone, label: 'Phone', value: memberData?.phone },
    { icon: Mail, label: 'Email', value: memberData?.email || user?.email || 'Not set' },
    { icon: CreditCard, label: 'Plan', value: memberData?.planName || 'No plan' },
    { icon: Calendar, label: 'Join Date', value: memberData?.join_date ? new Date(memberData.join_date).toLocaleDateString() : '-' },
    { icon: Clock, label: 'Expiry Date', value: memberData?.expiry_date ? new Date(memberData.expiry_date).toLocaleDateString() : '-' },
    { icon: Shield, label: 'Status', value: memberData?.status || 'active' },
    { icon: Dumbbell, label: 'Trainer', value: memberData?.trainerName || 'Not assigned' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading">My Profile</h1>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-8 card-glow"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full gold-gradient flex items-center justify-center font-heading text-4xl text-primary-foreground shadow-xl">
            {memberData?.name?.[0] || 'M'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-heading gold-text">{memberData?.name}</h2>
            <p className="text-muted-foreground">{memberData?.gymName}</p>
            {daysLeft !== null && (
              <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-accent ${
                daysLeft <= 0 ? 'bg-destructive/20 text-destructive' : 
                daysLeft <= 7 ? 'bg-warning/20 text-warning' : 
                'bg-success/20 text-success'
              }`}>
                <Clock className="h-3 w-3" />
                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Membership expired'}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 card-glow"
      >
        <h3 className="font-heading text-2xl mb-4">Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {infoItems.map((item, i) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-accent">{item.label}</p>
                <p className="font-medium text-sm capitalize">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Notes */}
      {memberData?.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 card-glow"
        >
          <h3 className="font-heading text-2xl mb-2">Notes from Trainer</h3>
          <p className="text-muted-foreground">{memberData.notes}</p>
        </motion.div>
      )}

      <Button onClick={signOut} variant="outline" className="rounded-full font-accent text-destructive border-destructive/30 hover:bg-destructive/10">
        Logout
      </Button>
    </div>
  );
}
