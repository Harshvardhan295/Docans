import { useState } from "react";
import { ChevronDown, Menu, X, Globe } from "lucide-react";
import MagneticButton from "./animations/MagneticButton";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["Platform", "Solutions", "Pricing", "Resources", "Customers", "Company"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="wiz-container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
            <text x="0" y="24" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="28" fill="hsl(217, 91%, 60%)">wiz</text>
          </svg>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-secondary"
            >
              {link}
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Sign in
          </button>
          <button className="p-2 text-foreground/60 hover:text-foreground transition-colors">
            <Globe className="h-4 w-4" />
          </button>
          <MagneticButton className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            Get a demo
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
              <button key={link} className="flex w-full items-center justify-between py-3 text-base font-medium text-foreground border-b border-border/50">
                {link}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <button className="text-sm font-medium text-foreground/70">Sign in</button>
              <button className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Get a demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
