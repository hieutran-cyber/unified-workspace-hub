import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "next-auth/react";

export function useProperties() {
  const { data: session } = useSession();
  return useQuery<any[]>({
    queryKey: ["properties", session?.accessToken],
    queryFn: () => apiClient("/properties"),
    enabled: !!session?.accessToken,
  });
}

export function useProperty(id?: string) {
  const { data: session } = useSession();
  return useQuery<any>({
    queryKey: ["property", id, session?.accessToken],
    queryFn: () => apiClient(`/properties/${id}`),
    enabled: !!id && !!session?.accessToken,
  });
}

export function useSaveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const isUpdate = !!data.id;
      return apiClient(isUpdate ? `/properties/${data.id}` : "/properties", {
        method: isUpdate ? "PUT" : "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
