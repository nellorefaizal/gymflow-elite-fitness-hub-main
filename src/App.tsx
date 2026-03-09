import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";
import CheckIn from "./pages/CheckIn";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Members from "./pages/dashboard/Members";
import Plans from "./pages/dashboard/Plans";
import Payments from "./pages/dashboard/Payments";
import Attendance from "./pages/dashboard/Attendance";
import Trainers from "./pages/dashboard/Trainers";
import Workouts from "./pages/dashboard/Workouts";
import WhatsApp from "./pages/dashboard/WhatsApp";
import Reports from "./pages/dashboard/Reports";
import Support from "./pages/dashboard/Support";
import GymSettings from "./pages/dashboard/GymSettings";
import SuperAdminLayout from "./pages/superadmin/SuperAdminLayout";
import SuperAdminHome from "./pages/superadmin/SuperAdminHome";
import SuperAdminSupport from "./pages/superadmin/SuperAdminSupport";
import SuperAdminSubscriptions from "./pages/superadmin/SuperAdminSubscriptions";
import SuperAdminWhatsApp from "./pages/superadmin/SuperAdminWhatsApp";
import SuperAdminFeatureFlags from "./pages/superadmin/SuperAdminFeatureFlags";
import SuperAdminAnnouncements from "./pages/superadmin/SuperAdminAnnouncements";
import MemberLayout from "./pages/member/MemberLayout";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberAttendance from "./pages/member/MemberAttendance";
import MemberWorkouts from "./pages/member/MemberWorkouts";
import MemberProgress from "./pages/member/MemberProgress";
import MemberProfile from "./pages/member/MemberProfile";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'gym_owner' | 'super_admin' | 'member' }) {
  const { user, loading, userRole, gym, memberData } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (role === 'super_admin' && userRole !== 'super_admin') return <Navigate to="/dashboard" replace />;
  if (role === 'member') {
    if (userRole !== 'member') return <Navigate to="/dashboard" replace />;
    if (!memberData) return <Navigate to="/login" replace />;
  }
  if (role === 'gym_owner') {
    if (userRole === 'super_admin') return <Navigate to="/superadmin" replace />;
    if (userRole === 'member') return <Navigate to="/member" replace />;
    if (!gym) return <Navigate to="/register" replace />;
    if (gym?.status === 'suspended') return <Navigate to="/pending" replace />;
  }
  
  return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading, userRole, gym, memberData } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (user) {
    if (userRole === 'super_admin') return <Navigate to="/superadmin" replace />;
    if (userRole === 'member' && memberData) return <Navigate to="/member" replace />;
    if (gym) return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRedirect><Landing /></AuthRedirect>} />
      <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
      <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
      <Route path="/pending" element={<ProtectedRoute role="gym_owner"><Pending /></ProtectedRoute>} />
      <Route path="/checkin/:memberId" element={<CheckIn />} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="gym_owner"><DashboardLayout><DashboardHome /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/members" element={<ProtectedRoute role="gym_owner"><DashboardLayout><Members /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/plans" element={<ProtectedRoute role="gym_owner"><DashboardLayout><Plans /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/payments" element={<ProtectedRoute role="gym_owner"><DashboardLayout><Payments /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/attendance" element={<ProtectedRoute role="gym_owner"><DashboardLayout><Attendance /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/trainers" element={<ProtectedRoute role="gym_owner"><DashboardLayout><Trainers /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/workouts" element={<ProtectedRoute role="gym_owner"><DashboardLayout><Workouts /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/whatsapp" element={<ProtectedRoute role="gym_owner"><DashboardLayout><WhatsApp /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/reports" element={<ProtectedRoute role="gym_owner"><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/support" element={<ProtectedRoute role="gym_owner"><DashboardLayout><Support /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute role="gym_owner"><DashboardLayout><GymSettings /></DashboardLayout></ProtectedRoute>} />

      {/* Member routes */}
      <Route path="/member" element={<ProtectedRoute role="member"><MemberLayout><MemberDashboard /></MemberLayout></ProtectedRoute>} />
      <Route path="/member/attendance" element={<ProtectedRoute role="member"><MemberLayout><MemberAttendance /></MemberLayout></ProtectedRoute>} />
      <Route path="/member/workouts" element={<ProtectedRoute role="member"><MemberLayout><MemberWorkouts /></MemberLayout></ProtectedRoute>} />
      <Route path="/member/progress" element={<ProtectedRoute role="member"><MemberLayout><MemberProgress /></MemberLayout></ProtectedRoute>} />
      <Route path="/member/profile" element={<ProtectedRoute role="member"><MemberLayout><MemberProfile /></MemberLayout></ProtectedRoute>} />

      {/* Super Admin routes */}
      <Route path="/superadmin" element={<ProtectedRoute role="super_admin"><SuperAdminLayout><SuperAdminHome /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/superadmin/gyms" element={<ProtectedRoute role="super_admin"><SuperAdminLayout><SuperAdminHome /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/superadmin/support" element={<ProtectedRoute role="super_admin"><SuperAdminLayout><SuperAdminSupport /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/superadmin/subscriptions" element={<ProtectedRoute role="super_admin"><SuperAdminLayout><SuperAdminSubscriptions /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/superadmin/whatsapp" element={<ProtectedRoute role="super_admin"><SuperAdminLayout><SuperAdminWhatsApp /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/superadmin/features" element={<ProtectedRoute role="super_admin"><SuperAdminLayout><SuperAdminFeatureFlags /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/superadmin/announcements" element={<ProtectedRoute role="super_admin"><SuperAdminLayout><SuperAdminAnnouncements /></SuperAdminLayout></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
