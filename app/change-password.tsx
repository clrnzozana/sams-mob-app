import { authenticatedRequest, clearAuthToken } from "@/constants/api";
import { router } from "expo-router";
import { Lock } from "lucide-react-native";
import React, { useState } from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authenticatedRequest("/api/mobile/change-password.php", {
        method: "POST",
        body: JSON.stringify({ new_password: newPassword }),
      });
      await clearAuthToken();
      router.replace("/login");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to change your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#003087" />
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Lock size={22} color="#ffb81c" />
        </View>
        <Text style={styles.title}>Create a New Password</Text>
        <Text style={styles.subtitle}>
          Choose a password with at least 8 characters to continue.
        </Text>
      </View>
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Enter a new password"
          placeholderTextColor="#98a2b3"
        />
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={confirmation}
          onChangeText={setConfirmation}
          secureTextEntry
          placeholder="Repeat your new password"
          placeholderTextColor="#98a2b3"
        />
        <TouchableOpacity
          style={[styles.submit, isSubmitting && styles.disabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#003087" },
  header: { alignItems: "center", padding: 28 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 14,
  },
  title: { fontFamily: "Poppins_700Bold", fontSize: 20, color: "#fff" },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#dbeafe",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  error: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#344054",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    color: "#101828",
  },
  submit: {
    height: 48,
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: "#ffb81c",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.6 },
  submitText: { fontFamily: "Inter_700Bold", color: "#003087" },
});
