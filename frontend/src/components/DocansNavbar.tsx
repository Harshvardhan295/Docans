import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, FileText, FileSpreadsheet, ChevronRight } from "lucide-react";
import MagneticButton from "./wiz/animations/MagneticButton";
import { useSessionStore, setActiveSession } from "../lib/sessionStore";
import { apiUrl } from "../lib/api";
const DocansNavbar = () => {
  const { sessionId } = useSessionStore();
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(apiUrl("/sessions/"));
      const data = await res.json();
      setHistoryList(data.sessions);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  const toggleHistory = () => {
    if (!showHistory) fetchHistory();
    setShowHistory(!showHistory);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="wiz-container flex h-16 items-center justify-between">
          
          {/* Logo Section */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center">
              <img src="/Logo.png" alt="Docans Logo" className="h-8 w-8 object-contain" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Docans</span>
          </a>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            {/* Uploads (History) Button */}
            <motion.button
              onClick={toggleHistory}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium text-foreground shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <History className="h-4 w-4 text-primary" />
              Upload History
            </motion.button>

            {/* Upload Document CTA */}
            <MagneticButton
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
              onClick={() => scrollTo("upload")}
            >
              Upload Document
            </MagneticButton>
          </div>
          
        </div>
      </header>

      {/* HISTORY SLIDE-OVER PANEL */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm z-40" onClick={() => setShowHistory(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-16 bottom-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Workspace History</h2>
                  <p className="text-sm text-muted-foreground">Pick up where you left off</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 rounded-full hover:bg-secondary transition-colors"><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {historyList.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">No previous uploads found.</div>
                ) : (
                  historyList.map((item) => (
                    <motion.button key={item.session_id} onClick={() => { setActiveSession(item.session_id); setShowHistory(false); }} className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${sessionId === item.session_id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-secondary/50"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${item.file_name.endsWith(".pdf") ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                          {item.file_name.endsWith(".pdf") ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-foreground truncate">{item.file_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DocansNavbar;




