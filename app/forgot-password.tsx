import { apiRequest } from "@/constants/api";
import { router } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid institutional email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ message: string }>(
        "/api/mobile/request-password-reset.php",
        {
          method: "POST",
          body: JSON.stringify({ email: email.trim() }),
        },
      );
      setMessage(result.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to request a password reset.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#003087" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your institutional email to receive a reset link.
        </Text>
      </View>
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Text style={styles.label}>Institutional Email</Text>
        <View style={styles.inputWrap}>
          <Mail size={18} color="#94a3b8" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@nu-lipa.edu.ph"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <TouchableOpacity
          style={styles.submit}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#003087" },
  header: { padding: 24, paddingTop: 12 },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontFamily: "Poppins_700Bold", fontSize: 22, color: "#fff" },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#dbeafe",
    marginTop: 6,
    lineHeight: 19,
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
  message: {
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#344054",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: "Inter_400Regular",
    color: "#101828",
  },
  submit: {
    height: 48,
    marginTop: 22,
    borderRadius: 10,
    backgroundColor: "#f4b333",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontFamily: "Inter_700Bold", color: "#003087" },
});
