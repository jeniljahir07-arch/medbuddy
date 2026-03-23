import { Heart, Pill, AlertTriangle, ClipboardList, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface MedBuddyResult {
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    timing: string;
    days: string;
  }[];
  sideEffects: {
    effect: string;
    whenToCall: boolean;
  }[];
  followUp: {
    item: string;
    done: boolean;
  }[];
  oneLiner: string;
  originalExcerpts?: string[];
}

interface ResultsSectionProps {
  result: MedBuddyResult;
}

const ResultsSection = ({ result }: ResultsSectionProps) => {
  return (
    <section className="py-24" id="results">
      <div className="container mx-auto px-6 max-w-4xl space-y-8">
        <div className="text-center mb-8 animate-fade-up">
          <h2 className="text-3xl font-bold text-foreground mb-3">Your Results</h2>
          <p className="text-muted-foreground">Here's your prescription, simplified.</p>
        </div>

        {/* One-liner summary */}
        <Card className="border-primary/20 bg-accent/30 animate-fade-up">
          <CardContent className="p-6 flex items-start gap-4">
            <MessageSquare className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Share with family</p>
              <p className="text-lg font-semibold text-foreground leading-relaxed">{result.oneLiner}</p>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="h-5 w-5 text-primary" /> Diagnosis Explained
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{result.diagnosis}</p>
          </CardContent>
        </Card>

        {/* Medication Table */}
        <Card className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Pill className="h-5 w-5 text-primary" /> Medication Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Medicine</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Dosage</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Timing</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {result.medications.map((med, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{med.name}</td>
                      <td className="py-3 px-4 font-mono text-sm">{med.dosage}</td>
                      <td className="py-3 px-4">{med.timing}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{med.days}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Side Effects */}
        <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-5 w-5 text-warning" /> Side Effect Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.sideEffects.map((se, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  se.whenToCall ? "bg-destructive/5 border border-destructive/15" : "bg-warm"
                }`}
              >
                <span className={`h-2 w-2 rounded-full mt-2 shrink-0 ${se.whenToCall ? "bg-destructive" : "bg-warning"}`} />
                <div>
                  <p className="text-foreground">{se.effect}</p>
                  {se.whenToCall && (
                    <p className="text-sm text-destructive font-medium mt-1">⚠ Call your doctor immediately</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Follow-up Checklist */}
        <Card className="animate-fade-up" style={{ animationDelay: "320ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="h-5 w-5 text-primary" /> Follow-up Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.followUp.map((item, i) => (
              <label
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked={item.done}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-foreground">{item.item}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Side by side comparison */}
        {result.originalExcerpts && result.originalExcerpts.length > 0 && (
          <Card className="animate-fade-up" style={{ animationDelay: "400ms" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Original vs Simplified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Original Medical Jargon</p>
                  {result.originalExcerpts.map((excerpt, i) => (
                    <p key={i} className="text-sm text-foreground/70 font-mono leading-relaxed mb-2 last:mb-0">
                      {excerpt}
                    </p>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-accent/30 border border-primary/10">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Plain Language</p>
                  <p className="text-sm text-foreground leading-relaxed">{result.diagnosis}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default ResultsSection;
