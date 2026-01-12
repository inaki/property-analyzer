import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insertAnalysisSchema, type InsertAnalysis } from "@shared/schema";
import {
  createBuydRecord,
  createPropertyAnalysisRecord,
  deleteAnalysisRecord,
  getAllAnalyses,
  getAnalysisById,
  type BuydSavedData,
  type SavedRecord,
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
      return createPropertyAnalysisRecord(validated);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["analyses"] }),
  });
}

export function useCreateBuydAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; description?: string; data: BuydSavedData }) =>
      createBuydRecord(payload),
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

export type { SavedRecord };
