import { useState } from "react";
import { Menu, X, FileText } from "lucide-react";
import MagneticButton from "../wiz/animations/MagneticButton";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["Features", "How It Works", "Upload", "Chat"];

const DocansNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="wiz-container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary p-1.5">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Docans</span>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link.toLowerCase().replace(/\s/g, "-"))}
              className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-secondary"
            >
              {link}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <MagneticButton
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            onClick={() => scrollTo("upload")}
          >
            Get Started
          </MagneticButton>
        </div>

        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden border-t border-border bg-background px-4 pb-6 pt-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase().replace(/\s/g, "-"))}
                className="flex w-full items-center py-3 text-base font-medium text-foreground border-b border-border/50"
              >
                {link}
              </button>
            ))}
            <div className="mt-4">
              <button
                onClick={() => scrollTo("upload")}
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default DocansNavbar;
