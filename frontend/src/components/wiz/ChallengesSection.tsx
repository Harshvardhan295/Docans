import { AlertTriangle, Cloud, Shield, Eye } from "lucide-react";

const challenges = [
  { icon: Cloud, text: "Multi-cloud environments expand the attack surface exponentially" },
  { icon: AlertTriangle, text: "Traditional tools create alert fatigue with thousands of low-priority findings" },
  { icon: Eye, text: "Lack of visibility across cloud workloads, identities, and data" },
  { icon: Shield, text: "Siloed security tools can't correlate risks across the cloud stack" },
];

const ChallengesSection = () => {
  return (
    <section className="py-20 bg-wiz-light">
      <div className="wiz-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              The switch to cloud creates a new world of security challenges
            </h2>
            <div className="mt-10 space-y-6">
              {challenges.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 mt-1 rounded-lg bg-primary/10 p-2.5">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border rotate-3" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-primary/10 to-accent/5 border border-border -rotate-3" />
              <div className="absolute inset-8 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <Cloud className="h-16 w-16 text-primary/30 mx-auto" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">Complex Cloud Stack</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChallengesSection;
