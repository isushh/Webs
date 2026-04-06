import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Linkedin, Github, Globe, Palette, X, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SKILL_OPTIONS = [
  "JavaScript", "Python", "React", "Node.js", "Java", "C++", "TypeScript", "Flutter",
  "Django", "MongoDB", "SQL", "AWS", "Docker", "Figma", "UI/UX Design", "Data Science",
  "Machine Learning", "Graphic Design", "Content Writing", "Marketing", "SEO", "Video Editing",
];

export default function RegisterStudent() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    linkedin_url: "", github_url: "", behance_url: "", portfolio_url: "",
    skills: [], bio: "",
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleSkill = (s) => set("skills", form.skills.includes(s) ? form.skills.filter(x => x !== s) : [...form.skills, s]);

  const handleGoogleRegister = () => {
    localStorage.setItem("nexalign_oauth_role", "student");
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file) {
      const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowed.includes(file.type)) { toast.error("Only PDF and DOC files allowed"); return; }
      setResumeFile(file);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.linkedin_url) { toast.error("LinkedIn URL is required"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const data = await register(form.email, form.password, form.name, "student");
      const authToken = data.access_token || token;
      // Update profile
      await axios.put(`${API}/profile`, {
        linkedin_url: form.linkedin_url, github_url: form.github_url,
        behance_url: form.behance_url, portfolio_url: form.portfolio_url,
        skills: form.skills, bio: form.bio,
      }, { withCredentials: true, headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
      // Upload resume
      if (resumeFile) {
        const fd = new FormData();
        fd.append("file", resumeFile);
        await axios.post(`${API}/upload/resume`, fd, {
          withCredentials: true, headers: { "Content-Type": "multipart/form-data", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }
        });
      }
      toast.success("Account created! Welcome to Nexalign!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden" data-testid="register-student-page">
      <div className="absolute inset-0 bg-[url('https://static.prod-images.emergentagent.com/jobs/1264318a-53b6-4d06-8870-ec03dd90317f/images/6eb95cab97edfe3434d98fb5962f126b1552fc0775b4f6ad9a3499ae49a13545.png')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-[#050505]/70" />

      <div className="relative z-10 w-full max-w-lg animate-slide-up">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
              <span className="text-black font-bold">N</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Student Registration</h1>
          <p className="text-white/40 text-sm mt-1">Step {step} of 3</p>
          <div className="flex gap-1 mt-3 max-w-xs mx-auto">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? "bg-cyan-500" : "bg-white/10"}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-heavy rounded-2xl p-8 shadow-2xl" data-testid="student-register-form">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Full Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="John Doe" data-testid="student-name" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Email *</label>
                <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="john@dbs.edu" data-testid="student-email" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Password *</label>
                <input type="password" required value={form.password} onChange={e => set("password", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Min 6 characters" data-testid="student-password" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Confirm Password *</label>
                <input type="password" required value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Confirm password" data-testid="student-confirm-password" />
              </div>
              <button type="button" onClick={() => handleGoogleRegister()}
                className="w-full glass-btn py-3 rounded-lg text-sm text-white/80 flex items-center justify-center gap-2 mt-2"
                data-testid="student-google-register">
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.462.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Register with Google
              </button>
              <button type="button" onClick={() => setStep(2)} className="w-full py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2" data-testid="student-next-step1">
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1"><Linkedin size={12} /> LinkedIn URL * (Required)</label>
                <input required value={form.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="https://linkedin.com/in/yourprofile" data-testid="student-linkedin" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1"><Github size={12} /> GitHub URL</label>
                <input value={form.github_url} onChange={e => set("github_url", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="https://github.com/username" data-testid="student-github" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1"><Palette size={12} /> Behance URL</label>
                <input value={form.behance_url} onChange={e => set("behance_url", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="https://behance.net/username" data-testid="student-behance" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1"><Globe size={12} /> Portfolio URL</label>
                <input value={form.portfolio_url} onChange={e => set("portfolio_url", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="https://yourportfolio.com" data-testid="student-portfolio" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Short Bio</label>
                <textarea value={form.bio} onChange={e => set("bio", e.target.value)} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm resize-none h-20" placeholder="Tell us about yourself..." data-testid="student-bio" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="glass-btn px-4 py-3 rounded-lg flex items-center gap-1 text-sm"><ArrowLeft size={14} /> Back</button>
                <button type="button" onClick={() => { if (!form.linkedin_url) { toast.error("LinkedIn URL is required"); return; } setStep(3); }}
                  className="flex-1 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2" data-testid="student-next-step2">
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-2 block">Select Your Skills</label>
                <div className="flex flex-wrap gap-2" data-testid="student-skills-list">
                  {SKILL_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${form.skills.includes(s) ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "glass-btn text-white/60"}`}
                      data-testid={`skill-${s.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-2 block">Upload Resume (PDF/DOC)</label>
                <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                  className="glass rounded-xl p-6 border-2 border-dashed border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer text-center"
                  onClick={() => document.getElementById("resume-input").click()} data-testid="resume-dropzone">
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText size={20} className="text-cyan-400" />
                      <span className="text-sm text-white/80">{resumeFile.name}</span>
                      <button type="button" onClick={e => { e.stopPropagation(); setResumeFile(null); }} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-white/30 mb-2" />
                      <p className="text-sm text-white/40">Drag & drop or click to upload</p>
                      <p className="text-xs text-white/20 mt-1">PDF, DOC, DOCX</p>
                    </>
                  )}
                  <input id="resume-input" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleDrop} data-testid="resume-file-input" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="glass-btn px-4 py-3 rounded-lg flex items-center gap-1 text-sm"><ArrowLeft size={14} /> Back</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  data-testid="student-submit-btn">
                  {loading ? "Creating Account..." : <>Create Account <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300" data-testid="goto-login">Sign in</Link>
            <br />
            <Link to="/register/company" className="text-emerald-400 hover:text-emerald-300 text-xs" data-testid="goto-company-register">Register as a Company instead</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
