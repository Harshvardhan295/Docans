import MagneticButton from "../wiz/animations/MagneticButton";

const DocansNavbar = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="wiz-container flex h-16 items-center justify-between">
        
        {/* Logo Section */}
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center">
            <img src="/Logo.png" alt="Docans Logo" className="h-8 w-8 object-contain" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">Docans</span>
        </a>

        {/* Call to Action */}
        <div className="flex items-center">
          <MagneticButton
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
            onClick={() => scrollTo("upload")}
          >
            Upload Document
          </MagneticButton>
        </div>
        
      </div>
    </header>
  );
};

export default DocansNavbar;
