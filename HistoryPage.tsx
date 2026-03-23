import { useState, useEffect } from "react";
import { FileText, Calendar, Pill, Trash2, Download, Eye, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PrescriptionRecord {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  doctor_name: string | null;
  diagnosis: string | null;
  medications: any[];
  side_effects: any[];
  follow_up: any[];
  ai_summary: string | null;
  one_liner: string | null;
  original_excerpts: string[];
  uploaded_at: string;
}

const HistoryPage = () => {
  const [records, setRecords] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PrescriptionRecord | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("prescription_history")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (!error && data) setRecords(data as PrescriptionRecord[]);
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("delete_confirm"))) return;
    await supabase.from("prescription_history").delete().eq("id", id);
    setRecords(records.filter((r) => r.id !== id));
    toast({ title: "Record deleted" });
  };

  const handleDownload = async (record: PrescriptionRecord) => {
    const { data } = await supabase.storage.from("prescriptions").download(record.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = record.file_name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.file_name.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q) ||
      r.one_liner?.toLowerCase().includes(q) ||
      r.medications?.some((m: any) => m.name?.toLowerCase().includes(q))
    );
  });

  if (selectedRecord) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedRecord(null)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("back")}
          </Button>
          <Card className="animate-fade-up">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{selectedRecord.file_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("uploaded_on")} {new Date(selectedRecord.uploaded_at).toLocaleDateString()}
                </p>
              </div>

              {selectedRecord.one_liner && (
                <div className="p-4 rounded-lg bg-accent/30 border border-primary/10">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{t("ai_summary")}</p>
                  <p className="font-semibold text-foreground">{selectedRecord.one_liner}</p>
                </div>
              )}

              {selectedRecord.diagnosis && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t("diagnosis_explained")}</h3>
                  <p className="text-foreground/80 leading-relaxed">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.medications?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t("medication_schedule")}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">{t("medicine")}</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">{t("dosage")}</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">{t("timing")}</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">{t("days")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecord.medications.map((med: any, i: number) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-2 px-3 font-medium">{med.name}</td>
                            <td className="py-2 px-3 font-mono text-sm">{med.dosage}</td>
                            <td className="py-2 px-3">{med.timing}</td>
                            <td className="py-2 px-3"><Badge variant="secondary">{med.days}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedRecord.side_effects?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t("side_effect_alerts")}</h3>
                  <div className="space-y-2">
                    {selectedRecord.side_effects.map((se: any, i: number) => (
                      <div key={i} className={`p-3 rounded-lg ${se.whenToCall ? "bg-destructive/5 border border-destructive/15" : "bg-warm"}`}>
                        <p className="text-foreground text-sm">{se.effect}</p>
                        {se.whenToCall && <p className="text-xs text-destructive font-medium mt-1">⚠ {t("call_doctor")}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedRecord)}>
                  <Download className="h-4 w-4 mr-1" /> {t("download")}
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => { handleDelete(selectedRecord.id); setSelectedRecord(null); }}>
                  <Trash2 className="h-4 w-4 mr-1" /> {t("delete")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">{t("history_title")}</h2>
          <p className="text-muted-foreground text-sm">{t("history_subtitle")}</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t("no_history")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((record, i) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-foreground truncate">{record.file_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.uploaded_at).toLocaleDateString()}
                      </div>
                      {record.one_liner && (
                        <p className="text-sm text-foreground/70 mb-2 line-clamp-2">{record.one_liner}</p>
                      )}
                      {record.medications?.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Pill className="h-3 w-3 text-primary" />
                          {record.medications.slice(0, 3).map((m: any, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs">{m.name}</Badge>
                          ))}
                          {record.medications.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{record.medications.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                        <Eye className="h-3 w-3 mr-1" /> {t("view_details")}
                      </Button>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(record)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(record.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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

export default HistoryPage;
