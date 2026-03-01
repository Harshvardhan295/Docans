import DocansNavbar from "@/components/docans/DocansNavbar";
import DocansHero from "@/components/docans/DocansHero";
import DocansFeatures from "@/components/docans/DocansFeatures";
import DocansHowItWorks from "@/components/docans/DocansHowItWorks";
import DocansUpload from "@/components/docans/DocansUpload";
import DocansChat from "@/components/docans/DocansChat";
import DocansFooter from "@/components/docans/DocansFooter";
import ScrollReveal from "@/components/wiz/ScrollReveal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DocansNavbar />
      <DocansHero />
      <ScrollReveal><DocansFeatures /></ScrollReveal>
      <ScrollReveal><DocansHowItWorks /></ScrollReveal>
      <DocansUpload />
      <DocansChat />
      <DocansFooter />
    </div>
  );
};

export default Index;
