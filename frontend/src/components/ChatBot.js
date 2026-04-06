import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ChatBot() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm NexBot, your Nexalign assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEnd = useRef(null);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/chatbot`, {
        message: userMsg, session_id: sessionId,
      }, { withCredentials: true, headers });
      setMessages(prev => [...prev, { role: "bot", text: data.response }]);
      if (data.session_id) setSessionId(data.session_id);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, I'm having trouble right now. Try again or contact support@nexalign.com." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!open && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-shadow"
            data-testid="chatbot-toggle">
            <MessageCircle size={22} className="text-black" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-[360px] max-h-[500px] glass-heavy rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            data-testid="chatbot-window">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                  <Bot size={16} className="text-black" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">NexBot</p>
                  <p className="text-emerald-400 text-xs">Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white" data-testid="chatbot-close"><X size={18} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]" data-testid="chatbot-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/20"
                      : "bg-white/5 text-white/80 border border-white/5"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 px-3 py-2 rounded-xl text-sm text-white/40 border border-white/5">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                className="glass-input flex-1 px-3 py-2 rounded-lg text-sm" placeholder="Ask me anything..."
                data-testid="chatbot-input" />
              <button type="submit" disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-lg bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400 transition-colors disabled:opacity-50"
                data-testid="chatbot-send">
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
