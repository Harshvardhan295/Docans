const DocansFooter = () => {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="wiz-container py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2.5">
          <img src="/Logo.png" alt="Docans Logo" className="h-5 w-5 object-contain opacity-70" />
          <span className="font-display text-sm font-bold text-foreground/70 tracking-tight">Docans</span>
        </div>
        
        <p className="text-xs text-muted-foreground font-medium flex justify-center">
          © {new Date().getFullYear()} Docans. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default DocansFooter;
