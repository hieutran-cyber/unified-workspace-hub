import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "../use-auth";

export function useRoles() {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any[]>({
    queryKey: ["roles", token],
    queryFn: () => apiClient("/roles", { token }),
    enabled: isAuthenticated && !!token,
  });
}

export function useRole(id?: string) {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any>({
    queryKey: ["roles", id, token],
    queryFn: () => apiClient(`/roles/${id}`, { token }),
    enabled: !!id && isAuthenticated && !!token,
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient(`/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", id] });
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: any) =>
      apiClient("/roles", {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function usePermissions() {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any[]>({
    queryKey: ["permissions", token],
    queryFn: () => apiClient("/roles/available-permissions", { token }),
    enabled: isAuthenticated && !!token,
  });
}
