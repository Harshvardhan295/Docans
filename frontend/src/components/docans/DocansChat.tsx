// frontend/src/components/docans/DocansChat.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Shield, Trash2, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextReveal from "../wiz/animations/TextReveal";
import { useSessionStore } from "../../lib/sessionStore";

interface Message {
  id: string;
  role: "user" | "assistant" | "guardrail";
  content: string;
  timestamp: Date;
}

export default function DocansChat() {
  const { sessionId } = useSessionStore(); // 1. Pull state from our new global store
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 2. Fetch history whenever the active Session ID changes
  useEffect(() => {
    if (!sessionId) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/session/${sessionId}/history`);
        const data = await res.json();
        
        const initialMsg: Message = {
          id: "welcome", role: "assistant", timestamp: new Date(),
          content: data.history.length > 0 
            ? "👋 Welcome back! I've loaded your conversation. What else would you like to know?"
            : "👋 I'm ready to answer questions about this document!"
        };

        const recoveredMessages = [initialMsg];

        data.history.forEach((row: any) => {
          recoveredMessages.push({ id: row.id + "-user", role: "user", content: row.query, timestamp: new Date(row.created_at) });
          recoveredMessages.push({ id: row.id + "-bot", role: "assistant", content: row.answer, timestamp: new Date(row.created_at) });
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

  // 3. Goal 1 fulfilled: Hide chat completely if no session is active!
  if (!sessionId) return null; 

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userQuery = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userQuery, timestamp: new Date() }]);
    setInput(""); setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, query: userQuery }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: data.answer.includes("not present") ? "guardrail" : "assistant", 
        content: data.answer, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: "err", role: "guardrail", content: "⚠️ Connection error.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.section id="chat" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.5 }} className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="wiz-container max-w-3xl relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent mb-4">
            <MessageSquare className="h-3.5 w-3.5" /> Step 2
          </div>
          <TextReveal text="Ask Your Document" className="font-display text-3xl font-bold text-foreground" />
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-gradient-to-r from-card to-secondary/30">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 p-1.5 rounded-xl bg-primary text-primary-foreground" />
              <div><p className="text-sm font-semibold">Docans RAG Chat</p></div>
            </div>
            <button onClick={() => setMessages([{id: 'w', role: 'assistant', content: 'Chat cleared!', timestamp: new Date()}])} className="p-2.5 rounded-xl hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
          </div>

          <div ref={chatRef} className="h-[420px] overflow-y-auto p-6 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/10 text-accent border border-accent/20"}`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md whitespace-pre-wrap" : "bg-secondary/80 text-foreground rounded-bl-md border border-border/50 prose prose-sm dark:prose-invert max-w-none"}`}>
                    {msg.role === "user" ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <div className="text-xs text-muted-foreground animate-pulse ml-12">Searching document...</div>}
          </div>

          <div className="border-t border-border p-4 bg-gradient-to-r from-card to-secondary/20">
            <div className="flex gap-3">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask a question..." className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" disabled={isTyping} />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="rounded-xl bg-primary px-4 py-3 text-primary-foreground disabled:opacity-40 transition-all hover:shadow-lg"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}