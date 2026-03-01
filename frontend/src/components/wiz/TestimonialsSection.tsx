import { motion } from "framer-motion";
import GlassCard from "./animations/GlassCard";

const testimonials = [
  {
    quote: "Wiz enabled us to see and understand our cloud risk in minutes instead of months. It changed the game for our security team.",
    name: "Sarah Chen",
    title: "CISO",
    company: "Global Financial Services",
  },
  {
    quote: "We went from thousands of alerts to focusing on what actually matters. Wiz identifies the real risks, not just noise.",
    name: "Marcus Johnson",
    title: "VP of Security",
    company: "Fortune 500 Tech Company",
  },
  {
    quote: "The deployment was effortless. Within an hour we had full visibility across our multi-cloud environment.",
    name: "Elena Rodriguez",
    title: "Head of Cloud Security",
    company: "Enterprise Healthcare",
  },
  {
    quote: "Wiz's Security Graph is a game-changer. It connects the dots between risks that we would never have found manually.",
    name: "David Park",
    title: "Cloud Security Architect",
    company: "SaaS Platform",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="wiz-container">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground text-center">
          See what our users think about Wiz
        </h2>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-8 h-full" depth={1.5}>
                <p className="text-base text-foreground leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-4">
                  <motion.div
                    className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {t.name[0]}
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}, {t.company}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
