import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, GraduationCap, TrendingUp, Building2, UserCheck, ClipboardList, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero3D from "@/components/Hero3D";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" } }),
};

const features = [
  { icon: ShieldCheck, title: "100% Verified Companies", desc: "Every company is manually verified by our team before they can post internships.", color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-500/5" },
  { icon: GraduationCap, title: "DBS Exclusive", desc: "Built exclusively for DBS Dehradun students. Your campus, your opportunities.", color: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-500/5" },
  { icon: TrendingUp, title: "Track Your Progress", desc: "Submit weekly logs, get feedback, and increase your chances of full-time conversion.", color: "text-purple-400", bg: "from-purple-500/20 to-purple-500/5" },
];

const steps = [
  { num: "01", icon: Building2, title: "Companies Apply & Get Verified", desc: "Companies submit their details. Our team calls them, verifies their office, checks LinkedIn, and approves only legitimate businesses." },
  { num: "02", icon: UserCheck, title: "Students Browse & Apply", desc: "DBS students create profiles with their GitHub, Behance, and portfolio. Browse verified internships and apply with one click." },
  { num: "03", icon: ClipboardList, title: "Work, Log, & Convert", desc: "Submit weekly logs during your internship, receive feedback from companies, and get tracked for full-time job conversions." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505]" data-testid="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
        <Hero3D />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 glass-btn px-4 py-2 rounded-full mb-8">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-white/70">Every company verified before posting</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl lg:text-7xl tracking-tighter font-bold leading-[1.05]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <span className="text-white">Real internships.</span>
              <br />
              <span className="gradient-text">Zero scams.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
              The only internship platform where every company is verified before posting. No scams. No fake postings. Just real opportunities from real companies.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-4">
              <Link to="/register/student" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:-translate-y-0.5" data-testid="hero-student-cta">
                Find Internships <ArrowRight size={16} />
              </Link>
              <Link to="/register/company" className="glass-btn inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium" data-testid="hero-company-cta">
                Post an Internship
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="mt-12 flex items-center gap-6 text-xs text-white/40">
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-400" /> Verified only</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-cyan-400" /> DBS Exclusive</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-purple-400" /> Progress tracking</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl tracking-tight font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Why <span className="gradient-text">Nexalign</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-white/50 max-w-lg mx-auto text-sm">
              We call every company, verify their office address, check their LinkedIn, and confirm they're a legitimate business before approval.
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="glass-card p-8 group cursor-default" data-testid={`feature-card-${i}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl tracking-tight font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              How It <span className="gradient-text">Works</span>
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="glass-card p-8 relative overflow-hidden group" data-testid={`step-card-${i}`}>
                <span className="absolute top-4 right-4 text-6xl font-black text-white/[0.03] select-none" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.num}</span>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6">
                  <s.icon size={20} className="text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />
            <motion.h2 variants={fadeUp} custom={0} className="relative text-3xl sm:text-4xl tracking-tight font-semibold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Ready to find your next <span className="gradient-text">opportunity</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="relative text-white/50 mb-8 max-w-md mx-auto text-sm">
              Join hundreds of DBS students already using Nexalign to land verified internships.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="relative flex flex-wrap justify-center gap-4">
              <Link to="/register/student" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]" data-testid="cta-student-btn">
                I'm a Student <ArrowRight size={16} />
              </Link>
              <Link to="/register/company" className="glass-btn inline-flex items-center gap-2 px-8 py-3 rounded-lg text-white font-medium" data-testid="cta-company-btn">
                I'm a Company <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
