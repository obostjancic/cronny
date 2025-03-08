import axios, { AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchJson(url: string, options: AxiosRequestConfig = {}) {
  try {
    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
    const response = await axios(fullUrl, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.message);
    }
    return null;
  }
}

export async function setAuthToken(token: string) {
  console.log("Setting auth token", token);
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
