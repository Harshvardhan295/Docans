import { motion } from "framer-motion";
import TextReveal from "./animations/TextReveal";

const solutions = [
  "CSPM", "CIEM", "CWPP", "DSPM", "KSPM",
  "CDR", "Vuln Mgmt", "IaC Scanning", "CNAPP", "ASPM",
  "Container Security", "AI-SPM",
];

const SolutionsGrid = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="wiz-container text-center">
        <TextReveal
          text="Protecting Your Cloud Environments Requires a Unified, Cloud Native Platform"
          className="font-display text-3xl sm:text-4xl font-bold text-foreground max-w-3xl mx-auto"
        />
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {solutions.map((s, i) => (
            <motion.span
              key={s}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.08, y: -2 }}
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsGrid;
