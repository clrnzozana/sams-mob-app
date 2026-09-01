import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Use the computer's LAN IP when testing on a physical phone.
// Choose ONE of these based on your backend setup:
//
// Option 1: Apache/Nginx with sams-backend virtual host/path:
// export const API_BASE_URL = "http://192.168.1.7/sams-backend";
//
// Option 2: PHP built-in server (run: php -S localhost:8000 in sams-backend folder):
export const API_BASE_URL = "http://192.168.1.7:8000";
//
// To start the PHP dev server, run: npm run start-backend (Windows) or ./start-backend.sh (Mac/Linux)

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Increased to 60 seconds to handle slow connections
  // On poor networks or busy servers, SMTP and DB queries can take time
  const timeoutMs = 60000;
  let timeoutId: NodeJS.Timeout | undefined;
  let abortController: AbortController | undefined;

  try {
    // Use AbortController for timeout if available
    if (typeof AbortController !== "undefined") {
      abortController = new AbortController();
      timeoutId = setTimeout(() => {
        abortController!.abort();
      }, timeoutMs);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...(abortController ? { signal: abortController.signal } : {}),
    });

    if (timeoutId) clearTimeout(timeoutId);

    const payload = (await response.json()) as T & { error?: string };

    if (!response.ok) {
      throw new Error(
        payload.error ?? `Request failed with status ${response.status}.`,
      );
    }

    return payload;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);

    // Handle timeout errors
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          `Network request took too long (>60s). Ensure the backend server is running at ${API_BASE_URL} and your device can reach it on the network.`,
        );
      }
      throw error;
    }

    throw error;
  }
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
