import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BentoCard from "./animations/BentoCard";

const posts = [
  {
    category: "Research",
    title: "New Attack Vector Discovered in Cloud Container Orchestration",
    author: "Wiz Research Team",
    date: "Feb 28, 2026",
  },
  {
    category: "Best Practices",
    title: "The Complete Guide to Cloud Security Posture Management in 2026",
    author: "Security Engineering",
    date: "Feb 25, 2026",
  },
  {
    category: "Product",
    title: "Introducing AI-SPM: Securing Your AI Pipeline End-to-End",
    author: "Product Team",
    date: "Feb 20, 2026",
  },
];

const BlogSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="wiz-container">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Latest Research and Publications
          </h2>
          <a href="#" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <BentoCard className="group rounded-2xl border border-border bg-card overflow-hidden h-full">
                <div className="aspect-[16/9] bg-gradient-to-br from-secondary to-primary/5 flex items-center justify-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </BentoCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
