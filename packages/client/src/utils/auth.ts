import { httpClient } from "../api/client";

const AUTH_KEY = "cronny-auth";
let isAuthInitialized = false;

export async function initializeAuth() {
  const password = localStorage.getItem(AUTH_KEY);

  if (!password) {
    isAuthInitialized = false;
    return false;
  }

  try {
    const response = await httpClient.post<{ token: string }>(`/api/auth/login`, {
      password,
    });
    const { token } = response;

    httpClient.setAuthToken(token);
    isAuthInitialized = true;
    return true;
  } catch {
    isAuthInitialized = false;
    return false;
  }
}

export const isInitialized = () => isAuthInitialized;

export function setAuthPassword(password: string) {
  localStorage.setItem(AUTH_KEY, password);
  return initializeAuth();
}
