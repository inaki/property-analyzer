import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Analysis, type InsertAnalysis } from "@shared/schema";

// GET /api/analyses
export function useAnalyses() {
  return useQuery({
    queryKey: [api.analyses.list.path],
    queryFn: async () => {
      const res = await fetch(api.analyses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analyses");
      return api.analyses.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/analyses/:id
export function useAnalysis(id: number | null) {
  return useQuery({
    queryKey: [api.analyses.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.analyses.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch analysis");
      return api.analyses.get.responses[200].parse(await res.json());
    },
  });
}

// POST /api/analyses
export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAnalysis) => {
      const validated = api.analyses.create.input.parse(data);
      const res = await fetch(api.analyses.create.path, {
        method: api.analyses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.analyses.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create analysis");
      }
      return api.analyses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.analyses.list.path] }),
  });
}

// DELETE /api/analyses/:id
export function useDeleteAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.analyses.delete.path, { id });
      const res = await fetch(url, { 
        method: api.analyses.delete.method, 
        credentials: "include" 
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Analysis not found");
        throw new Error("Failed to delete analysis");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.analyses.list.path] }),
  });
}
