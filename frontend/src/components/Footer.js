import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505]" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
                <span className="text-black font-bold text-sm">N</span>
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Nexalign</span>
            </div>
            <p className="text-white/50 text-sm max-w-sm leading-relaxed">
              The only internship platform where every company is verified before posting. Built exclusively for DBS Dehradun students.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <div className="space-y-2">
              <Link to="/internships" className="block text-white/50 hover:text-cyan-400 text-sm transition-colors">Browse Internships</Link>
              <Link to="/register/student" className="block text-white/50 hover:text-cyan-400 text-sm transition-colors">Student Sign Up</Link>
              <Link to="/register/company" className="block text-white/50 hover:text-cyan-400 text-sm transition-colors">Company Sign Up</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Connect</h4>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="glass-btn p-2 rounded-lg" data-testid="footer-linkedin"><Linkedin size={16} className="text-white/60" /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="glass-btn p-2 rounded-lg" data-testid="footer-github"><Github size={16} className="text-white/60" /></a>
              <a href="mailto:support@nexalign.com" className="glass-btn p-2 rounded-lg" data-testid="footer-email"><Mail size={16} className="text-white/60" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">2024 Nexalign. All rights reserved.</p>
          <p className="text-white/30 text-xs flex items-center gap-1">Made with <Heart size={12} className="text-red-400" /> for DBS Dehradun</p>
        </div>
      </div>
    </footer>
  );
}
