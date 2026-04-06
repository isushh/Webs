import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { MapPin, Clock, Briefcase, Building2, ShieldCheck, Users, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function InternshipDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    loadInternship();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInternship = async () => {
    try {
      const { data } = await axios.get(`${API}/internships/${id}`);
      setInternship(data);
    } catch (err) {
      toast.error("Internship not found");
      navigate("/internships", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (user.role !== "student") { toast.error("Only students can apply"); return; }
    setApplying(true);
    try {
      await axios.post(`${API}/applications`, {
        internship_id: id, cover_letter: coverLetter,
      }, { withCredentials: true, headers });
      toast.success("Application submitted!");
      setShowApplyForm(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><p className="text-white/40">Loading...</p></div>;
  if (!internship) return null;

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="internship-detail-page">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link to="/internships" className="inline-flex items-center gap-1 text-white/40 text-sm hover:text-white/60 mb-6" data-testid="back-to-internships">
          <ArrowLeft size={14} /> Back to Internships
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8" data-testid="internship-detail-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Building2 size={22} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-white/50 text-sm">{internship.company_name}</p>
                  <span className="verified-badge text-xs flex items-center gap-1"><ShieldCheck size={10} /> Verified Company</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{internship.title}</h1>
            </div>
            {user?.role === "student" && (
              <button onClick={() => setShowApplyForm(true)} className="glass-btn px-5 py-2.5 rounded-lg text-sm text-cyan-400 flex items-center gap-2 hover:text-cyan-300 whitespace-nowrap" data-testid="apply-btn">
                <Send size={14} /> Apply Now
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-white/50">
            <span className="flex items-center gap-1"><MapPin size={14} /> {internship.location}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {internship.duration}</span>
            <span className="flex items-center gap-1"><Briefcase size={14} /> {internship.type}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {internship.openings} opening(s)</span>
          </div>

          {internship.stipend && <p className="text-emerald-400 font-medium mb-6">{internship.stipend}</p>}

          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">{internship.description}</p>
            </div>

            {internship.requirements?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-2">Requirements</h3>
                <ul className="space-y-1">
                  {internship.requirements.map((r, i) => (
                    <li key={i} className="text-white/50 text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {internship.skills_required?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.skills_required.map(s => (
                    <span key={s} className="px-3 py-1 rounded-full text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!user && (
            <div className="mt-8 glass rounded-xl p-6 text-center">
              <p className="text-white/50 text-sm mb-3">Sign in to apply for this internship</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 text-black font-semibold text-sm" data-testid="login-to-apply">
                Sign In to Apply
              </Link>
            </div>
          )}
        </motion.div>

        {/* Apply Form Modal */}
        {showApplyForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid="apply-modal">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-heavy rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Apply to {internship.title}</h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Cover Letter (optional)</label>
                  <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-lg text-sm resize-none h-32"
                    placeholder="Tell the company why you're a great fit..." data-testid="cover-letter" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowApplyForm(false)} className="glass-btn px-4 py-2.5 rounded-lg text-sm">Cancel</button>
                  <button type="submit" disabled={applying}
                    className="flex-1 py-2.5 rounded-lg bg-cyan-500 text-black font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="submit-application-btn">
                    {applying ? "Submitting..." : <><Send size={14} /> Submit Application</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
