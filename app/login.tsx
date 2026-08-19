import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowLeft,
    ArrowRight,
    Check,
    Info,
    GraduationCap,
} from 'lucide-react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
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

        // On success, navigate to OTP step
        router.push('/otp-verification');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#003087" />
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTopBar}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.backBtn}
                                activeOpacity={0.7}
                            >
                                <ArrowLeft size={18} color="#ffffff" />
                            </TouchableOpacity>
                            <View style={styles.headerLogoPill}>
                                <GraduationCap size={16} color="#003087" />
                                <Text style={styles.headerLogoText}>NU SAMS</Text>
                            </View>
                        </View>

                        <Text style={styles.headerTitle}>Log In</Text>
                        <Text style={styles.headerSub}>
                            Enter your institutional credentials to access your duties
                        </Text>
                    </View>

                    {/* Responsive Form Body (Fills all remaining vertical space) */}
                    <View style={styles.formCard}>
                        {error ? (
                            <View style={styles.alertBox}>
                                <Text style={styles.alertText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Email Input */}
                        <Text style={styles.label}>Institutional Email</Text>
                        <View style={styles.inputWrap}>
                            <Mail size={18} color="#94a3b8" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="you@nu-lipa.edu.ph"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password Input */}
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrap}>
                            <Lock size={18} color="#94a3b8" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter your password"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword((v) => !v)}
                                style={styles.eyeBtn}
                                activeOpacity={0.7}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} color="#94a3b8" />
                                ) : (
                                    <Eye size={18} color="#94a3b8" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Remember Me & Forgot Password */}
                        <View style={styles.formRow}>
                            <TouchableOpacity
                                style={styles.rememberRow}
                                onPress={() => setRememberMe(!rememberMe)}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        rememberMe && styles.checkboxActive,
                                    ]}
                                >
                                    {rememberMe && <Check size={12} color="#ffffff" />}
                                </View>
                                <Text style={styles.rememberText}>Remember me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {}}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleLogin}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.submitBtnText}>Log In</Text>
                            <ArrowRight size={16} color="#003087" />
                        </TouchableOpacity>

                        {/* Helper Note Box */}
                        <View style={styles.noteBox}>
                            <View style={styles.noteHeader}>
                                <Info size={15} color="#003087" />
                                <Text style={styles.noteTitle}>First time logging in?</Text>
                            </View>
                            <Text style={styles.noteText}>
                                Use your registered university email and Student ID number as
                                your default password. You will be prompted to verify via OTP.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#003087',
    },
    keyboardAvoid: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#003087',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: '#003087',
        paddingHorizontal: 22,
        paddingTop: 8,
        paddingBottom: 22,
    },
    headerTopBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLogoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f4b333',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    headerLogoText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        color: '#003087',
    },
    headerTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 22,
        color: '#ffffff',
    },
    headerSub: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12.5,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
        lineHeight: 18,
    },

    /* Form Body */
    formCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 36,
    },
    alertBox: {
        backgroundColor: '#fee2e2',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    alertText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: '#991b1b',
    },

    label: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: '#334155',
        marginBottom: 6,
        marginTop: 12,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 14,
        gap: 10,
        backgroundColor: '#f8fafc',
    },
    textInput: {
        flex: 1,
        fontFamily: 'Inter_400Regular',
        fontSize: 13.5,
        color: '#0f172a',
    },
    eyeBtn: {
        padding: 4,
    },

    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    checkboxActive: {
        backgroundColor: '#003087',
        borderColor: '#003087',
    },
    rememberText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: '#475569',
    },
    forgotText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 12,
        color: '#003087',
    },

    submitBtn: {
        height: 50,
        backgroundColor: '#f4b333',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#f4b333',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    submitBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
        color: '#003087',
    },

    noteBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    noteTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 12,
        color: '#003087',
    },
    noteText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11.5,
        color: '#64748b',
        lineHeight: 16,
    },
});