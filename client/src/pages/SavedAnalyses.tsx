import { useAnalyses, useDeleteAnalysis } from "@/hooks/use-analyses";
import { Layout } from "@/components/Layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, TrendingUp, Building2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
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

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Deleted", description: "Analysis removed successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const formatCurrency = (val: number | string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(val));

  const handleExport = () => {
    if (!analyses || analyses.length === 0) {
      toast({ title: "Nothing to export", description: "No saved analyses found." });
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
              <h1 className="text-3xl font-display font-bold">Saved Analyses</h1>
              <p className="text-muted-foreground mt-1">Review your past property evaluations.</p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={!analyses || analyses.length === 0}>
              Export JSON
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
            <h3 className="text-xl font-semibold mb-2">No Saved Analyses</h3>
            <p className="text-muted-foreground mb-6">Go to the calculator to create your first analysis.</p>
            <Button asChild>
              <a href="/">Go to Calculator</a>
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Property Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses?.map((analysis) => (
                  <TableRow key={analysis.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{analysis.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{analysis.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatCurrency(analysis.purchasePrice)}
                    </TableCell>
                    <TableCell className="font-mono text-emerald-600 font-medium">
                      {formatCurrency(analysis.monthlyRent)}/mo
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {analysis.createdAt ? format(new Date(analysis.createdAt), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Analysis?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete "{analysis.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(analysis.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
}
