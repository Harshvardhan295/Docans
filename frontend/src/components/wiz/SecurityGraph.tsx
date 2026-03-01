import { Network } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import TextReveal from "./animations/TextReveal";
import GlassCard from "./animations/GlassCard";

const SecurityGraph = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const imgOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="wiz-container">
        <div className="text-center max-w-3xl mx-auto">
          <TextReveal
            text="Block your most critical attack paths"
            className="font-display text-3xl sm:text-4xl font-bold text-foreground"
          />
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            The Wiz Security Graph contextualizes interconnected risks to cut through noise and surface toxic combinations that represent real attack paths.
          </motion.p>
        </div>

        <motion.div
          className="mt-12 rounded-2xl border border-border bg-secondary/30 overflow-hidden"
          style={{ scale: imgScale, opacity: imgOpacity }}
        >
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
            <div className="text-center">
              <Network className="h-20 w-20 text-primary/20 mx-auto" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">Security Graph Visualization</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Interactive product demo</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-10">
          <GlassCard className="p-6 text-center" depth={2}>
            <p className="text-lg font-semibold text-foreground">
              "When Wiz says it's critical — it actually is."
            </p>
            <p className="mt-2 text-sm text-muted-foreground">— CISO, Fortune 500 Company</p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default SecurityGraph;
