import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "next-auth/react";

export function useRoles() {
  const { data: session } = useSession();
  return useQuery<any[]>({
    queryKey: ["roles", session?.accessToken],
    queryFn: () => apiClient("/roles"),
    enabled: !!session?.accessToken,
  });
}

export function useRole(id?: string) {
  const { data: session } = useSession();
  return useQuery<any>({
    queryKey: ["roles", id, session?.accessToken],
    queryFn: () => apiClient(`/roles/${id}`),
    enabled: !!id && !!session?.accessToken,
  });
}

export function useSaveRole(id?: string) {
  const queryClient = useQueryClient();
  const isEdit = !!id;

  return useMutation({
    mutationFn: (data: any) =>
      apiClient(isEdit ? `/roles/${id}` : "/roles", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["roles", id] });
    },
  });
}
