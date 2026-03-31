import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Trash2, MessageSquare, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextReveal from "../wiz/animations/TextReveal";
import { useSessionStore } from "../../lib/sessionStore";

interface Message {
  id: string;
  role: "user" | "assistant" | "guardrail";
  content: string;
  timestamp: Date;
  sources?: string[];
}

export default function DocansChat() {
  const { sessionId, isSummaryReady } = useSessionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/session/${sessionId}/history`);
        const data = await res.json();

        const initialMsg: Message = {
          id: "welcome",
          role: "assistant",
          timestamp: new Date(),
          content:
            data.history.length > 0
              ? "Welcome back! I've loaded your conversation. What else would you like to know?"
              : "I'm ready to answer questions about this document!",
        };

        const recoveredMessages = [initialMsg];

        data.history.forEach((row: any) => {
          recoveredMessages.push({
            id: row.id + "-user",
            role: "user",
            content: row.query,
            timestamp: new Date(row.created_at),
          });
          recoveredMessages.push({
            id: row.id + "-bot",
            role: "assistant",
            content: row.answer,
            timestamp: new Date(row.created_at),
            sources: row.sources || [],
          });
        });

        setMessages(recoveredMessages);
      } catch (error) {
        console.error("Failed to load history");
      }
    };

    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!sessionId || !isSummaryReady) return null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userQuery = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userQuery, timestamp: new Date() },
    ]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, query: userQuery }),
      });
      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: data.answer.includes("not present") ? "guardrail" : "assistant",
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: "err", role: "guardrail", content: "Connection error.", timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.section id="chat" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.5 }} className="relative overflow-hidden bg-secondary/30 py-24">
      <div className="wiz-container relative z-10 max-w-3xl">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent">
            <MessageSquare className="h-3.5 w-3.5" /> Step 2
          </div>
          <TextReveal text="Ask Your Document" className="font-display text-3xl font-bold text-foreground" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-card to-secondary/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 rounded-xl bg-primary p-1.5 text-primary-foreground" />
              <div><p className="text-sm font-semibold">Docans RAG Chat</p></div>
            </div>
            <button onClick={() => setMessages([{ id: "w", role: "assistant", content: "Chat cleared!", timestamp: new Date() }])} className="rounded-xl p-2.5 hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
          </div>

          <div ref={chatRef} className="h-[420px] overflow-y-auto p-6 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${msg.role === "user" ? "bg-primary text-primary-foreground" : "border border-accent/20 bg-accent/10 text-accent"}`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === "user" ? "whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border/50 bg-secondary/80 text-foreground"}`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {msg.role === "user" ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                    </div>
                    {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2.5">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sources:</span>
                        {msg.sources.map((src, idx) => (
                          <span key={`${msg.id}-${src}-${idx}`} className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            Pg. {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <div className="ml-12 animate-pulse text-xs text-muted-foreground">Searching document...</div>}
          </div>

          <div className="border-t border-border bg-gradient-to-r from-card to-secondary/20 p-4">
            <div className="flex gap-3">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask a question..." className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30" disabled={isTyping} />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-all hover:shadow-lg disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
