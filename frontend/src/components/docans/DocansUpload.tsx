import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2, Brain, ChevronDown, Sparkles } from "lucide-react";
import MagneticButton from "../wiz/animations/MagneticButton";
import SkeletonLoader from "../wiz/animations/SkeletonLoader";
import TextReveal from "../wiz/animations/TextReveal";

interface UploadedFile {
  name: string;
  size: number;
  type: "pdf" | "pptx";
  pages: number;
  chunks: number;
}

type UploadState = "idle" | "uploading" | "processing" | "summarizing" | "done" | "error";

const MOCK_SUMMARY = `## Key Findings

This document presents a comprehensive analysis of cloud infrastructure security across enterprise environments. The main points include:

1. **Multi-cloud adoption** has increased by 78% year-over-year, creating new attack surface challenges for security teams.

2. **Identity-based attacks** remain the #1 threat vector, with 63% of breaches originating from compromised credentials or misconfigured IAM policies.

3. **Automated remediation** reduces mean-time-to-response by 94%, compared to manual incident handling workflows.

4. **Container security** maturity varies significantly — only 23% of organizations have runtime protection for containerized workloads.

### Recommendations
- Implement least-privilege access across all cloud accounts
- Deploy agentless scanning for full-stack visibility
- Establish automated guardrails for IaC pipelines
- Conduct quarterly red team exercises targeting cloud infrastructure`;

const DocansUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadToBackend = useCallback(async (f: File) => {
    const isPdf = f.name.endsWith(".pdf");
    const isPptx = f.name.endsWith(".pptx") || f.name.endsWith(".ppt");

    if (!isPdf && !isPptx) {
      setState("error");
      return;
    }

    // Initialize UI states
    setFile({ name: f.name, size: f.size, type: isPdf ? "pdf" : "pptx", pages: 0, chunks: 0 });
    setState("uploading");
    setProgress(0);

    // Fake a progressive loading bar while waiting for the heavy Python backend
    const fakeProgress = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + Math.random() * 10));
    }, 500);

    // 1. Prepare FormData
    const formData = new FormData();
    formData.append("file", f);

    try {
      setTimeout(() => setState("processing"), 1500);

      // 2. Call the FastAPI Backend
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend processing failed");

      const data = await response.json();
      
      clearInterval(fakeProgress);
      setProgress(100);
      
      // Update with real metadata from the Python processor
      setFile(prev => prev ? { 
        ...prev, 
        chunks: data.metadata.total_chunks,
        pages: Math.floor(data.metadata.total_characters / 1500) // Rough estimation
      } : null);
      
      // 3. Display the AI Summary
      setState("summarizing");
      setSummary("");
      
      // Typewriter effect for the real summary
      const realSummary = data.summary;
      let idx = 0;
      const streamInterval = setInterval(() => {
        idx += 3;
        if (idx >= realSummary.length) {
          setSummary(realSummary);
          clearInterval(streamInterval);
          setState("done");
        } else {
          setSummary(realSummary.slice(0, idx));
        }
      }, 10);

    } catch (error) {
      console.error("Upload error:", error);
      clearInterval(fakeProgress);
      setState("error");
    }
  }, []);

  // Update handleDrop and handleFileSelect to use the new function
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) uploadToBackend(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadToBackend(f);
  };


  const reset = () => {
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
    <section id="upload" className="py-24 bg-background relative">
      <div className="wiz-container max-w-4xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Upload className="h-3.5 w-3.5" />
            Step 1
          </motion.div>
          <TextReveal
            text="Upload Your Document"
            className="font-display text-3xl sm:text-4xl font-bold text-foreground"
          />
          <motion.p
            className="mt-3 text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Supported formats: PDF, PPTX — up to 200MB
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {state === "idle" || state === "error" ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.div
                className={`relative rounded-3xl border-2 border-dashed p-16 text-center transition-all cursor-pointer group ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/40 hover:bg-secondary/20"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                whileHover={{ borderColor: "hsl(217 91% 60% / 0.4)" }}
              >
                <input ref={inputRef} type="file" accept=".pdf,.pptx,.ppt" className="hidden" onChange={handleFileSelect} />

                {/* Animated upload icon */}
                <motion.div
                  animate={dragActive ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative mx-auto w-20 h-20"
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className={`h-8 w-8 ${dragActive ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary/70"} transition-colors`} />
                  </div>
                </motion.div>

                <p className="mt-6 text-lg font-semibold text-foreground">
                  {dragActive ? "Drop your file here" : "Drag & drop your file here"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse your files</p>

                <div className="mt-6 flex justify-center gap-3">
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-4 py-1.5 text-xs font-medium text-destructive"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FileText className="h-3 w-3" /> PDF
                  </motion.span>
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FileSpreadsheet className="h-3 w-3" /> PPTX
                  </motion.span>
                </div>

                {state === "error" && (
                  <motion.div
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-5 py-2.5 text-sm text-destructive"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Unsupported file type. Please upload PDF or PPTX.
                  </motion.div>
                )}
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
              <motion.div
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                layout
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className={`rounded-xl p-3 ${file?.type === "pdf" ? "bg-destructive/10" : "bg-primary/10"}`}
                      animate={state === "processing" ? { rotate: [0, 5, -5, 0] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      {file?.type === "pdf" ? (
                        <FileText className="h-6 w-6 text-destructive" />
                      ) : (
                        <FileSpreadsheet className="h-6 w-6 text-primary" />
                      )}
                    </motion.div>
                    <div>
                      <p className="font-semibold text-foreground">{file?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file?.size || 0)} · ~{file?.pages} pages
                        {(file?.chunks || 0) > 1 && ` · ${file?.chunks} chunks`}
                      </p>
                    </div>
                  </div>
                  {state === "done" && (
                    <motion.button
                      onClick={reset}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  )}
                </div>

                {/* Progress bar */}
                {(state === "uploading" || state === "processing") && (
                  <div className="mt-5">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-medium">{state === "uploading" ? "Uploading..." : "Processing chunks..."}</span>
                      <span>{state === "uploading" ? `${Math.min(Math.round(progress), 100)}%` : ""}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      {state === "uploading" ? (
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      ) : (
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-accent/60"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          style={{ width: "50%" }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Status badges */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Upload", "Parse", "Chunk", "Summarize"].map((step, i) => {
                    const stepStates: Record<UploadState, number> = {
                      idle: -1, uploading: 0, processing: 1, summarizing: 3, done: 4, error: -1,
                    };
                    const current = stepStates[state];
                    const isDone = i < current;
                    const isActive = i === current || (i === 2 && state === "processing");

                    return (
                      <motion.span
                        key={step}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          isDone
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted text-muted-foreground border border-transparent"
                        }`}
                        animate={isDone ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {isDone ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : isActive ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : null}
                        {step}
                      </motion.span>
                    );
                  })}
                </div>
              </motion.div>

              {/* Summary section */}
              {(state === "summarizing" || state === "done") && (
                <motion.div
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    className="w-full flex items-center justify-between p-6 pb-0 text-left"
                    onClick={() => setSummaryExpanded(!summaryExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-1.5">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">AI Summary</h3>
                      {state === "summarizing" && (
                        <motion.div className="flex items-center gap-1 ml-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                          <span className="text-xs text-primary font-medium">Generating...</span>
                        </motion.div>
                      )}
                    </div>
                    <motion.div animate={{ rotate: summaryExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {summaryExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-4">
                          {state === "summarizing" && !summary ? (
                            <div className="space-y-3">
                              <SkeletonLoader className="h-5 w-1/3" />
                              <SkeletonLoader className="h-4 w-full" />
                              <SkeletonLoader className="h-4 w-5/6" />
                              <SkeletonLoader className="h-4 w-4/6" />
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none text-foreground/90">
                              {summary.split("\n").map((line, i) => {
                                if (line.startsWith("## ")) return <h4 key={i} className="font-display text-base font-bold text-foreground mt-4 mb-2">{line.slice(3)}</h4>;
                                if (line.startsWith("### ")) return <h5 key={i} className="font-display text-sm font-bold text-foreground mt-3 mb-1">{line.slice(4)}</h5>;
                                if (line.startsWith("- ")) return <li key={i} className="text-sm text-muted-foreground ml-4">{line.slice(2)}</li>;
                                if (line.match(/^\d+\./)) {
                                  const content = line.replace(/^\d+\.\s*/, "");
                                  const parts = content.split(/\*\*(.*?)\*\*/);
                                  return (
                                    <p key={i} className="text-sm text-muted-foreground mt-2">
                                      {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-foreground font-semibold">{part}</strong> : part)}
                                    </p>
                                  );
                                }
                                if (line.trim() === "") return <div key={i} className="h-2" />;
                                return <p key={i} className="text-sm text-muted-foreground">{line}</p>;
                              })}
                              {state === "summarizing" && <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* CTA to chat */}
              {state === "done" && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <MagneticButton
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all"
                    onClick={() => document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Ask Questions About This Document →
                  </MagneticButton>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DocansUpload;
