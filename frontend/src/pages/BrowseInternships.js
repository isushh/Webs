import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Search, MapPin, Clock, Briefcase, Building2, Filter, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BrowseInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadInternships();
  }, [search, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInternships = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      const { data } = await axios.get(`${API}/internships?${params.toString()}`);
      setInternships(data.internships || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="browse-internships-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Browse <span className="gradient-text">Internships</span>
          </h1>
          <p className="text-white/40 text-sm mb-8">{total} verified opportunities available</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm" placeholder="Search internships, companies, skills..."
              data-testid="search-internships" />
          </div>
          <div className="flex gap-2">
            {["", "remote", "onsite", "hybrid"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-4 py-2.5 rounded-lg text-sm transition-all ${typeFilter === t ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "glass-btn text-white/50"}`}
                data-testid={`filter-${t || 'all'}`}>
                {t ? t.charAt(0).toUpperCase() + t.slice(1) : "All"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Internship Cards */}
        {loading ? (
          <div className="text-center py-20"><p className="text-white/40">Loading internships...</p></div>
        ) : internships.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Briefcase size={40} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/40 text-lg font-medium">No internships found</p>
            <p className="text-white/30 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((intern, i) => (
              <motion.div key={intern.internship_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/internships/${intern.internship_id}`} className="block glass-card p-6 group" data-testid={`internship-card-${intern.internship_id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Building2 size={18} className="text-cyan-400" />
                    </div>
                    <span className="verified-badge flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-cyan-400 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>{intern.title}</h3>
                  <p className="text-white/50 text-sm mb-3">{intern.company_name}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 text-xs text-white/40"><MapPin size={12} /> {intern.location}</span>
                    <span className="flex items-center gap-1 text-xs text-white/40"><Clock size={12} /> {intern.duration}</span>
                    <span className="flex items-center gap-1 text-xs text-white/40"><Briefcase size={12} /> {intern.type}</span>
                  </div>
                  {intern.stipend && <p className="text-emerald-400 text-sm font-medium mb-3">{intern.stipend}</p>}
                  {intern.skills_required?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {intern.skills_required.slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">{s}</span>
                      ))}
                      {intern.skills_required.length > 4 && <span className="text-xs text-white/30">+{intern.skills_required.length - 4}</span>}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
