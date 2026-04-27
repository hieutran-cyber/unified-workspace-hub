import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "../use-auth";

export function useOrganizations() {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any[]>({
    queryKey: ["organizations", token],
    queryFn: () => apiClient("/organizations", { token }),
    enabled: isAuthenticated && !!token,
  });
}

export function useOrganizationDetail(id?: string) {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any>({
    queryKey: ["organizations", id, token],
    queryFn: () => apiClient(`/organizations/${id}`, { token }),
    enabled: !!id && isAuthenticated && !!token,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient(`/organizations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organizations", id] });
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: any) =>
      apiClient("/organizations", {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}
