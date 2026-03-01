const logos = [
  "Morgan Stanley", "Chipotle", "Siemens", "Fox", "Mars",
  "Slack", "Snowflake", "DocuSign", "BMW", "Salesforce",
  "Priceline", "Aon", "Colgate", "Bridgewater", "Rivian",
  "Wolt",
];

const LogoBar = () => {
  return (
    <section className="border-y border-border bg-secondary/30 py-12">
      <div className="wiz-container text-center mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trusted by more than 50% of Fortune 100 companies
        </p>
      </div>
      <div className="overflow-hidden">
        <div className="flex animate-scroll-logos whitespace-nowrap">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="inline-flex items-center justify-center mx-8 min-w-[120px]"
            >
              <span className="text-base font-semibold text-muted-foreground/60 select-none">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoBar;
