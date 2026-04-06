import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Linkedin, Globe, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RegisterCompany() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    company_name: "", company_website: "", office_address: "",
    company_linkedin: "", company_description: "",
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_linkedin) { toast.error("Company LinkedIn is required"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const data = await register(form.email, form.password, form.name, "company");
      const authToken = data.access_token || token;
      await axios.put(`${API}/profile`, {
        company_name: form.company_name, company_website: form.company_website,
        office_address: form.office_address, company_linkedin: form.company_linkedin,
        company_description: form.company_description,
      }, { withCredentials: true, headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
      toast.success("Company registered! Awaiting verification.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden" data-testid="register-company-page">
      <div className="absolute inset-0 bg-[url('https://static.prod-images.emergentagent.com/jobs/1264318a-53b6-4d06-8870-ec03dd90317f/images/6eb95cab97edfe3434d98fb5962f126b1552fc0775b4f6ad9a3499ae49a13545.png')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-[#050505]/70" />

      <div className="relative z-10 w-full max-w-lg animate-slide-up">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
              <span className="text-black font-bold">N</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Company Registration</h1>
          <p className="text-white/40 text-sm mt-1">Step {step} of 2</p>
          <div className="flex gap-1 mt-3 max-w-xs mx-auto">
            {[1, 2].map(s => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? "bg-emerald-500" : "bg-white/10"}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-heavy rounded-2xl p-8 shadow-2xl" data-testid="company-register-form">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Contact Person Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="John Smith" data-testid="company-contact-name" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Company Email *</label>
                <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="hr@company.com" data-testid="company-email" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Password *</label>
                <input type="password" required value={form.password} onChange={e => set("password", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Min 6 characters" data-testid="company-password" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Confirm Password *</label>
                <input type="password" required value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Confirm password" data-testid="company-confirm-password" />
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full py-3 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2" data-testid="company-next-step1">
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1"><Building2 size={12} /> Company Name *</label>
                <input required value={form.company_name} onChange={e => set("company_name", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Acme Inc." data-testid="company-name" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1"><Globe size={12} /> Company Website</label>
                <input value={form.company_website} onChange={e => set("company_website", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="https://company.com" data-testid="company-website" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1"><Linkedin size={12} /> Company LinkedIn * (Required)</label>
                <input required value={form.company_linkedin} onChange={e => set("company_linkedin", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="https://linkedin.com/company/..." data-testid="company-linkedin" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1"><MapPin size={12} /> Office Address *</label>
                <input required value={form.office_address} onChange={e => set("office_address", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="123 Business St, City" data-testid="company-address" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Company Description</label>
                <textarea value={form.company_description} onChange={e => set("company_description", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm resize-none h-20" placeholder="Tell us about your company..." data-testid="company-description" />
              </div>
              <div className="glass rounded-lg p-3 text-xs text-white/50">
                <Building2 size={14} className="inline text-emerald-400 mr-1" />
                After registration, our team will verify your company details. You'll be able to post internships once verified.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="glass-btn px-4 py-3 rounded-lg flex items-center gap-1 text-sm"><ArrowLeft size={14} /> Back</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  data-testid="company-submit-btn">
                  {loading ? "Registering..." : <>Register Company <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link>
            <br />
            <Link to="/register/student" className="text-cyan-400 hover:text-cyan-300 text-xs">Register as a Student instead</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
