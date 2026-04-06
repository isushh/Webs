import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import RegisterStudent from "@/pages/RegisterStudent";
import RegisterCompany from "@/pages/RegisterCompany";
import StudentDashboard from "@/pages/StudentDashboard";
import CompanyDashboard from "@/pages/CompanyDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import BrowseInternships from "@/pages/BrowseInternships";
import InternshipDetail from "@/pages/InternshipDetail";
import AuthCallback from "@/pages/AuthCallback";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatBot from "@/components/ChatBot";
import { Toaster } from "@/components/ui/sonner";

function AppRouter() {
  const location = useLocation();

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/company" element={<RegisterCompany />} />
        <Route path="/internships" element={<BrowseInternships />} />
        <Route path="/internships/:id" element={<InternshipDetail />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardRouter /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
        } />
      </Routes>
      <ChatBot />
      <Toaster position="top-right" />
    </>
  );
}

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "company") return <CompanyDashboard />;
  return <StudentDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
