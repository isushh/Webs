import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, GraduationCap, TrendingUp, Building2, UserCheck, ClipboardList, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero3D from "@/components/Hero3D";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import ResumeToCert from "@/components/ResumeToCert";

/* ── Slide-in variants per card direction ── */
const slideFromLeft = {
  hidden: { opacity: 0, x: -80, rotate: -2 },
  visible: { opacity: 1, x: 0, rotate: 0, transition: { type: "spring", stiffness: 60, damping: 18 } },
};
const slideFromRight = {
  hidden: { opacity: 0, x: 80, rotate: 2 },
  visible: { opacity: 1, x: 0, rotate: 0, transition: { type: "spring", stiffness: 60, damping: 18 } },
};
const slideFromBottom = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 60, damping: 18 } },
};
const featureVariants = [slideFromLeft, slideFromBottom, slideFromRight];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" } }),
};

/* Step cards: staggered scale-in from center */
const stepPopIn = {
  hidden: { opacity: 0, scale: 0.8, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.2, type: "spring", stiffness: 80, damping: 14 },
  }),
};

/* Pop effects — pronounced for clicks, with spring physics */
const tapPop = { scale: 0.9, transition: { type: "spring", stiffness: 500, damping: 15 } };
const hoverPop = { scale: 1.05, y: -4, transition: { type: "spring", stiffness: 300, damping: 15 } };
const cardHoverPop = { scale: 1.03, y: -8, boxShadow: "0 16px 48px rgba(6, 182, 212, 0.15)", borderColor: "rgba(6, 182, 212, 0.5)", transition: { type: "spring", stiffness: 300, damping: 18 } };
const cardTapPop = { scale: 0.96, y: 0, transition: { type: "spring", stiffness: 400, damping: 12 } };

