import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="landingpage" />
      <Stack.Screen name="login" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}