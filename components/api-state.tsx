import { router } from "expo-router";
import { AlertCircle, LogIn, RotateCcw } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ApiState({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  if (!loading && !error) return null;

  const isAuthError =
    error !== null &&
    (error.toLowerCase().includes("session") ||
      error.toLowerCase().includes("log in") ||
      error.toLowerCase().includes("authentication") ||
      error.includes("401"));

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#061D5A" />
          <Text style={styles.text}>Loading your data...</Text>
        </>
      ) : (
        <>
          <View style={styles.errorIconWrap}>
            <AlertCircle size={28} color="#D92D20" />
          </View>
          <Text style={styles.errorTitle}>
            {isAuthError ? "Session Expired" : "Unable to Load Data"}
          </Text>
          <Text style={styles.text}>{error}</Text>
          <View style={styles.actionRow}>
            {isAuthError ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.replace("/login")}
                activeOpacity={0.8}
              >
                <LogIn size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Log In Again</Text>
              </TouchableOpacity>
            ) : onRetry ? (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color="#061D5A" style={{ marginRight: 6 }} />
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEE4E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 6,
    textAlign: "center",
  },
  text: {
    color: "#475467",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
  actionRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#061D5A",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAECF0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#061D5A",
    fontSize: 14,
    fontWeight: "600",
  },
});
