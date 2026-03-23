import { useState, useCallback, forwardRef } from "react";
import { Upload, FileText, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UploadSectionProps {
  onSubmit: (file: File, age?: string, language?: string) => void;
  isLoading: boolean;
}

const UploadSection = forwardRef<HTMLDivElement, UploadSectionProps>(
  ({ onSubmit, isLoading }, ref) => {
    const [file, setFile] = useState<File | null>(null);
    const [age, setAge] = useState("");
    const [language, setLanguage] = useState("english");
    const [dragOver, setDragOver] = useState(false);
    const { toast } = useToast();

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) validateAndSetFile(dropped);
    }, []);

    const validateAndSetFile = (f: File) => {
      const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
      if (!validTypes.includes(f.type)) {
        toast({ title: "Invalid file", description: "Please upload a PDF or image file.", variant: "destructive" });
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max file size is 10MB.", variant: "destructive" });
        return;
      }
      setFile(f);
    };

    const handleSubmit = () => {
      if (!file) {
        toast({ title: "No file", description: "Please upload a prescription first.", variant: "destructive" });
        return;
      }
      onSubmit(file, age || undefined, language);
    };

    return (
      <section ref={ref} id="upload">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-3xl font-bold text-foreground mb-3">Upload Your Document</h2>
            <p className="text-muted-foreground">
              Upload a prescription, discharge summary, or medical report as PDF or image.
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg shadow-foreground/5 border border-border p-8 space-y-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
                dragOver ? "border-primary bg-accent/50 scale-[1.01]" : file ? "border-success bg-sage-light" : "border-border hover:border-primary/40 hover:bg-muted/50"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  {file.type.startsWith("image") ? <Image className="h-8 w-8 text-primary" /> : <FileText className="h-8 w-8 text-primary" />}
                  <div className="text-left">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-4 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">PDF, PNG, JPG — up to 10MB</p>
                </>
              )}
            </div>

            {/* Options */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">Patient Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 45"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={0}
                  max={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">Output Language</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing your document...
                </>
              ) : (
                "Analyze Prescription"
              )}
            </Button>
          </div>
        </div>
      </section>
    );
  }
);

UploadSection.displayName = "UploadSection";

export default UploadSection;
