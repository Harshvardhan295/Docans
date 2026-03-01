import { Star } from "lucide-react";

const badges = [
  { platform: "G2", rating: 4.9, label: "Leader" },
  { platform: "Gartner", rating: 4.8, label: "Peer Insights" },
  { platform: "Forrester", rating: 4.7, label: "Wave Leader" },
];

const ReviewsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="wiz-container text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Customers rate Wiz #1 in cloud security
        </h2>
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {badges.map((badge) => (
            <div
              key={badge.platform}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 min-w-[180px] hover:shadow-lg transition-shadow"
            >
              <span className="text-2xl font-display font-bold text-foreground">{badge.platform}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm font-semibold text-primary">{badge.rating}/5</span>
              <span className="text-xs text-muted-foreground">{badge.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="text-lg font-semibold text-foreground">747 Reviews</span>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            See all reviews →
          </a>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
