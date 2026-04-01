import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Lottie from "lottie-react";
import MagneticButton from "../wiz/animations/MagneticButton";
import TextReveal from "../wiz/animations/TextReveal";
import MeshGradient from "../wiz/animations/MeshGradient";


const DocansHero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/Search for documents.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(console.error);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative overflow-hidden bg-background pt-20 pb-24 lg:pt-28 lg:pb-36 border-b border-border/40">
      <MeshGradient />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 blur-sm z-0"
          style={{ width: 6 + i * 4, height: 6 + i * 4, left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}

      <motion.div className="wiz-container relative z-10" style={{ y, opacity }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <TextReveal
              text="Upload. Summarize. Ask Anything."
              as="h1"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground"
            />

            <motion.p
              className="mt-6 text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
            >
              Docans NLP-based document summarizer and query system to instantly summarize your PDF and PPTX files. Chat directly with your documents, extract meaningful insights, and get precise, page-referenced answers in seconds.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
            >
              <MagneticButton
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all"
                strength={0.4}
                onClick={() => scrollTo("upload")}
              >
                Start Analyzing
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </motion.div>
          </div>

          {/* Lottie Animation */}
          <motion.div
            className="flex items-center justify-center -mt-18 lg:-mt-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <div className="w-full max-w-md lg:max-w-lg">
              {animationData && (
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  style={{ width: "100%", height: "auto" }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default DocansHero;

