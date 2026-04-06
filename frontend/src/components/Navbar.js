import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, Search, Shield } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashLink = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group" data-testid="navbar-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
              <span className="text-black font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Nexalign
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/internships" className="glass-btn px-4 py-2 rounded-lg text-sm text-white/80 hover:text-white flex items-center gap-2" data-testid="nav-internships">
              <Search size={14} /> Internships
            </Link>
            {user ? (
              <>
                <Link to={dashLink} className="glass-btn px-4 py-2 rounded-lg text-sm text-white/80 hover:text-white flex items-center gap-2" data-testid="nav-dashboard">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="glass-btn px-4 py-2 rounded-lg text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-2" data-testid="nav-admin">
                    <Shield size={14} /> Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="glass-btn px-4 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 flex items-center gap-2" data-testid="nav-logout">
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="glass-btn px-4 py-2 rounded-lg text-sm text-white/80 hover:text-white" data-testid="nav-login">
                  Sign In
                </Link>
                <Link to="/register/student" className="px-4 py-2 rounded-lg text-sm bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]" data-testid="nav-register">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-up">
            <Link to="/internships" onClick={() => setOpen(false)} className="block glass-btn px-4 py-3 rounded-lg text-sm text-white/80" data-testid="nav-mobile-internships">Internships</Link>
            {user ? (
              <>
                <Link to={dashLink} onClick={() => setOpen(false)} className="block glass-btn px-4 py-3 rounded-lg text-sm text-white/80" data-testid="nav-mobile-dashboard">Dashboard</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left glass-btn px-4 py-3 rounded-lg text-sm text-red-400" data-testid="nav-mobile-logout">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block glass-btn px-4 py-3 rounded-lg text-sm text-white/80" data-testid="nav-mobile-login">Sign In</Link>
                <Link to="/register/student" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-sm bg-cyan-500 text-black font-semibold text-center" data-testid="nav-mobile-register">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
