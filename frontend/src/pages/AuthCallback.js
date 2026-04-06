import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const { googleCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      const hash = location.hash || window.location.hash;
      const sessionId = new URLSearchParams(hash.replace("#", "?")).get("session_id");

      if (!sessionId) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const role = localStorage.getItem("nexalign_oauth_role") || "student";
        await googleCallback(sessionId, role);
        localStorage.removeItem("nexalign_oauth_role");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("OAuth callback error:", err);
        navigate("/login", { replace: true });
      }
    };

    processCallback();
  }, [location, navigate, googleCallback]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center" data-testid="auth-callback">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-white/60 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
