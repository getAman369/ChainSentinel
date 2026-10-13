import type { ApiError } from "@/types";

const API_BASE = "/api/v1";

export class ApiClientError extends Error {
  status: number;
  details?: string[];

  constructor(status: number, payload: ApiError) {
    super(payload.error || `HTTP ${status}`);
    this.name = "ApiClientError";
    this.status = status;
    this.details = payload.details;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  baseUrl?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers, baseUrl = API_BASE } = options;

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiClientError(response.status, { error: "Invalid JSON response" });
  }

  if (!response.ok) {
    throw new ApiClientError(response.status, data as ApiError);
  }

  return data as T;
}

export async function get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return request<T>(endpoint, { ...options, method: "GET" });
}

export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, { method: "POST", body });
}
