import { useState } from "react";
import { Brain, Eye, ShieldAlert, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TextReveal from "./animations/TextReveal";
import SkeletonLoader from "./animations/SkeletonLoader";

const tabs = [
  {
    id: "visibility",
    label: "Visibility",
    icon: Eye,
    title: "Full AI Inventory & Discovery",
    description: "Automatically discover all AI services, models, training data, and pipelines across your cloud environments. Get complete visibility into shadow AI usage.",
  },
  {
    id: "risk",
    label: "AI Native Risk",
    icon: ShieldAlert,
    title: "AI-Specific Risk Assessment",
    description: "Identify risks unique to AI workloads including model poisoning, training data leakage, prompt injection vulnerabilities, and insecure model deployment.",
  },
  {
    id: "posture",
    label: "AI Posture",
    icon: Brain,
    title: "AI Security Posture Management",
    description: "Ensure AI services follow security best practices with continuous posture assessment, compliance monitoring, and automated remediation guidance.",
  },
  {
    id: "runtime",
    label: "Runtime & Response",
    icon: Activity,
    title: "Real-time AI Threat Detection",
    description: "Monitor AI workloads in real-time to detect anomalous behavior, data exfiltration attempts, and active attacks on your AI infrastructure.",
  },
];

const AISection = () => {
  const [active, setActive] = useState("visibility");
  const [loading, setLoading] = useState(false);
  const activeTab = tabs.find((t) => t.id === active)!;

  const handleTabChange = (id: string) => {
    setLoading(true);
    setActive(id);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <section className="py-20 bg-wiz-light">
      <div className="wiz-container">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">AI Security</p>
          <TextReveal
            text="Wiz secures the AI frontier"
            className="mt-3 font-display text-3xl sm:text-4xl font-bold text-foreground"
          />
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                active === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-foreground hover:border-primary/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-10 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-display text-2xl font-bold text-foreground">{activeTab.title}</h3>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">{activeTab.description}</p>
            </motion.div>
          </AnimatePresence>
          <div className="rounded-2xl border border-border bg-card p-8 flex items-center justify-center min-h-[240px]">
            {loading ? (
              <div className="w-full space-y-4">
                <SkeletonLoader className="h-8 w-3/4" />
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-5/6" />
                <SkeletonLoader className="h-24 w-full" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <activeTab.icon className="h-16 w-16 text-primary/20 mx-auto" />
                  <p className="mt-3 text-sm text-muted-foreground">{activeTab.label} visualization</p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
