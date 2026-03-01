import { Headphones } from "lucide-react";

const PodcastSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="wiz-container">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-shrink-0 rounded-2xl bg-primary/10 p-6">
            <Headphones className="h-16 w-16 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Latest Episode</p>
            <h3 className="mt-2 font-display text-xl font-bold text-foreground">
              Crying Out Cloud — The State of Cloud Security in 2026
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Join our security researchers as they discuss the latest cloud threats, vulnerabilities, and best practices.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["YouTube", "Spotify", "Apple Podcasts"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;
