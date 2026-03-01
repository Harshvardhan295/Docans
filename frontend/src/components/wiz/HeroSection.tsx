import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import MagneticButton from "./animations/MagneticButton";
import TextReveal from "./animations/TextReveal";
import MeshGradient from "./animations/MeshGradient";

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-background pt-16 pb-20 lg:pt-24 lg:pb-32">
      <MeshGradient />
      <motion.div className="wiz-container relative z-10" style={{ y, opacity, scale }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <TextReveal
              text="Protect Everything You Build and Run in the Cloud"
              as="h1"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground"
            />
            <motion.p
              className="mt-6 text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              The Wiz Cloud Security Platform identifies the most critical risks and infiltration vectors with complete coverage across the full cloud stack. Trusted by 50%+ of Fortune 100 companies.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <input
                type="email"
                placeholder="Business email"
                className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <MagneticButton
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
                strength={0.4}
              >
                Get a demo
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </motion.div>
          </div>

          {/* Cloud illustration with parallax */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10"
                animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-8 rounded-full bg-gradient-to-tr from-primary/15 to-accent/5 border border-primary/10"
                animate={{ scale: [1, 1.03, 1], rotate: [0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <motion.div
                className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/15"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
              <div className="absolute inset-24 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-primary">☁️</div>
                  <p className="text-xs font-medium text-muted-foreground mt-2">Cloud Security</p>
                </div>
              </div>
              {[
                { top: '10%', left: '20%', label: 'AWS', delay: 0.2 },
                { top: '15%', right: '15%', label: 'Azure', delay: 0.4 },
                { bottom: '20%', left: '10%', label: 'GCP', delay: 0.6 },
                { bottom: '15%', right: '20%', label: 'K8s', delay: 0.8 },
              ].map((node, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-lg bg-card/80 backdrop-blur border border-border shadow-sm px-3 py-1.5 text-xs font-medium text-foreground"
                  style={{ top: node.top, left: node.left, right: node.right, bottom: node.bottom }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + node.delay, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                >
                  {node.label}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
