import { Upload, Brain, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    desc: "Drop your prescription, discharge summary, or lab report — PDF or photo.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    desc: "Our AI reads, extracts, and translates the medical jargon into plain language.",
  },
  {
    icon: ClipboardCheck,
    title: "Clear Results",
    desc: "Get your diagnosis, medication schedule, side effects, and follow-up — all simplified.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24" id="how-it-works">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to medical clarity.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="text-center space-y-4 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center shadow-sm">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
