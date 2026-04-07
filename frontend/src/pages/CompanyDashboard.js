import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Plus, Users, Briefcase, Clock, CheckCircle2, XCircle, X, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SKILL_OPTIONS = ["JavaScript", "Python", "React", "Node.js", "Java", "C++", "TypeScript", "Flutter", "Django", "MongoDB", "SQL", "AWS", "Docker", "Figma", "UI/UX Design", "Data Science", "Machine Learning", "Content Writing", "Marketing"];

export default function CompanyDashboard() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState("internships");
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", requirements: "", skills_required: [], duration: "", stipend: "", location: "", type: "remote", openings: 1 });
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [intRes, appRes] = await Promise.all([
        axios.get(`${API}/internships`, { withCredentials: true, headers }),
        axios.get(`${API}/applications`, { withCredentials: true, headers }),
      ]);
      const myInternships = (intRes.data.internships || []).filter(i => i.company_user_id === user?.user_id);
      setInternships(myInternships);
      setApplications(appRes.data.applications || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/internships`, {
        ...form,
        requirements: form.requirements.split("\n").filter(Boolean),
        openings: parseInt(form.openings),
      }, { withCredentials: true, headers });
      toast.success("Internship posted!");
      setShowCreateForm(false);
      setForm({ title: "", description: "", requirements: "", skills_required: [], duration: "", stipend: "", location: "", type: "remote", openings: 1 });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to post internship");
    }
  };

  const updateAppStatus = async (appId, status) => {
    try {
      await axios.put(`${API}/applications/${appId}/status`, { status }, { withCredentials: true, headers });
      toast.success(`Application ${status}`);
      loadData();
    } catch (err) { toast.error("Failed to update status"); }
  };

  const isVerified = user?.verification_status === "verified";

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><p className="text-white/40">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="company-dashboard">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {user?.company_name || user?.name}
              {isVerified && <span className="verified-badge flex items-center gap-1"><ShieldCheck size={12} /> Verified</span>}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {isVerified ? "Manage your internship postings and applications" : "Awaiting verification from Nexalign team"}
            </p>
          </div>
          {isVerified && (
            <button onClick={() => setShowCreateForm(true)} className="glass-btn px-4 py-2.5 rounded-lg text-sm text-cyan-400 flex items-center gap-2 hover:text-cyan-300" data-testid="create-internship-btn">
              <Plus size={16} /> Post Internship
            </button>
          )}
        </motion.div>

        {!isVerified && (
          <div className="glass-card p-6 mb-6 border-yellow-500/20" data-testid="verification-pending">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-yellow-400" />
              <div>
                <p className="text-white font-medium">Verification Pending</p>
                <p className="text-white/40 text-sm">Our team is reviewing your company. You'll be able to post internships once verified.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-lg mb-6 max-w-xs">
          {[{ key: "internships", label: "Internships", icon: Briefcase }, { key: "applications", label: "Applications", icon: Users }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${tab === t.key ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-white/50"}`}
              data-testid={`tab-${t.key}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Internships Tab */}
        {tab === "internships" && (
          <div className="space-y-4">
            {internships.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Briefcase size={32} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">No internships posted yet</p>
              </div>
            ) : internships.map(intern => (
              <div key={intern.internship_id} className="glass-card p-5" data-testid={`internship-${intern.internship_id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{intern.title}</h3>
                    <p className="text-white/40 text-xs mt-1">{intern.location} - {intern.type} - {intern.duration}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-white/40">{intern.applications_count} applications</span>
                    <span className={intern.status === "active" ? "text-emerald-400" : "text-red-400"}>{intern.status}</span>
                  </div>
                </div>
                {intern.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {intern.skills_required.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400">{s}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Applications Tab */}
        {tab === "applications" && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Users size={32} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">No applications received yet</p>
              </div>
            ) : applications.map(app => (
              <div key={app.application_id} className="glass-card p-5" data-testid={`app-${app.application_id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{app.student_name}</h3>
                    <p className="text-white/40 text-xs">{app.student_email} - Applied for: {app.internship_title}</p>
                    {app.cover_letter && <p className="text-white/30 text-xs mt-2 max-w-xl">{app.cover_letter}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {app.status === "pending" ? (
                      <>
                        <button onClick={() => updateAppStatus(app.application_id, "shortlisted")} className="glass-btn px-3 py-1.5 rounded-lg text-xs text-cyan-400" data-testid={`shortlist-${app.application_id}`}>Shortlist</button>
                        <button onClick={() => updateAppStatus(app.application_id, "accepted")} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/20" data-testid={`accept-${app.application_id}`}>Accept</button>
                        <button onClick={() => updateAppStatus(app.application_id, "rejected")} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs border border-red-500/20" data-testid={`reject-${app.application_id}`}>Reject</button>
                      </>
                    ) : (
                      <span className={`flex items-center gap-1 text-xs font-medium ${app.status === "accepted" || app.status === "shortlisted" ? "text-emerald-400" : "text-red-400"}`}>
                        {app.status === "accepted" || app.status === "shortlisted" ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {app.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Internship Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid="create-internship-modal">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-heavy rounded-2xl p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Post New Internship</h2>
                <button onClick={() => setShowCreateForm(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateInternship} className="space-y-4">
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Internship Title *" data-testid="intern-title" />
                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm resize-none h-24" placeholder="Description *" data-testid="intern-description" />
                <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm resize-none h-16" placeholder="Requirements (one per line)" data-testid="intern-requirements" />
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Required Skills</label>
                  <div className="flex flex-wrap gap-1">
                    {SKILL_OPTIONS.map(s => (
                      <button key={s} type="button" onClick={() => setForm({ ...form, skills_required: form.skills_required.includes(s) ? form.skills_required.filter(x => x !== s) : [...form.skills_required, s] })}
                        className={`px-2 py-1 rounded-full text-xs transition-all ${form.skills_required.includes(s) ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "glass-btn text-white/50"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Duration (e.g., 3 months)" data-testid="intern-duration" />
                  <input value={form.stipend} onChange={e => setForm({ ...form, stipend: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Stipend (optional)" data-testid="intern-stipend" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Location *" data-testid="intern-location" />
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" data-testid="intern-type">
                    <option value="remote" className="bg-[#0a0a0b]">Remote</option>
                    <option value="onsite" className="bg-[#0a0a0b]">Onsite</option>
                    <option value="hybrid" className="bg-[#0a0a0b]">Hybrid</option>
                  </select>
                </div>
                <input type="number" min={1} value={form.openings} onChange={e => setForm({ ...form, openings: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-lg text-sm" placeholder="Number of openings" data-testid="intern-openings" />
                <button type="submit" className="w-full py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all" data-testid="post-internship-btn">Post Internship</button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
