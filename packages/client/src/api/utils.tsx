import axios, { AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchJson(url: string, options: AxiosRequestConfig = {}) {
  try {
    const response = await axios(`${API_URL}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function setAuthToken(token: string) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
