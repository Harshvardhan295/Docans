import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Trash2,
  MessageSquare,
  BookOpen,
  Sparkles,
  AlertTriangle,
  ArrowDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextReveal from "./wiz/animations/TextReveal";
import { useSessionStore } from "../lib/sessionStore";
import { apiUrl } from "../lib/api";
interface Message {
  id: string;
  role: "user" | "assistant" | "guardrail";
  content: string;
  timestamp: Date;
  sources?: string[];
}

/* ─── Typing-indicator dots ─── */
const TypingDots = () => (
  <motion.div
    className="flex items-center gap-3"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
  >
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
      <Bot className="h-4 w-4" />
    </div>
    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border/50 bg-secondary/80 px-5 py-3.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-primary/60"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </motion.div>
);

/* ─── Suggested question chips ─── */
const SuggestedChips = ({
  onSelect,
}: {
  onSelect: (q: string) => void;
}) => {
  const suggestions = [
    "What is this attached file about?",
    "Explain few key topics in it.",
    "Cover a random topic from the file.",
  ];
  return (
    <motion.div
      className="flex flex-col items-center gap-4 py-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
        Suggested questions
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <motion.button
            key={s}
            onClick={() => onSelect(s)}
            className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary transition-all hover:border-primary/40 hover:bg-primary/10 hover:shadow-sm"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

/* ─── Single chat bubble ─── */
const ChatBubble = ({ msg, index }: { msg: Message; index: number }) => {
  const isUser = msg.role === "user";
  const isGuardrail = msg.role === "guardrail";

  return (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm transition-colors ${
          isUser
            ? "bg-primary text-primary-foreground"
            : isGuardrail
            ? "border border-amber-400/30 bg-amber-500/10 text-amber-500"
            : "border border-accent/20 bg-accent/10 text-accent"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isGuardrail ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="max-w-[80%] space-y-1">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground"
              : isGuardrail
              ? "rounded-bl-md border border-amber-400/30 bg-amber-500/5 text-foreground"
              : "rounded-bl-md border border-border/50 bg-secondary/80 text-foreground"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
            {isUser ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
          </div>

          {/* Sources */}
          {!isUser && msg.sources && msg.sources.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-2.5">
              <BookOpen className="h-3 w-3 text-muted-foreground/70" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Sources
              </span>
              {msg.sources.map((src, idx) => (
                <span
                  key={`${msg.id}-${src}-${idx}`}
                  className="rounded-md border border-primary/20 bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary tabular-nums"
                >
                  Pg. {src}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p
          className={`px-1 text-[10px] text-muted-foreground/50 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {msg.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
};

/* ─── Main component ─── */
export default function DocansChat() {
  const { sessionId, isSummaryReady } = useSessionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Load history ── */
  useEffect(() => {
    if (!sessionId) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(apiUrl(`/session/${sessionId}/history`));
        const data = await res.json();

        const initialMsg: Message = {
          id: "welcome",
          role: "assistant",
          timestamp: new Date(),
          content:
            data.history.length > 0
              ? "Welcome back! I've loaded your conversation. What else would you like to know?"
              : "I'm ready to answer questions about this document! Try one of the suggested prompts below, or type your own question.",
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

  /* ── Auto-scroll ── */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ── Track scroll position for "scroll to bottom" button ── */
  const handleChatScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const scrollToBottom = () => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  /* ── Auto-resize textarea ── */
  const adjustTextareaHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 120) + "px";
  };

  if (!sessionId || !isSummaryReady) return null;

  /* ── Send message ── */
  const handleSend = async (overrideQuery?: string) => {
    const userQuery = (overrideQuery ?? input).trim();
    if (!userQuery || isTyping) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: userQuery,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsTyping(true);

    try {
      const response = await fetch(apiUrl("/chat/"), {
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
          role: data.answer.includes("not present")
            ? "guardrail"
            : "assistant",
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "guardrail",
          content:
            "Unable to reach the server. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      textareaRef.current?.focus();
    }
  };

  /* ── Clear chat ── */
  const clearChat = () =>
    setMessages([
      {
        id: "w-cleared",
        role: "assistant",
        content:
          "Chat cleared! Feel free to ask a new question about your document.",
        timestamp: new Date(),
      },
    ]);

  /* ── Only welcome message present? Show suggestions ── */
  const showSuggestions = messages.length <= 1;

  return (
    <motion.section
      id="chat"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-secondary/30 py-24"
    >
      <div className="wiz-container relative z-10 max-w-3xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent">
            <MessageSquare className="h-3.5 w-3.5" /> Step 2
          </div>
          <TextReveal
            text="Ask Follow-up Questions"
            className="font-display text-3xl font-bold text-foreground"
          />
        </div>

        {/* Chat card */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
          {/* ── Header bar ── */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-card via-card to-secondary/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-8 w-8 rounded-xl bg-primary p-1.5 text-primary-foreground" />
                {/* online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Docans Query System
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isTyping ? (
                    <span className="text-primary">Searching document…</span>
                  ) : (
                    "Online · Ready to answer"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <motion.button
                onClick={clearChat}
                className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* ── Messages area ── */}
          <div className="relative">
            <div
              ref={chatRef}
              onScroll={handleChatScroll}
              className="chat-scroll-area h-[460px] overflow-y-auto p-6 space-y-5"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <ChatBubble key={msg.id} msg={msg} index={i} />
                ))}

                {/* Suggested chips after welcome */}
                {showSuggestions && !isTyping && (
                  <SuggestedChips onSelect={(q) => handleSend(q)} />
                )}

                {/* Typing indicator */}
                {isTyping && <TypingDots />}
              </AnimatePresence>
            </div>

            {/* Scroll-to-bottom FAB */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card/90 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-secondary"
                >
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ── Input bar ── */}
          <div className="border-t border-border bg-gradient-to-r from-card to-secondary/20 px-5 py-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question about your document…"
                className="flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                disabled={isTyping}
                style={{ maxHeight: 120 }}
              />
              <motion.button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all hover:shadow-lg disabled:opacity-40"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
              Press <kbd className="rounded border border-border/60 bg-secondary/60 px-1 py-0.5 font-mono text-[9px]">Enter</kbd> to send · <kbd className="rounded border border-border/60 bg-secondary/60 px-1 py-0.5 font-mono text-[9px]">Shift + Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}






