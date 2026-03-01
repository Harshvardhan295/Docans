import { FileText } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = {
  Product: ["Summarization", "RAG Chat", "Guardrails", "File Chunking"],
  Technology: ["BERT Models", "ChromaDB", "Supabase", "NLP Pipeline"],
  Resources: ["Documentation", "API Reference", "Examples", "Blog"],
  Company: ["About", "Contact", "Privacy", "Terms"],
};

const DocansFooter = () => {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="wiz-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <motion.div
              className="flex items-center gap-2.5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="rounded-lg bg-primary p-1.5">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-primary">Docans</span>
            </motion.div>
            <p className="mt-4 text-sm opacity-60 leading-relaxed">
              NLP-powered document summarization and Q&A with RAG.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h4 className="text-sm font-semibold mb-4 opacity-80">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm opacity-50 hover:opacity-100 transition-opacity duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-40">© 2026 Docans. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Security"].map((link) => (
              <a key={link} href="#" className="text-xs opacity-40 hover:opacity-100 transition-opacity">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DocansFooter;
