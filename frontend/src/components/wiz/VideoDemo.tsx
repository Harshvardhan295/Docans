import { Play } from "lucide-react";

const VideoDemo = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="wiz-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Ready to see Wiz in action?
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Watch a 3-minute overview of how Wiz provides complete visibility, risk prioritization, and automated remediation across your entire cloud environment.
            </p>
            <blockquote className="mt-8 border-l-4 border-primary pl-4">
              <p className="text-sm italic text-foreground">
                "Wiz gave us the visibility we needed within minutes of deployment. No agents, no hassle."
              </p>
              <cite className="mt-2 block text-xs text-muted-foreground not-italic">
                — VP Engineering, Series D Startup
              </cite>
            </blockquote>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden cursor-pointer group">
            <div className="aspect-video bg-gradient-to-br from-foreground/5 to-primary/5 flex items-center justify-center">
              <div className="rounded-full bg-primary p-5 group-hover:scale-110 transition-transform shadow-lg">
                <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemo;
