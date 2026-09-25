import { onSessionExpired } from "@/constants/api";
import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import { Alert } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      router.replace("/login");
      Alert.alert(
        "Session Expired",
        "Your session has expired. Please log in again to continue.",
      );
    });
    return unsubscribe;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="landingpage" />
      <Stack.Screen name="login" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
