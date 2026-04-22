import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "next-auth/react";

export interface Application {
  id: string;
  name: string;
  description: string;
  color?: string;
  status?: string;
}

export function useApplications() {
  const { data: session } = useSession();
  return useQuery<Application[]>({
    queryKey: ["applications", session?.accessToken],
    queryFn: () => apiClient("/applications"),
    enabled: !!session?.accessToken,
  });
}
