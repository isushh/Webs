import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Award, Star, CheckCircle2, User, Briefcase } from "lucide-react";

/*
  The card starts hidden behind the hero text (centered, blurred, scaled down),
  then sweeps to the right while fading in and unblurring — like it's emerging
  from behind the content. When toggling between resume and cert the card
  dissolves + morphs (scale + blur + color shift) rather than flipping.
*/

export default function ResumeToCert() {
  const [isCert, setIsCert] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Initial entrance delay
    const enterTimer = setTimeout(() => setHasEntered(true), 1600);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (!hasEntered) return;
    const interval = setInterval(() => setIsCert(prev => !prev), 4500);
    return () => clearInterval(interval);
  }, [hasEntered]);

  /* ── Morph transition between resume <-> cert ── */
  const morphVariants = {
    initial: {
      opacity: 0,
      scale: 0.85,
      filter: "blur(12px)",
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      scale: 1.08,
      filter: "blur(16px)",
      transition: { duration: 0.5, ease: "easeIn" },
    },
  };

  return (
    <motion.div
      /* ── Entrance: sweeps from behind the hero (left-center) to the right ── */
      initial={{ opacity: 0, x: -280, scale: 0.5, filter: "blur(20px)", rotate: -8 }}
      animate={hasEntered
        ? { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", rotate: 0 }
        : { opacity: 0, x: -280, scale: 0.5, filter: "blur(20px)", rotate: -8 }
      }
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-[280px] h-[370px]"
      data-testid="resume-to-cert"
    >
      {/* Trailing ghost on entrance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={hasEntered ? { opacity: [0, 0.15, 0] } : {}}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="absolute inset-0 rounded-2xl border border-cyan-500/20"
        style={{ filter: "blur(8px)" }}
      />

      {/* Glow that morphs color */}
      <motion.div
        animate={{
          boxShadow: isCert
            ? "0 0 80px rgba(16, 185, 129, 0.2), 0 0 30px rgba(16, 185, 129, 0.1)"
            : "0 0 80px rgba(6, 182, 212, 0.2), 0 0 30px rgba(6, 182, 212, 0.1)",
        }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 rounded-2xl"
      />

      {/* Particle dust on morph */}
      <AnimatePresence>
        {hasEntered && (
          <motion.div key={isCert ? "dust-cert" : "dust-resume"}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div key={i}
                initial={{ x: 140, y: 180, scale: 0, opacity: 1 }}
                animate={{
                  x: 140 + (Math.random() - 0.5) * 200,
                  y: 180 + (Math.random() - 0.5) * 200,
                  scale: Math.random() * 1.5 + 0.5,
                  opacity: 0,
                }}
                transition={{ duration: 0.8 + Math.random() * 0.4, delay: i * 0.05 }}
                className={`absolute w-1 h-1 rounded-full ${isCert ? "bg-emerald-400" : "bg-cyan-400"}`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isCert ? (
          /* ══════ RESUME ══════ */
          <motion.div
            key="resume"
            variants={morphVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 rounded-2xl overflow-hidden"
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
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center"
                >
                  <FileText size={16} className="text-cyan-400" />
                </motion.div>
                <div>
                  <p className="text-white/90 text-sm font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>Resume</p>
                  <p className="text-white/30 text-[10px]">Nexalign Profile</p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-cyan-500/30 via-white/10 to-transparent mb-4" />

              <div className="flex items-center gap-2 mb-4">
                <User size={12} className="text-white/30" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Arjun Mehta</p>
                  <p className="text-white/30 text-[10px]">B.Tech CSE, DBS Dehradun</p>
                </div>
              </div>

              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {["React", "Python", "Figma"].map((s, i) => (
                  <motion.span key={s}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400/80 border border-cyan-500/15"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={11} className="text-white/25" />
                <p className="text-white/40 text-[10px]">Frontend Intern @ TechCorp</p>
              </div>

              {/* Animated placeholder lines */}
              <div className="flex-1 space-y-2 mt-2">
                {[100, 80, 60, 100, 66].map((w, i) => (
                  <motion.div key={i}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                    className="h-1.5 bg-white/[0.04] rounded-full"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>

              <div className="mt-auto pt-3 flex items-center gap-1 text-[10px] text-white/25">
                <CheckCircle2 size={10} className="text-cyan-400/50" />
                <span>LinkedIn verified</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ══════ CERTIFICATION ══════ */
          <motion.div
            key="cert"
            variants={morphVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 rounded-2xl overflow-hidden"
          >
            <div className="w-full h-full rounded-2xl p-6 flex flex-col items-center text-center"
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              {/* Shimmer border effect */}
              <motion.div
                animate={{ background: [
                  "linear-gradient(0deg, rgba(16,185,129,0.15), transparent)",
                  "linear-gradient(180deg, rgba(16,185,129,0.15), transparent)",
                  "linear-gradient(360deg, rgba(16,185,129,0.15), transparent)",
                ]}}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl pointer-events-none"
              />

              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center mb-4 mt-2"
              >
                <Award size={28} className="text-emerald-400" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/30 text-[10px] uppercase tracking-widest mb-2"
              >
                Certificate of Completion
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mb-4"
              />

              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-white/80 text-sm font-semibold mb-1"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Arjun Mehta
              </motion.p>
              <p className="text-white/40 text-[10px] mb-4 leading-relaxed max-w-[200px]">
                Has successfully completed a verified internship at
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-emerald-400 text-xs font-semibold mb-4"
              >
                TechCorp Solutions
              </motion.p>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 300 }}
                  >
                    <Star size={12} className="text-yellow-400/70 fill-yellow-400/70" />
                  </motion.div>
                ))}
              </div>

              <p className="text-white/30 text-[10px] mb-2">Duration: 3 Months</p>

              <div className="flex-1" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full"
              >
                <div className="h-px bg-white/10 mb-1 mx-8" />
                <p className="text-white/20 text-[9px]">Nexalign Verified</p>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-3 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 size={10} className="text-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-medium">Verified</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label that morphs too */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isCert ? "label-cert" : "label-resume"}
          initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
          animate={{ opacity: 0.5, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -5, filter: "blur(4px)" }}
          transition={{ duration: 0.4 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <p className="text-white/20 text-[10px] tracking-wider uppercase">
            {isCert ? "Internship certified" : "Upload your resume"}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
