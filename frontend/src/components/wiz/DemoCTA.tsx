import { ArrowRight } from "lucide-react";
import MagneticButton from "./animations/MagneticButton";
import TextReveal from "./animations/TextReveal";
import { motion } from "framer-motion";

const DemoCTA = () => {
  return (
    <section className="py-20 bg-foreground text-background">
      <div className="wiz-container text-center">
        <TextReveal
          text="Ready to protect your cloud?"
          className="font-display text-3xl sm:text-4xl font-bold"
        />
        <motion.p
          className="mt-4 text-lg opacity-70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.7 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          Schedule a call with a Wiz expert to see how we can help
        </motion.p>

        <div className="mt-8 flex justify-center -space-x-3">
          {["A", "B", "C", "D", "E"].map((letter, i) => (
            <motion.div
              key={i}
              className="h-12 w-12 rounded-full border-2 border-foreground bg-primary/80 flex items-center justify-center text-sm font-bold text-primary-foreground"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
            >
              {letter}
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-sm opacity-60">Talk to our security experts</p>

        <MagneticButton
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          strength={0.5}
        >
          Get a demo
          <ArrowRight className="h-5 w-5" />
        </MagneticButton>
      </div>
    </section>
  );
};

export default DemoCTA;
