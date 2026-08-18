import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = () => {
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please enter both your email and password.');
            return;
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        // TODO: replace with a real API call to login.php's backend logic.
        // Real flow also requires an OTP verification step on a new device —
        // once the API is ready, this should navigate to an OTP screen first,
        // not straight to the dashboard.
        router.replace('/(tabs)/dashboard');
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#061D5A" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                {/* Simple header, matching the other tab screens */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Log In</Text>
                    <Text style={styles.headerSub}>Enter your email to access SAMS</Text>
                </View>

                {/* Login form card */}
                <View style={[styles.formCard, { paddingBottom: Math.max(36, insets.bottom + 20) }]}>
                    {error ? (
                        <View style={styles.alertBox}>
                            <Text style={styles.alertText}>{error}</Text>
                        </View>
                    ) : null}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@nu-lipa.edu.ph"
                        placeholderTextColor="#99a1af"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordWrap}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
                            placeholderTextColor="#99a1af"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                            {showPassword ? <EyeOff size={17} color="#99a1af" /> : <Eye size={17} color="#99a1af" />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formRow}>
                        <Text style={styles.rememberText}>Remember me</Text>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleLogin}>
                        <Text style={styles.submitBtnText}>Log In</Text>
                    </TouchableOpacity>

                    <View style={styles.noteBox}>
                        <Text style={styles.noteTitle}>First time logging in?</Text>
                        <Text style={styles.noteText}>
                            Use your registered email and Student ID number as your password.
                            You'll be asked to set a new one right after.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#061D5A' },
    scrollContent: { flexGrow: 1 },

    header: { backgroundColor: '#061D5A', paddingHorizontal: 22, paddingTop: 6, paddingBottom: 22 },
    headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 19, color: '#fff' },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

    formCard: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },

    alertBox: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 10, marginBottom: 14 },
    alertText: { fontFamily: 'Inter_600SemiBold', fontSize: 11.5, color: '#991b1b' },

    label: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#364153', marginBottom: 6, marginTop: 12 },
    input: { height: 46, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 0, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#101828', justifyContent: 'center' },
    passwordWrap: { flexDirection: 'row', alignItems: 'center', height: 46, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14 },
    passwordInput: { flex: 1, height: '100%', paddingVertical: 0, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#101828' },
    eyeBtn: { padding: 4, justifyContent: 'center', alignItems: 'center' },

    formRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 22 },
    rememberText: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#4a5565' },
    forgotText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: '#003087' },

    submitBtn: { height: 48, backgroundColor: '#ffb81c', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#003087' },

    noteBox: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 14, marginTop: 22 },
    noteTitle: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: '#101828', marginBottom: 4 },
    noteText: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#4a5565', lineHeight: 15 },
});