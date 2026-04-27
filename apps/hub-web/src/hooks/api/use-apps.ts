import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "../use-auth";

export function useApps() {
  const { token, isAuthenticated, profile, orgId } = useAuth();
  return useQuery<any[]>({
    queryKey: ["apps", token, profile?.database?.id, orgId],
    queryFn: () => apiClient("/applications", { token }),
    enabled: isAuthenticated && !!token,
  });
}

export function useApp(id?: string) {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any>({
    queryKey: ["apps", id, token],
    queryFn: () => apiClient(`/applications/${id}`, { token }),
    enabled: !!id && isAuthenticated && !!token,
  });
}
