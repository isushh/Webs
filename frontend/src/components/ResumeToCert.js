import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Award, Star, CheckCircle2, User, Briefcase } from "lucide-react";

export default function ResumeToCert() {
  const [isCert, setIsCert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsCert(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 50, damping: 16 }}
      className="relative w-[280px] h-[360px]"
      style={{ perspective: "800px" }}
      data-testid="resume-to-cert"
    >
      {/* Glow behind */}
      <motion.div
        animate={{
          boxShadow: isCert
            ? "0 0 60px rgba(16, 185, 129, 0.2)"
            : "0 0 60px rgba(6, 182, 212, 0.2)",
        }}
        transition={{ duration: 1 }}
        className="absolute inset-0 rounded-2xl"
      />

      <AnimatePresence mode="wait">
        {!isCert ? (
          /* ── RESUME ── */
          <motion.div
            key="resume"
            initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-full h-full rounded-2xl p-6 flex flex-col"
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <FileText size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>Resume</p>
                  <p className="text-white/30 text-[10px]">Nexalign Profile</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-cyan-500/30 via-white/10 to-transparent mb-4" />

              {/* Name */}
              <div className="flex items-center gap-2 mb-4">
                <User size={12} className="text-white/30" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Arjun Mehta</p>
                  <p className="text-white/30 text-[10px]">B.Tech CSE, DBS Dehradun</p>
                </div>
              </div>

              {/* Skills */}
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {["React", "Python", "Figma"].map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400/80 border border-cyan-500/15">
                    {s}
                  </span>
                ))}
              </div>

              {/* Experience line */}
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={11} className="text-white/25" />
                <p className="text-white/40 text-[10px]">Frontend Intern @ TechCorp</p>
              </div>

              {/* Fake lines */}
              <div className="flex-1 space-y-2 mt-2">
                <div className="h-1.5 bg-white/[0.04] rounded-full w-full" />
                <div className="h-1.5 bg-white/[0.04] rounded-full w-4/5" />
                <div className="h-1.5 bg-white/[0.04] rounded-full w-3/5" />
                <div className="h-1.5 bg-white/[0.04] rounded-full w-full" />
                <div className="h-1.5 bg-white/[0.04] rounded-full w-2/3" />
              </div>

              {/* Bottom badge */}
              <div className="mt-auto pt-3 flex items-center gap-1 text-[10px] text-white/25">
                <CheckCircle2 size={10} className="text-cyan-400/50" />
                <span>LinkedIn verified</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── CERTIFICATION ── */
          <motion.div
            key="cert"
            initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-full h-full rounded-2xl p-6 flex flex-col items-center text-center"
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              {/* Award icon */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center mb-4 mt-2"
              >
                <Award size={28} className="text-emerald-400" />
              </motion.div>

              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Certificate of Completion</p>

              {/* Divider */}
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mb-4" />

              <p className="text-white/80 text-sm font-semibold mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Arjun Mehta
              </p>
              <p className="text-white/40 text-[10px] mb-4 leading-relaxed max-w-[200px]">
                Has successfully completed a verified internship at
              </p>
              <p className="text-emerald-400 text-xs font-semibold mb-4">TechCorp Solutions</p>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <Star size={12} className="text-yellow-400/70 fill-yellow-400/70" />
                  </motion.div>
                ))}
              </div>

              <p className="text-white/30 text-[10px] mb-2">Duration: 3 Months</p>

              {/* Fake signature area */}
              <div className="flex-1" />
              <div className="w-full">
                <div className="h-px bg-white/10 mb-1 mx-8" />
                <p className="text-white/20 text-[9px]">Nexalign Verified</p>
              </div>

              {/* Verified badge */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-3 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 size={10} className="text-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-medium">Verified</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating label */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <p className="text-white/20 text-[10px] tracking-wider uppercase">
          {isCert ? "Internship certified" : "Upload your resume"}
        </p>
      </motion.div>
    </motion.div>
  );
}
