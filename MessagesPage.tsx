import { useState, useEffect } from "react";
import { Pill, Clock, Check, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  medicine_name: string;
  dosage: string | null;
  timing: string | null;
  days: string | null;
  scheduled_time: string | null;
  is_taken: boolean;
  created_at: string;
}

const MessagesPage = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const fetchReminders = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setReminders(data as Reminder[]);
    setLoading(false);
  };

  useEffect(() => { fetchReminders(); }, [user]);

  const markAsTaken = async (id: string) => {
    await supabase.from("medication_reminders").update({ is_taken: true }).eq("id", id);
    setReminders(reminders.map((r) => r.id === id ? { ...r, is_taken: true } : r));
    toast({ title: "Marked as taken ✓" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">{t("messages_title")}</h2>
          <p className="text-muted-foreground text-sm">{t("messages_subtitle")}</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t("no_reminders")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder, i) => (
              <Card
                key={reminder.id}
                className={`transition-all duration-200 animate-fade-up ${
                  reminder.is_taken ? "opacity-60" : "hover:shadow-md"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        reminder.is_taken ? "bg-muted" : "bg-primary/10"
                      }`}>
                        <Pill className={`h-5 w-5 ${reminder.is_taken ? "text-muted-foreground" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${reminder.is_taken ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {reminder.medicine_name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          💊 {t("time_to_take")} {reminder.medicine_name}
                          {reminder.dosage && ` — ${reminder.dosage}`}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {reminder.timing && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {reminder.timing}
                            </span>
                          )}
                          {reminder.days && (
                            <Badge variant="secondary" className="text-xs">{reminder.days}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {reminder.is_taken ? (
                        <span className="flex items-center gap-1 text-sm text-success font-medium">
                          <Check className="h-4 w-4" /> {t("taken")}
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsTaken(reminder.id)}
                          className="text-primary border-primary/30 hover:bg-primary/5"
                        >
                          <Check className="h-3 w-3 mr-1" /> {t("mark_taken")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
