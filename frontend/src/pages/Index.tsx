import DocansNavbar from "@/components/DocansNavbar";
import DocansHero from "@/components/DocansHero";
import DocansUpload from "@/components/DocansUpload";
import DocansChat from "@/components/DocansChat";
import DocansFooter from "@/components/DocansFooter";

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
