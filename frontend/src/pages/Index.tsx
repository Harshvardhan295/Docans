import DocansNavbar from "@/components/docans/DocansNavbar";
import DocansHero from "@/components/docans/DocansHero";
import DocansUpload from "@/components/docans/DocansUpload";
import DocansChat from "@/components/docans/DocansChat";
import DocansFooter from "@/components/docans/DocansFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DocansNavbar />
      <main className="flex-1">
        <DocansHero />
        <DocansUpload />
        <DocansChat />
      </main>
      <DocansFooter />
    </div>
  );
};

export default Index;
