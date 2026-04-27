import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "keycloak";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string | null;
}

export async function apiClient(endpoint: string, options: RequestOptions = {}) {
  let token = options.token;

  // Nếu không có token truyền vào, thử lấy tự động (chỉ cho Keycloak)
  if (!token && provider === "keycloak") {
    const session = await getSession();
    token = session?.accessToken;

    if (session?.error === "RefreshAccessTokenError") {
      console.error("🔄 Refresh token expired, signing out...");
      signOut({ callbackUrl: "/" });
      return;
    }
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
    const fetchOptions = { ...options };
    if (
      fetchOptions.body &&
      typeof fetchOptions.body === "object" &&
      !(fetchOptions.body instanceof FormData)
    ) {
      fetchOptions.body = JSON.stringify(fetchOptions.body) as any;
    }

    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
    });

    // 4. Handle common errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Lỗi hệ thống (${response.status})`;

      if (response.status === 401) {
        console.error("🔑 Session expired or unauthorized");
      } else if (response.status === 403) {
        toast.error("Bạn không có quyền thực hiện hành động này.");
      } else {
        toast.error(errorMessage);
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`🚀 API Error [${endpoint}]:`, error?.message || error);
    throw error;
  }
}
