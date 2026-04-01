import { Upload, Brain, Layers, MessageSquare, Shield, Database, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BentoCard from "../wiz/animations/BentoCard";
import TextReveal from "../wiz/animations/TextReveal";

const features = [
  {
    icon: Upload,
    title: "Smart File Upload",
    description: "Drag & drop PDF or PPTX files. Large documents (100+ pages) are automatically chunked for optimal processing.",
    color: "text-primary",
    bg: "bg-primary/10",
    gradient: "from-primary/5 to-transparent",
  },
  {
    icon: Brain,
    title: "AI Summarization",
    description: "BERT-based NLP models generate concise, accurate summaries of your documents — chunk by chunk for large files.",
    color: "text-accent",
    bg: "bg-accent/10",
    gradient: "from-accent/5 to-transparent",
  },
  {
    icon: Layers,
    title: "RAG Pipeline",
    description: "Documents are crawled, chunked, and embedded into ChromaDB for semantic retrieval-augmented generation.",
    color: "text-primary",
    bg: "bg-primary/10",
    gradient: "from-primary/5 to-transparent",
  },
  {
    icon: MessageSquare,
    title: "Contextual Q&A",
    description: "Ask any question about your document. The system retrieves relevant chunks and generates precise answers.",
    color: "text-accent",
    bg: "bg-accent/10",
    gradient: "from-accent/5 to-transparent",
  },
  {
    icon: Shield,
    title: "Guardrails",
    description: "Out-of-scope questions are gracefully handled. If the answer isn't in the document, you'll know immediately.",
    color: "text-destructive",
    bg: "bg-destructive/10",
    gradient: "from-destructive/5 to-transparent",
  },
  {
    icon: Database,
    title: "Persistent Chat",
    description: "Conversations are saved to Supabase. Pick up right where you left off, even days later.",
    color: "text-primary",
    bg: "bg-primary/10",
    gradient: "from-primary/5 to-transparent",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

const DocansFeatures = () => {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle, hsl(217 91% 60%) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }} />

      <div className="wiz-container relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.p
            className="text-sm font-semibold uppercase tracking-wider text-primary"
            initial={{ opacity: 0, letterSpacing: "0.05em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.15em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Features
          </motion.p>
          <TextReveal
            text="Everything You Need for Document Intelligence"
            className="mt-3 font-display text-3xl sm:text-4xl font-bold text-foreground"
          />
          <motion.p
            className="mt-4 text-muted-foreground max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            From upload to insight in seconds. Our intelligent pipeline handles everything.
          </motion.p>
        </div>

        <motion.div
          className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <BentoCard className="group rounded-2xl border border-border bg-card p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <motion.div
                    className={`inline-flex rounded-xl ${feature.bg} p-3`}
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </motion.div>
                  <h3 className="mt-5 font-display text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  <motion.div
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  >
                    Learn more <ArrowRight className="h-3 w-3" />
                  </motion.div>
                </div>
              </BentoCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DocansFeatures;
