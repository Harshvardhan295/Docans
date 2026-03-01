import { motion } from "framer-motion";
import { Upload, Cpu, Layers, MessageSquare, ArrowRight } from "lucide-react";
import TextReveal from "../wiz/animations/TextReveal";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Document",
    description: "Drag & drop a PDF or PPTX file. Files over 100 pages are automatically split into manageable chunks.",
    color: "bg-primary",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Summarization",
    description: "Each chunk is processed through fine-tuned BERT models to produce a comprehensive summary of the entire document.",
    color: "bg-accent",
  },
  {
    icon: Layers,
    step: "03",
    title: "RAG Indexing",
    description: "The document is crawled, chunked, embedded, and stored in ChromaDB asynchronously — ready for semantic search.",
    color: "bg-primary",
  },
  {
    icon: MessageSquare,
    step: "04",
    title: "Ask Questions",
    description: "Query the document in natural language. Answers are grounded in context with guardrails for out-of-scope questions.",
    color: "bg-accent",
  },
];

const DocansHowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="wiz-container">
        <div className="text-center max-w-2xl mx-auto">
          <motion.p
            className="text-sm font-semibold uppercase tracking-wider text-primary"
            initial={{ opacity: 0, letterSpacing: "0.05em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.15em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            How It Works
          </motion.p>
          <TextReveal
            text="From Upload to Answers in Seconds"
            className="mt-3 font-display text-3xl sm:text-4xl font-bold text-foreground"
          />
        </div>

        <div className="mt-20 relative">
          {/* Animated connecting line */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] z-0">
            <motion.div
              className="h-px bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.2, type: "spring", stiffness: 150 }}
              >
                <motion.div
                  className={`mx-auto w-20 h-20 rounded-2xl ${item.color} shadow-lg flex items-center justify-center mb-6 relative`}
                  whileHover={{ scale: 1.1, rotate: 5, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className="h-8 w-8 text-primary-foreground" />
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                    <span className="text-[10px] font-bold text-foreground">{i + 1}</span>
                  </div>
                </motion.div>

                <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">{item.description}</p>

                {i < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-10"
                    style={{ left: `${(i + 1) * 25}%`, transform: "translateX(-50%)" }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.4 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                  >
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocansHowItWorks;
