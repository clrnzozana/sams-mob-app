import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
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
