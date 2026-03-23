import { useState, useEffect } from "react";
import { User, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];

const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
        if (data) {
          setName(data.patient_name || "");
          setAge(data.age?.toString() || "");
          setGender(data.gender || "");
          setBloodGroup(data.blood_group || "");
          setMobile(data.mobile_number || "");
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        patient_name: name.trim() || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        blood_group: bloodGroup || null,
        mobile_number: mobile.trim() || null,
      }).eq("user_id", user!.id);
      if (error) throw error;
      toast({ title: t("profile_updated") });
      setEditing(false);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label: t("patient_name"), value: name },
    { label: t("age"), value: age },
    { label: t("gender"), value: gender },
    { label: t("blood_group"), value: bloodGroup },
    { label: t("mobile_number"), value: mobile },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="animate-fade-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> {t("profile")}
            </CardTitle>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" /> {t("edit")}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("patient_name")}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("age")}</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} min={0} max={120} />
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
                    <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="hero" onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-1" /> {t("save_changes")}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>{t("cancel")}</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{f.label}</span>
                    <span className="font-medium text-foreground">{f.value || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
