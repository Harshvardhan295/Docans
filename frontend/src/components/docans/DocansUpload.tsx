// frontend/src/components/docans/DocansUpload.tsx
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2, Brain, ChevronDown, Sparkles, History, Plus, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import MagneticButton from "../wiz/animations/MagneticButton";
import SkeletonLoader from "../wiz/animations/SkeletonLoader";
import TextReveal from "../wiz/animations/TextReveal";
import { useSessionStore, setActiveSession, setSummaryReady } from "../../lib/sessionStore";

interface UploadedFile {
  name: string;
  size: number;
  type: "pdf" | "pptx";
  pages: number;
  chunks: number;
}

type UploadState = "idle" | "uploading" | "processing" | "summarizing" | "done" | "error";

export default function DocansUpload() {
  const { sessionId } = useSessionStore();
  const [dragActive, setDragActive] = useState(false);
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUploading = useRef(false);

  // 1. Recover existing summary when Session ID changes
  useEffect(() => {
    if (!sessionId) {
      reset();
      return;
    }

    // Skip fetching if we're in the middle of an upload (the session was just created)
    if (isUploading.current) return;
    
    const fetchExistingSession = async () => {
      try {
        const res = await fetch(`http://localhost:8000/session/${sessionId}/summary`);
        const data = await res.json();
        if (data.summary) {
          setFile({ name: data.file_name, size: 0, type: data.file_name.endsWith(".pdf") ? "pdf" : "pptx", pages: 0, chunks: 0 });
          setSummary(data.summary);
          setState("done");
          setSummaryReady(true);
        } else {
          // Session exists in localStorage but not on backend (stale) — clear it
          setActiveSession(null);
        }
      } catch (err) {
        console.error("Failed to load summary");
        // If backend is unreachable, also clear stale session so dropzone is usable
        setActiveSession(null);
      }
    };
    fetchExistingSession();
  }, [sessionId]);

  // 2. Fetch History List
  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://localhost:8000/sessions/`);
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

  const uploadToBackend = useCallback(async (f: File) => {
    const isPdf = f.name.endsWith(".pdf");
    const isPptx = f.name.endsWith(".pptx") || f.name.endsWith(".ppt");

    if (!isPdf && !isPptx) {
      setState("error");
      return;
    }

    // Mark upload as in-progress so the session-recovery useEffect doesn't interfere
    isUploading.current = true;

    // Generate a BRAND NEW session ID for this upload
    const newSessionId = Math.random().toString(36).substring(2, 15);
    setActiveSession(newSessionId);
    setSummaryReady(false);

    setFile({ name: f.name, size: f.size, type: isPdf ? "pdf" : "pptx", pages: 0, chunks: 0 });
    setState("uploading");
    setProgress(0);

    const fakeProgress = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + Math.random() * 10));
    }, 500);

    const formData = new FormData();
    formData.append("file", f);
    formData.append("session_id", newSessionId); // Send new ID to backend

    try {
      setTimeout(() => setState("processing"), 1500);
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend processing failed");

      const data = await response.json();
      clearInterval(fakeProgress);
      setProgress(100);
      
      setFile(prev => prev ? { ...prev, chunks: data.metadata.total_chunks, pages: Math.floor(data.metadata.total_characters / 1500) } : null);
      
      setState("summarizing");
      setSummary("");
      
      const realSummary = data.summary;
      let idx = 0;
      const streamInterval = setInterval(() => {
        idx += 3;
        if (idx >= realSummary.length) {
          setSummary(realSummary);
          clearInterval(streamInterval);
          setState("done");
          isUploading.current = false;
          setSummaryReady(true);
        } else {
          setSummary(realSummary.slice(0, idx));
        }
      }, 10);

    } catch (error) {
      clearInterval(fakeProgress);
      setState("error");
      isUploading.current = false;
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) uploadToBackend(f);
  };

  const reset = () => {
    setActiveSession(null);
    setSummaryReady(false);
    setState("idle");
    setFile(null);
    setProgress(0);
    setSummary("");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section id="upload" className="py-24 bg-background relative overflow-hidden">
      <div className="wiz-container max-w-4xl relative z-10">
        
        {/* Header with History Button */}
        <div className="flex justify-between items-start mb-14">
          <div className="flex-1 text-center pl-24">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Upload className="h-3.5 w-3.5" />
              Step 1
            </motion.div>
            <TextReveal text={sessionId ? "Document Analysis" : "Upload Your Document"} className="font-display text-3xl sm:text-4xl font-bold text-foreground" />
          </div>

          <motion.button
            onClick={toggleHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium text-foreground shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <History className="h-4 w-4 text-primary" />
            Uploads
          </motion.button>
        </div>

        {/* The Main Content Area */}
        <AnimatePresence mode="wait">
          {!sessionId && (state === "idle" || state === "error") ? (
             <motion.div
             key="dropzone"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
           >
             <motion.div
               className={`relative rounded-3xl border-2 border-dashed p-16 text-center transition-all cursor-pointer group ${
                 dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/40 hover:bg-secondary/20"
               }`}
               onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
               onDragLeave={() => setDragActive(false)}
               onDrop={handleDrop}
               onClick={() => inputRef.current?.click()}
             >
               <input ref={inputRef} type="file" accept=".pdf,.pptx,.ppt" className="hidden" onChange={(e) => e.target.files?.[0] && uploadToBackend(e.target.files[0])} />
               <motion.div className="relative mx-auto w-20 h-20" animate={dragActive ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}>
                 <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
                 <div className="relative w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                   <Upload className={`h-8 w-8 ${dragActive ? "text-primary" : "text-muted-foreground/50"}`} />
                 </div>
               </motion.div>
               <p className="mt-6 text-lg font-semibold text-foreground">Drag & drop your file here</p>
               <p className="mt-1 text-sm text-muted-foreground">or click to browse your files</p>
             </motion.div>
           </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* File info card */}
              <motion.div className="rounded-2xl border border-border bg-card p-6 shadow-sm" layout>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${file?.type === "pdf" ? "bg-destructive/10" : "bg-primary/10"}`}>
                      {file?.type === "pdf" ? <FileText className="h-6 w-6 text-destructive" /> : <FileSpreadsheet className="h-6 w-6 text-primary" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{file?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {state === "done" ? "Analysis Complete" : "Processing..."}
                      </p>
                    </div>
                  </div>
                  {state === "done" && (
                    <motion.button onClick={reset} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold" whileHover={{ scale: 1.05 }}>
                      <Plus className="h-3.5 w-3.5" /> New File
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Summary section */}
              {(state === "summarizing" || state === "done") && (
                <motion.div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <button className="w-full flex items-center justify-between p-6 pb-0 text-left" onClick={() => setSummaryExpanded(!summaryExpanded)}>
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-1.5"><Brain className="h-4 w-4 text-primary" /></div>
                      <h3 className="font-display text-lg font-bold text-foreground">AI Summary</h3>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${summaryExpanded ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {summaryExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-6 pt-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                            <ReactMarkdown>{summary + (state === "summarizing" ? " █" : "")}</ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* CTA to chat */}
              {state === "done" && (
                <motion.div className="text-center mt-8">
                  <MagneticButton className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:shadow-lg transition-all" onClick={() => document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" })}>
                    Continue to Chat →
                  </MagneticButton>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HISTORY SLIDE-OVER PANEL */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setShowHistory(false)} />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col">
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
      </div>
    </section>
  );
}
