import { ArrowRight, FileText, Brain, MessageSquare, Sparkles, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import MagneticButton from "../wiz/animations/MagneticButton";
import TextReveal from "../wiz/animations/TextReveal";
import MeshGradient from "../wiz/animations/MeshGradient";

const DocansHero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Animated stats
  const stats = [
    { value: "50+", label: "File Formats" },
    { value: "< 3s", label: "Summary Time" },
    { value: "99.2%", label: "Accuracy" },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden bg-background pt-20 pb-24 lg:pt-28 lg:pb-36">
      <MeshGradient />

      {/* Floating decorative particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 blur-sm"
          style={{
            width: 6 + i * 4,
            height: 6 + i * 4,
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div className="wiz-container relative z-10" style={{ y, opacity }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              NLP-Powered Document Intelligence
            </motion.div>

            <TextReveal
              text="Upload. Summarize. Ask Anything."
              as="h1"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground"
            />

            <motion.p
              className="mt-6 text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Docans uses advanced NLP models to summarize your PDF and PPTX files instantly, then lets you ask questions about the content with our RAG-powered chat — complete with guardrails for out-of-scope queries.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <MagneticButton
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all"
                strength={0.4}
                onClick={() => scrollTo("upload")}
              >
                Upload a Document
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-secondary hover:border-primary/30 transition-all"
                strength={0.3}
                onClick={() => scrollTo("how-it-works")}
              >
                See How It Works
              </MagneticButton>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="mt-12 flex gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.15, type: "spring" }}
                >
                  <p className="font-display text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Animated illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-sm" style={{ height: 380 }}>
              {/* Glowing ring behind docs */}
              <motion.div
                className="absolute rounded-full border border-primary/10"
                style={{ width: 300, height: 300, left: "calc(50% - 150px)", top: 30 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {[0, 90, 180, 270].map((deg) => (
                  <motion.div
                    key={deg}
                    className="absolute w-2.5 h-2.5 rounded-full bg-primary/30"
                    style={{
                      left: "50%",
                      top: 0,
                      transform: `rotate(${deg}deg) translateY(-150px)`,
                      transformOrigin: "0 150px",
                    }}
                  />
                ))}
              </motion.div>

              {/* Document stack */}
              {[2, 1, 0].map((i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-2xl border bg-card shadow-lg ${i === 0 ? "border-primary/20 animate-glow-pulse" : "border-border"}`}
                  style={{
                    width: 240,
                    height: 300,
                    left: `calc(50% - 120px + ${i * 14}px)`,
                    top: `${40 + i * 10}px`,
                    zIndex: 3 - i,
                  }}
                  initial={{ opacity: 0, y: 60, rotate: (i - 1) * 5 }}
                  animate={{ opacity: 1 - i * 0.25, y: 0, rotate: (i - 1) * 5 }}
                  transition={{ delay: 0.8 + i * 0.2, type: "spring", stiffness: 150 }}
                >
                  {i === 0 && (
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="rounded-md bg-destructive/10 p-1">
                          <FileText className="h-4 w-4 text-destructive" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">report_2026.pdf</span>
                        <motion.span
                          className="ml-auto text-[9px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 2 }}
                        >
                          ✓ Parsed
                        </motion.span>
                      </div>
                      {[85, 100, 70, 95, 60, 80].map((w, j) => (
                        <motion.div
                          key={j}
                          className="h-2 rounded-full bg-muted mb-2.5"
                          style={{ width: `${w}%` }}
                          initial={{ scaleX: 0, transformOrigin: "left" }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 1.3 + j * 0.08, duration: 0.4, ease: "easeOut" }}
                        />
                      ))}
                      <motion.div
                        className="mt-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/15 p-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Brain className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-semibold text-primary">AI Summary</span>
                          <motion.div
                            className="ml-auto flex gap-0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.6 }}
                          >
                            {[...Array(3)].map((_, k) => (
                              <motion.div
                                key={k}
                                className="w-1 h-1 rounded-full bg-primary"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: k * 0.2 }}
                              />
                            ))}
                          </motion.div>
                        </div>
                        {[75, 90, 60].map((w, j) => (
                          <motion.div
                            key={j}
                            className="h-1.5 rounded-full bg-primary/20 mb-1.5"
                            style={{ width: `${w}%` }}
                            initial={{ scaleX: 0, transformOrigin: "left" }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 2.4 + j * 0.12, duration: 0.3 }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Chat bubble */}
              <motion.div
                className="absolute -right-6 bottom-2 rounded-2xl border border-accent/20 bg-card/95 backdrop-blur shadow-xl p-3.5 z-10 max-w-[190px]"
                initial={{ opacity: 0, scale: 0, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 2.8, type: "spring", stiffness: 200 }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="rounded-full bg-accent/10 p-1">
                    <MessageSquare className="h-2.5 w-2.5 text-accent" />
                  </div>
                  <span className="text-[10px] font-semibold text-accent">RAG Chat</span>
                </div>
                <p className="text-[9px] text-muted-foreground leading-snug">
                  "What are the key findings in chapter 3?"
                </p>
                <motion.div
                  className="mt-2 flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.2 }}
                >
                  <Zap className="h-2.5 w-2.5 text-primary" />
                  <span className="text-[8px] text-primary font-medium">Answering...</span>
                </motion.div>
              </motion.div>

              {/* Floating connector lines */}
              <motion.div
                className="absolute w-px h-8 bg-gradient-to-b from-primary/30 to-transparent"
                style={{ left: "calc(50% + 100px)", top: 30 }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 2.5, duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DocansHero;
