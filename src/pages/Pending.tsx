import { Dumbbell, AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export default function Pending() {
  const { gym, signOut } = useAuth();
  const isSuspended = gym?.status === 'suspended';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-primary/20 bg-card p-8 card-glow text-center">
        <Dumbbell className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-heading gold-text mb-4">GymFlow</h1>
        <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
        <h2 className="text-3xl font-heading mb-4">
          {isSuspended ? 'Gym Suspended' : 'Access Restricted'}
        </h2>
        <p className="text-muted-foreground mb-8">
          {isSuspended
            ? 'Your gym has been suspended. Please contact support for assistance.'
            : 'This account cannot access the dashboard right now. Please contact support.'}
        </p>
        <Button onClick={signOut} variant="outline" className="rounded-full font-accent tracking-wider">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
