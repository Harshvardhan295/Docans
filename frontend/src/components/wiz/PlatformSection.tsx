import { Code, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BentoCard from "./animations/BentoCard";
import TextReveal from "./animations/TextReveal";

const pillars = [
  {
    icon: Code,
    title: "Secure Cloud Development",
    description: "Shift security left by scanning infrastructure as code, container images, and code repositories before deployment.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: ShieldCheck,
    title: "Manage Security Posture",
    description: "Get full-stack visibility across cloud configurations, identities, workloads, APIs, and data with a single platform.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Zap,
    title: "Respond to Cloud Threats",
    description: "Detect and respond to active threats in real-time with cloud-native detection and response capabilities.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

const PlatformSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="wiz-container">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Wiz Cloud Security Platform
          </p>
          <TextReveal
            text="One Cloud Operating Model to Run Faster, Safely"
            className="mt-3 font-display text-3xl sm:text-4xl font-bold text-foreground"
          />
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <BentoCard className="group rounded-2xl border border-border bg-card p-8 hover:shadow-xl transition-all h-full">
                <div className={`inline-flex rounded-xl ${pillar.bg} p-3`}>
                  <pillar.icon className={`h-6 w-6 ${pillar.color}`} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{pillar.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                <a
                  href="#"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </a>
              </BentoCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformSection;
