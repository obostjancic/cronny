import axios from "axios";
import { setAuthToken } from "../api/utils";

const AUTH_KEY = "cronny-auth";
let isAuthInitialized = false;

export async function initializeAuth() {
  const password = localStorage.getItem(AUTH_KEY);

  if (!password) {
    isAuthInitialized = false;
    return false;
  }

  try {
    const response = await axios.post(`/api/auth/login`, {
      password,
    });
    const { token } = response.data;

    setAuthToken(token);
    isAuthInitialized = true;
    return true;
  } catch (error) {
    console.error("Auth error:", error);
    isAuthInitialized = false;
    return false;
  }
}

export const isInitialized = () => isAuthInitialized;

export function setAuthPassword(password: string) {
  localStorage.setItem(AUTH_KEY, password);
  return initializeAuth();
}
