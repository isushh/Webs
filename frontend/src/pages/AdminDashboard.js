import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Users, Building2, Briefcase, FileText, ShieldCheck, ShieldX, Clock, Eye, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewUser, setViewUser] = useState(null);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [statsRes, usersRes, companiesRes, appsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { withCredentials: true, headers }),
        axios.get(`${API}/admin/users`, { withCredentials: true, headers }),
        axios.get(`${API}/admin/companies`, { withCredentials: true, headers }),
        axios.get(`${API}/admin/applications`, { withCredentials: true, headers }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setCompanies(companiesRes.data.companies || []);
      setApplications(appsRes.data.applications || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const verifyCompany = async (userId, status) => {
    try {
      await axios.put(`${API}/admin/companies/${userId}/verify`, { status, notes: "" }, { withCredentials: true, headers });
      toast.success(`Company ${status}`);
      loadData();
    } catch (err) { toast.error("Failed to update verification"); }
  };

  const statCards = [
    { label: "Students", value: stats.total_students || 0, icon: Users, color: "text-cyan-400" },
    { label: "Companies", value: stats.total_companies || 0, icon: Building2, color: "text-emerald-400" },
    { label: "Pending Verification", value: stats.pending_companies || 0, icon: Clock, color: "text-yellow-400" },
    { label: "Active Internships", value: stats.active_internships || 0, icon: Briefcase, color: "text-purple-400" },
    { label: "Total Applications", value: stats.total_applications || 0, icon: FileText, color: "text-pink-400" },
  ];

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "companies", label: "Companies", icon: Building2 },
    { key: "students", label: "Students", icon: Users },
    { key: "applications", label: "Applications", icon: FileText },
  ];

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><p className="text-white/40">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="admin-dashboard">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Admin Dashboard <ShieldCheck size={24} className="text-emerald-400" />
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-lg mb-6 max-w-md overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${tab === t.key ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-white/50"}`}
              data-testid={`admin-tab-${t.key}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
                <s.icon size={20} className={s.color} />
                <p className="text-2xl font-bold text-white mt-2">{s.value}</p>
                <p className="text-white/40 text-xs mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Companies */}
        {tab === "companies" && (
          <div className="space-y-4">
            {companies.map(c => (
              <div key={c.user_id} className="glass-card p-5 flex items-center justify-between" data-testid={`company-${c.user_id}`}>
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    {c.company_name || c.name}
                    {c.verification_status === "verified" && <span className="verified-badge text-xs">Verified</span>}
                    {c.verification_status === "rejected" && <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">Rejected</span>}
                    {c.verification_status === "pending" && <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">Pending</span>}
                  </h3>
                  <p className="text-white/40 text-xs mt-1">{c.email} | {c.office_address || "No address"}</p>
                  {c.company_linkedin && <p className="text-cyan-400/60 text-xs mt-1">{c.company_linkedin}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewUser(c)} className="glass-btn p-2 rounded-lg" data-testid={`view-company-${c.user_id}`}><Eye size={14} className="text-white/60" /></button>
                  {c.verification_status === "pending" && (
                    <>
                      <button onClick={() => verifyCompany(c.user_id, "verified")} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/20 flex items-center gap-1" data-testid={`verify-${c.user_id}`}>
                        <ShieldCheck size={12} /> Verify
                      </button>
                      <button onClick={() => verifyCompany(c.user_id, "rejected")} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs border border-red-500/20 flex items-center gap-1" data-testid={`reject-company-${c.user_id}`}>
                        <ShieldX size={12} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {companies.length === 0 && <div className="glass-card p-12 text-center"><p className="text-white/40 text-sm">No companies registered yet</p></div>}
          </div>
        )}

        {/* Students */}
        {tab === "students" && (
          <div className="space-y-4">
            {users.filter(u => u.role === "student").map(u => (
              <div key={u.user_id} className="glass-card p-5 flex items-center justify-between" data-testid={`student-${u.user_id}`}>
                <div>
                  <h3 className="text-white font-medium">{u.name}</h3>
                  <p className="text-white/40 text-xs mt-1">{u.email}</p>
                  {u.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {u.skills.slice(0, 5).map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400">{s}</span>)}
                    </div>
                  )}
                </div>
                <button onClick={() => setViewUser(u)} className="glass-btn p-2 rounded-lg" data-testid={`view-student-${u.user_id}`}><Eye size={14} className="text-white/60" /></button>
              </div>
            ))}
          </div>
        )}

        {/* Applications */}
        {tab === "applications" && (
          <div className="space-y-4">
            {applications.map(a => (
              <div key={a.application_id} className="glass-card p-5" data-testid={`admin-app-${a.application_id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{a.student_name} applied for {a.internship_title || "Internship"}</h3>
                    <p className="text-white/40 text-xs mt-1">{a.student_email} | {a.company_name} | {new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${a.status === "accepted" || a.status === "shortlisted" ? "text-emerald-400" : a.status === "rejected" ? "text-red-400" : "text-yellow-400"}`}>
                    {a.status === "accepted" || a.status === "shortlisted" ? <CheckCircle2 size={14} /> : a.status === "rejected" ? <XCircle size={14} /> : <Clock size={14} />}
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
            {applications.length === 0 && <div className="glass-card p-12 text-center"><p className="text-white/40 text-sm">No applications yet</p></div>}
          </div>
        )}

        {/* View Profile Dialog */}
        <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
          <DialogContent className="glass-heavy border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">{viewUser?.name || viewUser?.company_name}</DialogTitle>
            </DialogHeader>
            {viewUser && (
              <div className="space-y-3 text-sm">
                <p className="text-white/60"><span className="text-white/40">Email:</span> {viewUser.email}</p>
                <p className="text-white/60"><span className="text-white/40">Role:</span> {viewUser.role}</p>
                {viewUser.linkedin_url && <p className="text-cyan-400 text-xs break-all">{viewUser.linkedin_url}</p>}
                {viewUser.company_linkedin && <p className="text-cyan-400 text-xs break-all">{viewUser.company_linkedin}</p>}
                {viewUser.github_url && <p className="text-white/40 text-xs break-all">GitHub: {viewUser.github_url}</p>}
                {viewUser.portfolio_url && <p className="text-white/40 text-xs break-all">Portfolio: {viewUser.portfolio_url}</p>}
                {viewUser.office_address && <p className="text-white/40 text-xs">Address: {viewUser.office_address}</p>}
                {viewUser.bio && <p className="text-white/50 text-xs">{viewUser.bio}</p>}
                {viewUser.company_description && <p className="text-white/50 text-xs">{viewUser.company_description}</p>}
                {viewUser.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {viewUser.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400">{s}</span>)}
                  </div>
                )}
                <p className="text-white/30 text-xs">Joined: {new Date(viewUser.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
