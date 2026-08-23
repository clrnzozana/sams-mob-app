import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function ApiState({
  loading,
  error,
}: {
  loading: boolean;
  error: string | null;
}) {
  if (!loading && !error) return null;

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#003087" /> : null}
      <Text style={styles.text}>
        {loading ? "Loading your data..." : error}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: { marginTop: 12, color: "#475467", fontSize: 13, textAlign: "center" },
});
