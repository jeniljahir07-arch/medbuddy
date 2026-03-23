import { useState, useEffect } from "react";
import {
  Activity,
  Pill,
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
  Heart,
  Droplets,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Reminder {
  id: string;
  medicine_name: string;
  dosage: string | null;
  timing: string | null;
  is_taken: boolean;
}

const DashboardPage = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [profileName, setProfileName] = useState("");
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("medication_reminders")
      .select("id, medicine_name, dosage, timing, is_taken")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setReminders(data as Reminder[]);
      });
    supabase
      .from("profiles")
      .select("patient_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.patient_name) setProfileName(data.patient_name);
      });
  }, [user]);

  const takenCount = reminders.filter((r) => r.is_taken).length;
  const progressPercent = reminders.length > 0 ? Math.round((takenCount / reminders.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Greeting */}
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{profileName ? `, ${profileName}` : ""} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's your health overview for today.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Health Score",
              value: "Good",
              icon: Heart,
              color: "text-success",
              bg: "bg-success/10",
              badge: "Stable",
            },
            {
              title: "Medications Today",
              value: `${takenCount}/${reminders.length}`,
              icon: Pill,
              color: "text-primary",
              bg: "bg-primary/10",
              badge: `${progressPercent}%`,
            },
            {
              title: "Hydration",
              value: "6/8 glasses",
              icon: Droplets,
              color: "text-info",
              bg: "bg-info/10",
              badge: "75%",
            },
            {
              title: "Next Checkup",
              value: "In 5 days",
              icon: CalendarCheck,
              color: "text-warning",
              bg: "bg-warning/10",
              badge: "Upcoming",
            },
          ].map((stat, i) => (
            <Card
              key={stat.title}
              className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {stat.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medication Progress */}
          <Card className="lg:col-span-2 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5 text-primary" />
                Today's Medication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-semibold text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
              </div>

              {/* Medication list */}
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No medications scheduled. Upload a prescription to get started.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {reminders.map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        r.is_taken ? "bg-success/5" : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        r.is_taken ? "bg-success/15" : "bg-primary/10"
                      }`}>
                        <Pill className={`h-4 w-4 ${r.is_taken ? "text-success" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${r.is_taken ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {r.medicine_name}
                        </p>
                        {r.timing && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {r.timing}
                          </p>
                        )}
                      </div>
                      {r.is_taken ? (
                        <Badge className="bg-success/15 text-success border-0 text-xs">Taken ✓</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="animate-fade-up" style={{ animationDelay: "280ms" }}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { text: "Complete your profile information", type: "info" as const },
                { text: "Upload your latest prescription", type: "warning" as const },
                { text: "Stay hydrated — drink water regularly", type: "success" as const },
              ].map((alert, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-sm transition-all hover:translate-x-1 cursor-default ${
                    alert.type === "warning"
                      ? "bg-warning/10 text-warning-foreground border border-warning/15"
                      : alert.type === "success"
                      ? "bg-success/10 text-foreground border border-success/15"
                      : "bg-primary/5 text-foreground border border-primary/10"
                  }`}
                >
                  {alert.text}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="animate-fade-up" style={{ animationDelay: "360ms" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Upload Prescription", icon: Activity, href: "/prescription" },
                { label: "View History", icon: Clock, href: "/history" },
                { label: "Medication Reminders", icon: Pill, href: "/messages" },
                { label: "Health Summary", icon: Heart, href: "/summary" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-primary/5 hover:shadow-md transition-all duration-300 group text-center"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
