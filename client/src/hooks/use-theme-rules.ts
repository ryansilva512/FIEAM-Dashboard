import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertThemeRule, type ThemeRule } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useThemeRules() {
  return useQuery({
    queryKey: [api.themeRules.list.path],
    queryFn: async () => {
      const res = await fetch(api.themeRules.list.path);
      if (!res.ok) throw new Error("Failed to fetch theme rules");
      return api.themeRules.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateThemeRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertThemeRule) => {
      const res = await fetch(api.themeRules.create.path, {
        method: api.themeRules.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create rule");
      return api.themeRules.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.themeRules.list.path] });
      toast({ title: "Rule created", description: "New theme rule added successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateThemeRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertThemeRule> & { id: number }) => {
      const url = buildUrl(api.themeRules.update.path, { id });
      const res = await fetch(url, {
        method: api.themeRules.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update rule");
      return api.themeRules.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.themeRules.list.path] });
      toast({ title: "Rule updated", description: "Theme rule updated successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteThemeRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.themeRules.delete.path, { id });
      const res = await fetch(url, { method: api.themeRules.delete.method });
      if (!res.ok) throw new Error("Failed to delete rule");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.themeRules.list.path] });
      toast({ title: "Rule deleted", description: "Theme rule removed successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useClassifyText() {
  return useMutation({
    mutationFn: async (data: { text: string; themes?: string[] }) => {
      const res = await fetch(api.ai.classify.path, {
        method: api.ai.classify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to classify text");
      return api.ai.classify.responses[200].parse(await res.json());
    },
  });
}
