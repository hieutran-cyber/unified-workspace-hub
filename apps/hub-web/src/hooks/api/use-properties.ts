import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "../use-auth";

export function useProperties() {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any[]>({
    queryKey: ["properties", token],
    queryFn: () => apiClient("/properties", { token }),
    enabled: isAuthenticated && !!token,
  });
}

export function useProperty(id?: string) {
  const { token, isAuthenticated } = useAuth();
  return useQuery<any>({
    queryKey: ["properties", id, token],
    queryFn: () => apiClient(`/properties/${id}`, { token }),
    enabled: !!id && isAuthenticated && !!token,
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient(`/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: any) =>
      apiClient("/properties", {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
