import { useAnalyses, useDeleteAnalysis, type SavedRecord } from "@/hooks/use-analyses";
import { Layout } from "@/components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Building2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SavedAnalyses() {
  const { data: analyses, isLoading } = useAnalyses();
  const deleteMutation = useDeleteAnalysis();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: t("saved.toast.deletedTitle"), description: t("saved.toast.deletedBody") });
    } catch {
      toast({ title: t("saved.toast.errorTitle"), description: t("saved.toast.deleteError"), variant: "destructive" });
    }
  };

  const formatCurrency = (val: number | string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(val));

  const getRowMeta = (analysis: SavedRecord) => {
    if (analysis.kind === "buyd") {
      return {
        title: analysis.title,
        description: analysis.description ?? t("saved.buydDescription"),
        value: formatCurrency(analysis.data.summary.netWorth),
        metric: t("saved.metric.ltv", { value: (analysis.data.summary.ltv * 100).toFixed(1) }),
        badge: t("saved.badge.buyd"),
      };
    }

    const data = analysis.data;
    return {
      title: analysis.title,
      description: analysis.description ?? "",
      value: formatCurrency(data.purchasePrice),
      metric: t("saved.metric.monthlyRent", { value: formatCurrency(data.monthlyRent) }),
      badge: null,
    };
  };

  const handleExport = () => {
    if (!analyses || analyses.length === 0) {
      toast({ title: t("saved.toast.emptyExportTitle"), description: t("saved.toast.emptyExportBody") });
      return;
    }

    const blob = new Blob([JSON.stringify(analyses, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "saved-analyses.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold">{t("saved.title")}</h1>
              <p className="text-muted-foreground mt-1">{t("saved.subtitle")}</p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={!analyses || analyses.length === 0}>
              {t("saved.export")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : analyses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/20">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{t("saved.emptyTitle")}</h3>
            <p className="text-muted-foreground mb-6">{t("saved.emptyBody")}</p>
            <Button asChild>
              <a href="/">{t("saved.emptyCta")}</a>
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">{t("saved.table.title")}</TableHead>
                  <TableHead>{t("saved.table.value")}</TableHead>
                  <TableHead>{t("saved.table.metric")}</TableHead>
                  <TableHead>{t("saved.table.date")}</TableHead>
                  <TableHead className="text-right">{t("saved.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses?.map((analysis) => {
                  const meta = getRowMeta(analysis);
                  return (
                    <TableRow key={analysis.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{meta.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                          {meta.description}
                        </span>
                        {meta.badge && (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                            {t("saved.badge.buyd")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {meta.value}
                      </TableCell>
                      <TableCell className="font-mono text-emerald-600 font-medium">
                        {meta.metric}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {analysis.createdAt ? format(new Date(analysis.createdAt), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("saved.delete.title")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("saved.delete.body", { title: meta.title })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(analysis.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t("common.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
}
