import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Shield, Loader2, Trash2, MessageSquare, Sparkles } from "lucide-react";
import TextReveal from "../wiz/animations/TextReveal";

interface Message {
  id: string;
  role: "user" | "assistant" | "guardrail";
  content: string;
  timestamp: Date;
}

const MOCK_ANSWERS: Record<string, { type: "answer" | "guardrail"; content: string }> = {
  default: {
    type: "answer",
    content: "Based on the uploaded document, the key findings indicate a 78% year-over-year increase in multi-cloud adoption, with identity-based attacks remaining the primary threat vector at 63% of breaches. The document recommends implementing least-privilege access and agentless scanning for improved visibility.",
  },
};

const GUARDRAIL_QUERIES = ["weather", "recipe", "joke", "stock", "sports", "movie", "music", "game"];

const DocansChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 I'm ready to answer questions about your uploaded document. Ask me anything about its contents!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const isOutOfScope = (query: string) => {
    const lower = query.toLowerCase();
    return GUARDRAIL_QUERIES.some((q) => lower.includes(q)) || (!lower.includes("document") && !lower.includes("finding") && !lower.includes("chapter") && !lower.includes("recommend") && !lower.includes("security") && !lower.includes("cloud") && !lower.includes("attack") && !lower.includes("summary") && !lower.includes("main") && !lower.includes("key") && lower.length < 20);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const outOfScope = isOutOfScope(input);

    setTimeout(() => {
      const response: Message = outOfScope
        ? {
            id: (Date.now() + 1).toString(),
            role: "guardrail",
            content: `⚠️ This question appears to be outside the scope of the uploaded document. I can only answer questions related to the content in your uploaded file. Please ask something about the document's topics, findings, or recommendations.`,
            timestamp: new Date(),
          }
        : {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: MOCK_ANSWERS.default.content,
            timestamp: new Date(),
          };

      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "👋 Chat cleared. Ask me anything about your uploaded document!",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <section id="chat" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle, hsl(217 91% 60%) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }} />

      <div className="wiz-container max-w-3xl relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Step 2
          </motion.div>
          <TextReveal
            text="Ask Your Document"
            className="font-display text-3xl sm:text-4xl font-bold text-foreground"
          />
          <motion.p
            className="mt-3 text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            RAG-powered Q&A with guardrails for out-of-scope questions
          </motion.p>
        </motion.div>

        <motion.div
          className="rounded-3xl border border-border bg-card overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-gradient-to-r from-card to-secondary/30">
            <div className="flex items-center gap-3">
              <motion.div
                className="rounded-xl bg-primary p-2.5"
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bot className="h-4 w-4 text-primary-foreground" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Docans RAG Chat</p>
                  <motion.div
                    className="w-2 h-2 rounded-full bg-accent"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Powered by document context</p>
              </div>
            </div>
            <motion.button
              onClick={clearChat}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Clear chat"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="h-[420px] overflow-y-auto p-6 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <motion.div
                    className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : msg.role === "guardrail"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-accent/10 text-accent border border-accent/20"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : msg.role === "guardrail" ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </motion.div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : msg.role === "guardrail"
                        ? "bg-destructive/5 border border-destructive/15 text-foreground rounded-bl-md"
                        : "bg-secondary/80 text-foreground rounded-bl-md border border-border/50"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="bg-secondary/80 border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <motion.div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/40"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </motion.div>
                  <span className="text-xs text-muted-foreground ml-1">Searching document...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 bg-gradient-to-r from-card to-secondary/20">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a question about your document..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={isTyping}
              />
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="rounded-xl bg-primary px-4 py-3 text-primary-foreground disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-primary/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["What are the key findings?", "Summarize chapter 3", "List all recommendations"].map((q) => (
                <motion.button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Saved chats note */}
        <motion.div
          className="mt-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-5 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Persistent Sessions</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All conversations are saved to Supabase. Continue your Q&A session anytime — even days later.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DocansChat;