/* Animated button wrapper — adds shimmer + ripple on hover */
function AnimatedButton({ children, variant = "primary", to, testId }) {
  return (
    <motion.div whileHover={hoverPop} whileTap={tapPop} className="relative">
      <Link to={to} className={`relative inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold overflow-hidden group ${
        variant === "primary"
          ? "bg-cyan-500 text-black hover:bg-cyan-400"
          : "glass-btn text-white"
      }`} data-testid={testId}>
        {/* Shimmer sweep on hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        {/* Glow pulse behind */}
        {variant === "primary" && (
          <motion.span
            className="absolute inset-0 rounded-lg pointer-events-none"
            animate={{ boxShadow: ["0 0 0px rgba(6,182,212,0)", "0 0 25px rgba(6,182,212,0.35)", "0 0 0px rgba(6,182,212,0)"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    </motion.div>
  );
}

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
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="landing-page">
      <LoadingScreen />
      <Navbar />

      {/* ══════════ Hero Section with parallax ══════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
        <Hero3D />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-transparent" />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 w-full">
          <div className="flex items-center justify-between gap-8">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl flex-1">
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 glass-btn px-4 py-2 rounded-full mb-8">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                <ShieldCheck size={14} className="text-emerald-400" />
              </motion.div>
              <span className="text-xs font-medium text-white/70">Every company verified before posting</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl lg:text-7xl tracking-tighter font-bold leading-[1.05]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <span className="text-white">Real internships.</span>
              <br />
              <motion.span className="gradient-text inline-block"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}>
                Zero scams.
              </motion.span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="mt-6 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
              The only internship platform where every company is verified before posting. No scams. No fake postings. Just real opportunities from real companies.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-4">
              <AnimatedButton variant="primary" to="/register/student" testId="hero-student-cta">
                Find Internships <ArrowRight size={16} />
              </AnimatedButton>
              <AnimatedButton variant="glass" to="/register/company" testId="hero-company-cta">
                Post an Internship <Sparkles size={14} className="text-emerald-400" />
              </AnimatedButton>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-12 flex items-center gap-6 text-xs text-white/40">
              {[
                { icon: "text-emerald-400", label: "Verified only" },
                { icon: "text-cyan-400", label: "DBS Exclusive" },
                { icon: "text-purple-400", label: "Progress tracking" },
              ].map((item, idx) => (
                <motion.span key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + idx * 0.15 }}
                  className="flex items-center gap-1">
                  <CheckCircle2 size={14} className={item.icon} /> {item.label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Resume → Certification floating glass card ── */}
          {/* Desktop: beside hero text */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <ResumeToCert />
            </motion.div>
          </div>
          </div>

          {/* Mobile: centered below hero text */}
          <div className="flex md:hidden justify-center mt-10 mb-16 pb-8">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transform: "scale(0.85)" }}>
              <ResumeToCert />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══════════ Features — slide-in from different directions ══════════ */}
      <section className="py-24 relative" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 glass-btn px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={12} className="text-cyan-400" />
              <span className="text-xs text-white/50">Why choose us</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl tracking-tight font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Why <span className="gradient-text">Nexalign</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-white/50 max-w-lg mx-auto text-sm">
              We call every company, verify their office address, check their LinkedIn, and confirm they're a legitimate business before approval.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={featureVariants[i]}
                whileHover={cardHoverPop}
                whileTap={cardTapPop}
                className="glass-card p-8 group cursor-pointer"
                data-testid={`feature-card-${i}`}
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.bg} flex items-center justify-center mb-6`}
                >
                  <f.icon size={22} className={f.color} />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                {/* Animated underline on hover */}
                <motion.div className="h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500 mt-6 rounded-full origin-left"
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: "easeOut" }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ How It Works — pop-in with stagger ══════════ */}
      <section className="py-24 relative overflow-hidden" data-testid="how-it-works-section">
        {/* Decorative line connecting steps */}
        <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 glass-btn px-3 py-1.5 rounded-full mb-4">
              <ClipboardList size={12} className="text-emerald-400" />
              <span className="text-xs text-white/50">Simple process</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl tracking-tight font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              How It <span className="gradient-text">Works</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stepPopIn}
                custom={i}
                whileHover={cardHoverPop}
                whileTap={cardTapPop}
                className="glass-card p-8 relative overflow-hidden group cursor-pointer"
                data-testid={`step-card-${i}`}
              >
                {/* Animated step number */}
                <motion.span
                  initial={{ opacity: 0, scale: 2 }}
                  whileInView={{ opacity: 0.03, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }}
                  className="absolute top-4 right-4 text-7xl font-black text-white select-none"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {s.num}
                </motion.span>

                {/* Step number badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.2, type: "spring", stiffness: 200 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center mb-4 text-black text-xs font-bold"
                >
                  {i + 1}
                </motion.div>

                <motion.div whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: "spring", stiffness: 300 }}
                  className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6">
                  <s.icon size={20} className="text-cyan-400" />
                </motion.div>

                <h3 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>

                {/* Arrow connector (visible on desktop) */}
                {i < 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.2 }}
                    className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass items-center justify-center"
                  >
                    <ArrowRight size={14} className="text-cyan-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA — scale-in with glow ══════════ */}
      <section className="py-24" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />
            {/* Animated background orbs */}
            <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-cyan-500/5 blur-3xl" />
            <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }}
              className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-emerald-500/5 blur-3xl" />

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative text-3xl sm:text-4xl tracking-tight font-semibold text-white mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Ready to find your next <span className="gradient-text">opportunity</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="relative text-white/50 mb-8 max-w-md mx-auto text-sm"
            >
              Join hundreds of DBS students already using Nexalign to land verified internships.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="relative flex flex-wrap justify-center gap-4"
            >
              <AnimatedButton variant="primary" to="/register/student" testId="cta-student-btn">
                I'm a Student <ArrowRight size={16} />
              </AnimatedButton>
              <AnimatedButton variant="glass" to="/register/company" testId="cta-company-btn">
                I'm a Company <ArrowRight size={16} />
              </AnimatedButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
