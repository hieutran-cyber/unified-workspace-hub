import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient(endpoint: string, options: RequestOptions = {}) {
  const session = await getSession();
  const token = session?.accessToken;

  if (session?.error === "RefreshAccessTokenError") {
    console.error("🔄 Refresh token expired, signing out...");
    signOut({ callbackUrl: "/" });
    return;
  }

  if (!token) {
    console.warn(`⚠️ [apiClient] No token found for ${endpoint}`);
  }

  // 1. Construct URL with query params
  const url = new URL(`${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // 2. Prepare headers
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // 3. Perform request
  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    // 4. Handle common errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Lỗi hệ thống (${response.status})`;

      if (response.status === 401) {
        console.error("🔑 Session expired or unauthorized");
        // Optional: signOut() if truly unauthenticated
      } else if (response.status === 403) {
        toast.error("Bạn không có quyền thực hiện hành động này.");
      } else {
        toast.error(errorMessage);
      }

      throw new Error(errorMessage);
    }

    // 5. Parse JSON response
    return await response.json();
  } catch (error: any) {
    console.error(`🚀 API Error [${endpoint}]:`, error?.message || error);
    throw error;
  }
}
