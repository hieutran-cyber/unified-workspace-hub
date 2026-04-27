import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "../use-auth";

export function useUsers() {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any[]>({
    queryKey: ["users", token],
    queryFn: () => apiClient("/users", { token }),
    enabled: isAuthenticated && !!token,
  });
}

export function useUser(id?: string) {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any>({
    queryKey: ["users", id, token],
    queryFn: () => apiClient(`/users/${id}`, { token }),
    enabled: !!id && isAuthenticated && !!token,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      apiClient(`/users/${id}/roles`, {
        method: "PUT",
        body: JSON.stringify({ roleIds }),
        token,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: any) =>
      apiClient("/users", {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
