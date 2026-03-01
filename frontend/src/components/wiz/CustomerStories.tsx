import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BentoCard from "./animations/BentoCard";
import HorizontalScroll from "./animations/HorizontalScroll";

const stories = [
  {
    category: "Speed",
    company: "Global Bank",
    quote: "Reduced cloud risk assessment from 6 months to 24 hours",
    color: "bg-primary/10 text-primary",
  },
  {
    category: "Visibility",
    company: "Healthcare Leader",
    quote: "Achieved 100% cloud visibility across 15,000+ workloads",
    color: "bg-accent/10 text-accent",
  },
  {
    category: "Simplicity",
    company: "Tech Unicorn",
    quote: "Replaced 5 legacy tools with a single unified platform",
    color: "bg-destructive/10 text-destructive",
  },
  {
    category: "Scale",
    company: "Fortune 50 Retailer",
    quote: "Secured 50,000+ cloud assets in under one week",
    color: "bg-primary/10 text-primary",
  },
];

const CustomerStories = () => {
  return (
    <section className="py-20 bg-secondary/30 overflow-hidden">
      <div className="wiz-container">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground text-center">
          Customer Stories
        </h2>
      </div>
      <div className="mt-12 px-4">
        <HorizontalScroll>
          {stories.map((story, i) => (
            <motion.div
              key={story.category}
              className="min-w-[320px] max-w-[360px] flex-shrink-0"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <BentoCard className="group rounded-2xl border border-border bg-card p-8 h-full">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${story.color}`}>
                  {story.category}
                </span>
                <p className="mt-4 text-sm font-medium text-muted-foreground">{story.company}</p>
                <p className="mt-2 text-lg font-semibold text-foreground leading-snug">"{story.quote}"</p>
                <a href="#" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
                  Read story <ArrowRight className="h-4 w-4" />
                </a>
              </BentoCard>
            </motion.div>
          ))}
        </HorizontalScroll>
      </div>
    </section>
  );
};

export default CustomerStories;
