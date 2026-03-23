import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import UploadSection from "@/components/UploadSection";
import ResultsSection, { type MedBuddyResult } from "@/components/ResultsSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MedBuddyResult | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (file: File, age?: string, language?: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("prescriptions")
        .upload(fileName, file);

      if (uploadError) throw new Error("Failed to upload file: " + uploadError.message);

      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from("prescriptions")
        .getPublicUrl(fileName);

      // Call edge function
      const { data, error } = await supabase.functions.invoke("analyze-prescription", {
        body: {
          fileName,
          fileType: file.type,
          age: age || undefined,
          language: language || "english",
        },
      });

      if (error) throw new Error("Analysis failed: " + error.message);

      setResult(data as MedBuddyResult);

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onGetStarted={scrollToUpload} />
      <HowItWorks />
      <UploadSection ref={uploadRef} onSubmit={handleSubmit} isLoading={isLoading} />
      {result && <ResultsSection result={result} />}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>MedBuddy — AI-powered prescription clarity. Not a substitute for medical advice.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
