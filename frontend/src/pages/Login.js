import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";

function formatError(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function Login() {
  const { login, adminRegister, googleCallback } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", secret_code: "" });

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleCallback(credentialResponse.credential, "student");
      toast.success("Welcome!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminRegister(form.email, form.password, form.name, form.secret_code);
      toast.success("Admin account created!");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden" data-testid="login-page">
      <div className="absolute inset-0 bg-[url('https://static.prod-images.emergentagent.com/jobs/1264318a-53b6-4d06-8870-ec03dd90317f/images/6eb95cab97edfe3434d98fb5962f126b1552fc0775b4f6ad9a3499ae49a13545.png')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-[#050505]/80" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
              <span className="text-black font-bold">N</span>
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Nexalign</span>
          </Link>
        </div>

        <div className="glass-heavy rounded-2xl p-8 shadow-2xl" data-testid="login-form-container">
          {/* Tabs */}
          <div className="flex gap-1 p-1 glass rounded-lg mb-8">
            {["login", "admin"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-white/50 hover:text-white/70"}`}
                data-testid={`tab-${t}`}>
                {t === "login" ? "Sign In" : "Admin"}
              </button>
            ))}
          </div>

          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm" placeholder="you@dbs.edu" data-testid="login-email" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type={showPw ? "text" : "password"} required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className="glass-input w-full pl-10 pr-10 py-2.5 rounded-lg text-sm" placeholder="Password" data-testid="login-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="login-submit-btn">
                {loading ? "Signing in..." : <>Sign In <ArrowRight size={16} /></>}
              </button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-[#050505]/50 backdrop-blur text-xs text-white/40">or continue with</span></div>
              </div>
              <div className="flex justify-center" data-testid="google-login-btn">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google sign-in failed")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  width="100%"
                  text="continue_with"
                />
              </div>
              <p className="text-center text-sm text-white/40 mt-4">
                Don't have an account? <Link to="/register/student" className="text-cyan-400 hover:text-cyan-300" data-testid="goto-register">Sign up</Link>
              </p>
            </form>
          )}

          {tab === "admin" && (
            <form onSubmit={handleAdminRegister} className="space-y-5">
              <div className="glass rounded-lg p-3 flex items-center gap-2 mb-2">
                <Shield size={16} className="text-emerald-400" />
                <span className="text-xs text-white/60">Admin registration requires a secret code</span>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Admin Name" data-testid="admin-name" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="admin@nexalign.com" data-testid="admin-email" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Password</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Strong password" data-testid="admin-password" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Secret Code</label>
                <input type="password" required value={form.secret_code} onChange={e => setForm({...form, secret_code: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Admin secret code" data-testid="admin-secret-code" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="admin-register-btn">
                {loading ? "Creating..." : <>Create Admin Account <Shield size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
