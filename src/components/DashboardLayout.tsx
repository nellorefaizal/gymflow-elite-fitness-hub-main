import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck, Dumbbell, ClipboardList,
  MessageSquare, BarChart3, LifeBuoy, Settings, LogOut, Menu, X, Bell, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/members', icon: Users, label: 'Members' },
  { to: '/dashboard/plans', icon: Award, label: 'Plans' },
  { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
  { to: '/dashboard/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/dashboard/trainers', icon: Dumbbell, label: 'Trainers' },
  { to: '/dashboard/workouts', icon: ClipboardList, label: 'Workouts' },
  { to: '/dashboard/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { to: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
  { to: '/dashboard/support', icon: LifeBuoy, label: 'Support' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { gym, user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-background/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-heading text-2xl gold-text">GymFlow</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-body transition-colors ${
                isActive(item.to)
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center font-heading text-primary-foreground text-sm">
              {gym?.name?.[0] || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{gym?.name || 'My Gym'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 py-3 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-heading text-xl hidden sm:block">{gym?.name || 'Dashboard'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <span className="text-xs text-muted-foreground hidden sm:block font-accent">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
