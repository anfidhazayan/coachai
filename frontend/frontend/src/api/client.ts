const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // Do NOT set Content-Type if we're sending FormData (e.g. for PDF upload)
  // browser will automatically set correct multipart/form-data with boundaries
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "API call failed";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // Ignore if response body isn't JSON
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}
