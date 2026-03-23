import { useRef, useState } from "react";
import { Upload, FileText, Keyboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import UploadSection from "@/components/UploadSection";
import ResultsSection, { type MedBuddyResult } from "@/components/ResultsSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PrescriptionPage = () => {
  const [mode, setMode] = useState<"choose" | "upload" | "type">("choose");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MedBuddyResult | null>(null);
  const [textInput, setTextInput] = useState("");
  const uploadRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSubmit = async (file: File, age?: string, language?: string) => {
    setIsLoading(true);
    setResult(null);
    try {
      const fileName = `${user!.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("prescriptions").upload(fileName, file);
      if (uploadError) throw new Error("Failed to upload file: " + uploadError.message);

      const { data, error } = await supabase.functions.invoke("analyze-prescription", {
        body: { fileName, fileType: file.type, age, language: language || "english" },
      });
      if (error) throw new Error("Analysis failed: " + error.message);

      const resultData = data as MedBuddyResult;
      setResult(resultData);

      await supabase.from("prescription_history").insert({
        user_id: user!.id,
        file_name: file.name,
        file_path: fileName,
        file_type: file.type,
        diagnosis: resultData.diagnosis,
        medications: resultData.medications as any,
        side_effects: resultData.sideEffects as any,
        follow_up: resultData.followUp as any,
        ai_summary: resultData.diagnosis,
        one_liner: resultData.oneLiner,
        original_excerpts: resultData.originalExcerpts as any,
      });

      if (resultData.medications?.length) {
        const reminders = resultData.medications.map((med) => ({
          user_id: user!.id,
          medicine_name: med.name,
          dosage: med.dosage,
          timing: med.timing,
          days: med.days,
        }));
        await supabase.from("medication_reminders").insert(reminders);
      }

      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextAnalyze = async () => {
    if (!textInput.trim()) {
      toast({ title: "Please enter prescription text", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      // Create a text file blob to reuse existing edge function
      const blob = new Blob([textInput], { type: "text/plain" });
      const fileName = `${user!.id}/${Date.now()}-typed-prescription.txt`;
      const { error: uploadError } = await supabase.storage.from("prescriptions").upload(fileName, blob);
      if (uploadError) throw new Error("Failed to upload: " + uploadError.message);

      const { data, error } = await supabase.functions.invoke("analyze-prescription", {
        body: { fileName, fileType: "text/plain", language: "english" },
      });
      if (error) throw new Error("Analysis failed: " + error.message);

      const resultData = data as MedBuddyResult;
      setResult(resultData);

      await supabase.from("prescription_history").insert({
        user_id: user!.id,
        file_name: "Typed Prescription",
        file_path: fileName,
        file_type: "text/plain",
        diagnosis: resultData.diagnosis,
        medications: resultData.medications as any,
        side_effects: resultData.sideEffects as any,
        follow_up: resultData.followUp as any,
        ai_summary: resultData.diagnosis,
        one_liner: resultData.oneLiner,
        original_excerpts: resultData.originalExcerpts as any,
      });

      if (resultData.medications?.length) {
        const reminders = resultData.medications.map((med) => ({
          user_id: user!.id,
          medicine_name: med.name,
          dosage: med.dosage,
          timing: med.timing,
          days: med.days,
        }));
        await supabase.from("medication_reminders").insert(reminders);
      }

      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">Prescription Analysis</h1>
          <p className="text-muted-foreground mt-1">Upload a prescription or type it manually to get AI-powered insights.</p>
        </div>

        {mode === "choose" && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <Card
              className="group cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-2 border-transparent hover:border-primary/20"
              onClick={() => setMode("upload")}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Browse Prescription</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a PDF, image (JPG/PNG), or scanned document of your prescription.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">PDF</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">JPG</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">PNG</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-2 border-transparent hover:border-primary/20"
              onClick={() => setMode("type")}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Keyboard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Type Prescription</h3>
                <p className="text-sm text-muted-foreground">
                  Manually type or paste your prescription, diagnosis, or medical report text.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">Text Input</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === "upload" && (
          <div className="space-y-4 animate-fade-up">
            <Button variant="ghost" onClick={() => { setMode("choose"); setResult(null); }} className="text-muted-foreground">
              ← Back to options
            </Button>
            <UploadSection ref={uploadRef} onSubmit={handleFileSubmit} isLoading={isLoading} />
          </div>
        )}

        {mode === "type" && (
          <div className="space-y-4 animate-fade-up">
            <Button variant="ghost" onClick={() => { setMode("choose"); setResult(null); }} className="text-muted-foreground">
              ← Back to options
            </Button>
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Enter Your Prescription or Medical Report</h3>
                    <p className="text-sm text-muted-foreground">Type or paste your text below for AI analysis</p>
                  </div>
                </div>

                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type or paste your prescription, diagnosis, or medical report here…"
                  className="min-h-[220px] text-base leading-relaxed resize-y"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {textInput.length} characters
                  </span>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setTextInput("")}
                      disabled={!textInput || isLoading}
                    >
                      Clear Text
                    </Button>
                    <Button
                      onClick={handleTextAnalyze}
                      disabled={!textInput.trim() || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Prescription"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {result && <ResultsSection result={result} />}
      </div>
    </DashboardLayout>
  );
};

export default PrescriptionPage;
