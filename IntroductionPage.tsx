import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];

const IntroductionPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.patient_name) {
            setName(data.patient_name);
            setAge(data.age?.toString() || "");
            setGender(data.gender || "");
            setBloodGroup(data.blood_group || "");
            setMobile(data.mobile_number || "");
          }
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter patient name", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          patient_name: name.trim(),
          age: age ? parseInt(age) : null,
          gender: gender || null,
          blood_group: bloodGroup || null,
          mobile_number: mobile.trim() || null,
        })
        .eq("user_id", user!.id);

      if (error) throw error;
      toast({ title: t("profile_saved") });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("patient_intro_title")}</h1>
        <p className="text-muted-foreground">{t("patient_intro_subtitle")}</p>
      </div>

      {/* Patient Avatar */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="relative w-32 h-32 rounded-full bg-secondary flex items-center justify-center shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 active:scale-95 animate-fade-up"
        style={{ animationDelay: "100ms" }}
      >
        <User className="h-16 w-16 text-primary" />
        <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
          {showForm ? <ChevronUp className="h-4 w-4 text-primary-foreground" /> : <ChevronDown className="h-4 w-4 text-primary-foreground" />}
        </span>
      </button>

      {/* Dropdown Form */}
      <div
        className={`mt-6 w-full max-w-md transition-all duration-500 ease-out overflow-hidden ${
          showForm ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-card rounded-2xl shadow-lg shadow-foreground/5 border border-border p-6 space-y-4">
          <div className="space-y-2">
            <Label>{t("patient_name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("age")}</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" min={0} max={120} />
            </div>
            <div className="space-y-2">
              <Label>{t("gender")}</Label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("blood_group")}</Label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("mobile_number")}</Label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91..." />
            </div>
          </div>
          <Button variant="hero" className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : t("save")}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard")}>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionPage;
