const footerLinks = {
  Platform: ["CNAPP", "CSPM", "CWPP", "CIEM", "DSPM", "CDR", "Container Security"],
  Solutions: ["Financial Services", "Healthcare", "Technology", "Retail", "Government"],
  Resources: ["Blog", "Research", "Documentation", "Webinars", "Podcast"],
  Company: ["About", "Careers", "Partners", "Press", "Contact"],
};

const Footer = () => {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="wiz-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-2xl font-bold text-primary">wiz</span>
            <p className="mt-4 text-sm opacity-60 leading-relaxed">
              Secure everything you build and run in the cloud.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-4 opacity-80">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm opacity-50 hover:opacity-100 transition-opacity">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-40">© 2026 Wiz, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Security", "Cookies"].map((link) => (
              <a key={link} href="#" className="text-xs opacity-40 hover:opacity-100 transition-opacity">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
