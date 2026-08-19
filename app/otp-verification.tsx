import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function OtpVerificationScreen() {
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleChange = (text: string, index: number) => {
        const clean = text.replace(/[^0-9]/g, '');
        if (!clean) {
            const next = [...digits];
            next[index] = '';
            setDigits(next);
            return;
        }
        const next = [...digits];
        next[index] = clean[clean.length - 1];
        setDigits(next);

        if (index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        setError('');
        const code = digits.join('');

        if (code.length !== CODE_LENGTH) {
            setError('Please enter the full 6-digit code.');
            return;
        }

        // TODO: replace with a real API call verifying the code against the backend.
        // For now, any complete 6-digit code is treated as valid so we can keep
        // testing the flow without a live email/OTP backend yet.
        router.replace('/(tabs)/dashboard');
    };

    const handleResend = () => {
        if (cooldown > 0) return;
        // TODO: trigger a real resend request to the backend once available
        setCooldown(RESEND_COOLDOWN);
        Alert.alert('Code resent', 'A new code has been sent to your registered email.');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#003087" />

            <View style={styles.header}>
                <View style={styles.iconBadge}>
                    <ShieldCheck size={22} color="#ffb81c" />
                </View>
                <Text style={styles.headerTitle}>Verify Your Email</Text>
                <Text style={styles.headerSub}>
                    We noticed this is a new device. Enter the 6-digit code sent to your registered email
                    to continue.
                </Text>
            </View>

            <View style={styles.body}>
                {error ? (
                    <View style={styles.alertBox}>
                        <Text style={styles.alertText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.codeRow}>
                    {digits.map((d, i) => (
                        <TextInput
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            style={[styles.codeBox, d ? styles.codeBoxFilled : null]}
                            value={d}
                            onChangeText={(text) => handleChange(text, i)}
                            onKeyPress={(e) => handleKeyPress(e, i)}
                            keyboardType="number-pad"
                            maxLength={1}
                            textAlign="center"
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleVerify}>
                    <Text style={styles.submitBtnText}>Verify</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResend} disabled={cooldown > 0} style={styles.resendWrap}>
                    <Text style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}>
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 24 }}>
                    <Text style={styles.backText}>← Back to Log In</Text>
                </TouchableOpacity>

                <View style={styles.noteBox}>
                    <Text style={styles.noteText}>
                        This step only appears when logging in from a device that hasn't been used on this
                        account before. Once verified, this device stays signed in until you log out.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#003087' },

    header: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 30, paddingBottom: 30 },
    iconBadge: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 19, color: '#fff', marginBottom: 8 },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#dbeafe', textAlign: 'center', lineHeight: 18 },

    body: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },

    alertBox: { width: '100%', backgroundColor: '#fee2e2', borderRadius: 8, padding: 10, marginBottom: 18 },
    alertText: { fontFamily: 'Inter_600SemiBold', fontSize: 11.5, color: '#991b1b', textAlign: 'center' },

    codeRow: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 26 },
    codeBox: { width: 44, height: 54, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10, fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#101828' },
    codeBoxFilled: { borderColor: '#003087', backgroundColor: '#eff6ff' },

    submitBtn: { width: '100%', height: 48, backgroundColor: '#ffb81c', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#003087' },

    resendWrap: { marginTop: 18 },
    resendText: { fontFamily: 'Inter_700Bold', fontSize: 12.5, color: '#003087' },
    resendTextDisabled: { color: '#99a1af' },

    backText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#4a5565' },

    noteBox: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 14, marginTop: 30, width: '100%' },
    noteText: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#4a5565', lineHeight: 15, textAlign: 'center' },
});