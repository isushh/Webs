import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Briefcase, Clock, CheckCircle2, XCircle, FileText, ChevronRight, Linkedin, Github, Globe, Edit2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StudentDashboard() {
  const { user, token, updateUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [editProfile, setEditProfile] = useState(false);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [logForm, setLogForm] = useState({ internship_id: "", application_id: "", week_number: 1, tasks_completed: "", challenges: "", next_week_plan: "" });
  const [showLogForm, setShowLogForm] = useState(false);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [appsRes, profileRes] = await Promise.all([
        axios.get(`${API}/applications`, { withCredentials: true, headers }),
        axios.get(`${API}/auth/me`, { withCredentials: true, headers }),
      ]);
      setApplications(appsRes.data.applications || []);
      setProfile(profileRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`${API}/profile`, profile, { withCredentials: true, headers });
      updateUser(data);
      setProfile(data);
      setEditProfile(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const submitLog = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/logs`, logForm, { withCredentials: true, headers });
      toast.success("Weekly log submitted!");
      setShowLogForm(false);
      setLogForm({ ...logForm, tasks_completed: "", challenges: "", next_week_plan: "" });
    } catch (err) {
      toast.error("Failed to submit log");
    }
  };

  const statusIcon = (s) => {
    if (s === "accepted" || s === "shortlisted") return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (s === "rejected") return <XCircle size={14} className="text-red-400" />;
    return <Clock size={14} className="text-yellow-400" />;
  };

  const statusColor = (s) => {
    if (s === "accepted" || s === "shortlisted") return "text-emerald-400";
    if (s === "rejected") return "text-red-400";
    return "text-yellow-400";
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><p className="text-white/40">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="student-dashboard">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Welcome, {user?.name || "Student"}</h1>
          <p className="text-white/40 text-sm mt-1">Manage your applications and track your progress</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6" data-testid="profile-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Profile</h2>
              <button onClick={() => setEditProfile(!editProfile)} className="glass-btn p-2 rounded-lg" data-testid="edit-profile-btn"><Edit2 size={14} className="text-cyan-400" /></button>
            </div>
            {editProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-3">
                <input value={profile.name || ""} onChange={e => setProfile({ ...profile, name: e.target.value })} className="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Name" data-testid="edit-name" />
                <input value={profile.linkedin_url || ""} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} className="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="LinkedIn URL *" data-testid="edit-linkedin" />
                <input value={profile.github_url || ""} onChange={e => setProfile({ ...profile, github_url: e.target.value })} className="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="GitHub URL" />
                <input value={profile.portfolio_url || ""} onChange={e => setProfile({ ...profile, portfolio_url: e.target.value })} className="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Portfolio URL" />
                <textarea value={profile.bio || ""} onChange={e => setProfile({ ...profile, bio: e.target.value })} className="glass-input w-full px-3 py-2 rounded-lg text-sm resize-none h-16" placeholder="Bio" />
                <button type="submit" className="w-full py-2 rounded-lg bg-cyan-500 text-black font-semibold text-sm" data-testid="save-profile-btn">Save Profile</button>
              </form>
            ) : (
              <div className="space-y-3 text-sm">
                <p className="text-white/60">{profile.email}</p>
                {profile.bio && <p className="text-white/50">{profile.bio}</p>}
                <div className="flex flex-wrap gap-2">
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="glass-btn px-2 py-1 rounded text-xs flex items-center gap-1"><Linkedin size={12} className="text-cyan-400" /> LinkedIn</a>}
                  {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="glass-btn px-2 py-1 rounded text-xs flex items-center gap-1"><Github size={12} /> GitHub</a>}
                  {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="glass-btn px-2 py-1 rounded text-xs flex items-center gap-1"><Globe size={12} /> Portfolio</a>}
                </div>
                {profile.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{s}</span>)}
                  </div>
                )}
                {profile.resume_filename && <p className="flex items-center gap-1 text-xs text-white/40"><FileText size={12} /> {profile.resume_filename}</p>}
                {!profile.profile_completed && (
                  <div className="glass rounded-lg p-2 text-xs text-yellow-400 mt-2">Complete your profile to increase visibility (LinkedIn required)</div>
                )}
              </div>
            )}
          </motion.div>

          {/* Applications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">My Applications</h2>
              <Link to="/internships" className="glass-btn px-3 py-1.5 rounded-lg text-xs text-cyan-400 flex items-center gap-1" data-testid="browse-internships-link">Browse Internships <ChevronRight size={12} /></Link>
            </div>
            {applications.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Briefcase size={32} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">No applications yet</p>
                <Link to="/internships" className="inline-flex items-center gap-1 mt-3 text-cyan-400 text-sm hover:text-cyan-300" data-testid="explore-internships">Explore internships <ChevronRight size={14} /></Link>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.application_id} className="glass-card p-5 flex items-center justify-between" data-testid={`application-${app.application_id}`}>
                  <div>
                    <h3 className="text-white font-medium">{app.internship_title || "Internship"}</h3>
                    <p className="text-white/40 text-xs mt-1">{app.company_name} - Applied {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 text-xs font-medium ${statusColor(app.status)}`}>
                      {statusIcon(app.status)} {app.status}
                    </span>
                    {app.status === "accepted" && (
                      <button onClick={() => { setLogForm({ ...logForm, internship_id: app.internship_id, application_id: app.application_id }); setShowLogForm(true); }}
                        className="glass-btn px-3 py-1.5 rounded-lg text-xs text-emerald-400" data-testid="submit-log-btn">
                        Submit Log
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Weekly Log Form */}
            {showLogForm && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6" data-testid="weekly-log-form">
                <h3 className="text-white font-semibold mb-4">Submit Weekly Log</h3>
                <form onSubmit={submitLog} className="space-y-3">
                  <input type="number" min={1} value={logForm.week_number} onChange={e => setLogForm({ ...logForm, week_number: parseInt(e.target.value) })}
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Week Number" data-testid="log-week-number" />
                  <textarea required value={logForm.tasks_completed} onChange={e => setLogForm({ ...logForm, tasks_completed: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm resize-none h-20" placeholder="Tasks completed this week *" data-testid="log-tasks" />
                  <textarea value={logForm.challenges} onChange={e => setLogForm({ ...logForm, challenges: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm resize-none h-16" placeholder="Challenges faced" data-testid="log-challenges" />
                  <textarea value={logForm.next_week_plan} onChange={e => setLogForm({ ...logForm, next_week_plan: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm resize-none h-16" placeholder="Next week plan" data-testid="log-next-plan" />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowLogForm(false)} className="glass-btn px-4 py-2 rounded-lg text-sm">Cancel</button>
                    <button type="submit" className="flex-1 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-sm" data-testid="submit-log-form-btn">Submit Log</button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
