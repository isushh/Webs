import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import RegisterStudent from "@/pages/RegisterStudent";
import RegisterCompany from "@/pages/RegisterCompany";
import StudentDashboard from "@/pages/StudentDashboard";
import CompanyDashboard from "@/pages/CompanyDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import BrowseInternships from "@/pages/BrowseInternships";
import InternshipDetail from "@/pages/InternshipDetail";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatBot from "@/components/ChatBot";
import { Toaster } from "@/components/ui/sonner";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function AppRouter() {
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
