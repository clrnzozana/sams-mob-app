import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Use the computer's LAN IP when testing on a physical phone.
export const API_BASE_URL = "http://192.168.1.7/sams-backend";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(
      payload.error ?? `Request failed with status ${response.status}.`,
    );
  }

  return payload;
}

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.setItem("sams_auth_token", token);
    return;
  }

  await SecureStore.setItemAsync("sams_auth_token", token);
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return window.localStorage.getItem("sams_auth_token");
  }

  return SecureStore.getItemAsync("sams_auth_token");
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.removeItem("sams_auth_token");
    return;
  }

  await SecureStore.deleteItemAsync("sams_auth_token");
}

export async function authenticatedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Please log in again.");
  }

  return apiRequest<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
