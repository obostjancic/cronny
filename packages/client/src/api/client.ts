import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Get API URL from environment variables, fallback to relative URL in production
const getApiUrl = (): string => {
  // In development, use the server URL directly
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || "http://localhost:3000";
  }
  
  // In production, use relative paths (served from same origin)
  return "";
};

class HttpClient {
  private instance: AxiosInstance;
  private apiUrl: string;

  constructor() {
    this.apiUrl = getApiUrl();
    this.instance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  setAuthToken(token: string) {
    this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.instance.defaults.headers.common["Authorization"];
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}

// Export singleton instance
export const httpClient = new HttpClient();

// Keep backward compatibility
export async function fetchJson(url: string, options: AxiosRequestConfig = {}) {
  try {
    const method = (options.method || "GET").toLowerCase() as "get" | "post" | "put" | "delete" | "patch";
    let response;
    
    switch (method) {
      case "post":
        response = await httpClient.post(url, options.data, options);
        break;
      case "put":
        response = await httpClient.put(url, options.data, options);
        break;
      case "patch":
        response = await httpClient.patch(url, options.data, options);
        break;
      case "delete":
        response = await httpClient.delete(url, options);
        break;
      default:
        response = await httpClient.get(url, options);
        break;
    }
    
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function setAuthToken(token: string) {
  httpClient.setAuthToken(token);
}

export default httpClient;