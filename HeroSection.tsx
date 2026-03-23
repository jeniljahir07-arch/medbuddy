import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.png";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
            AI-Powered Medical Clarity
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] text-foreground">
            Your prescriptions,{" "}
            <span className="text-primary">finally explained.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Upload your prescription or discharge summary and get a plain-language breakdown — diagnosis, medication schedule, side effects, and follow-up steps — in seconds.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="lg" onClick={onGetStarted}>
              Upload Prescription
              <ArrowDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> PDF & Image support
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Hindi & English
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> 100% private
            </span>
          </div>
        </div>
        <div className="relative animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
            <img
              src={heroImage}
              alt="Medical document being simplified into clear, friendly information"
              className="w-full h-auto"
              loading="eager"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-2xl bg-secondary opacity-60 -z-10" />
          <div className="absolute -top-4 -right-4 h-16 w-16 rounded-xl bg-accent opacity-60 -z-10" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
