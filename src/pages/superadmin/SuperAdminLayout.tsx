import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, Building2, CreditCard, MessageSquare, ToggleLeft, Megaphone, LifeBuoy, Settings, LogOut, Menu, X, Dumbbell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/superadmin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/superadmin/gyms', icon: Building2, label: 'Gyms' },
  { to: '/superadmin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/superadmin/whatsapp', icon: MessageSquare, label: 'WhatsApp Usage' },
  { to: '/superadmin/features', icon: ToggleLeft, label: 'Feature Flags' },
  { to: '/superadmin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/superadmin/support', icon: LifeBuoy, label: 'Support Tickets' },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => path === '/superadmin' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-background/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            <span className="font-heading text-2xl gold-text">Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive(item.to) ? 'bg-destructive/10 text-destructive border-l-2 border-destructive' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-3">{user?.email}</p>
          <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center border-b border-border bg-background/95 backdrop-blur px-4 py-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3"><Menu className="h-5 w-5 text-muted-foreground" /></button>
          <h2 className="font-heading text-xl">Super Admin Panel</h2>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
