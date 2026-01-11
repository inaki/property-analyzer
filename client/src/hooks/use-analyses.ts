import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insertAnalysisSchema, type Analysis, type InsertAnalysis } from "@shared/schema";
import {
  createAnalysisRecord,
  deleteAnalysisRecord,
  getAllAnalyses,
  getAnalysisById,
} from "@/lib/indexedDb";

export function useAnalyses() {
  return useQuery({
    queryKey: ["analyses"],
    queryFn: async () => getAllAnalyses(),
  });
}

export function useAnalysis(id: number | null) {
  return useQuery({
    queryKey: ["analyses", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      return getAnalysisById(id);
    },
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAnalysis) => {
      const validated = insertAnalysisSchema.parse(data);
      return createAnalysisRecord(validated);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["analyses"] }),
  });
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await deleteAnalysisRecord(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["analyses"] }),
  });
}
