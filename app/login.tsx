import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

        // TODO: replace this with a real API call to your PHP backend once it's ready.
        // For now, any properly-filled form is treated as a successful login,
        // so we can keep testing navigation and screens without a backend yet.
        router.replace('/(tabs)/dashboard');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Log In</Text>
            <Text style={styles.subtitle}>Sign in to your Student Assistant account</Text>

            <Text style={styles.label}>Registered Email</Text>
            <TextInput
                style={styles.input}
                placeholder="you@nu-lipa.edu.ph"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <Text style={styles.link}>Forgot Password?</Text>

            <View style={styles.noteBox}>
                <Text style={styles.noteTitle}>First time logging in?</Text>
                <Text style={styles.noteText}>
                    Use your registered email and Student ID number as your password.
                    You'll be asked to set a new one right after.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#061D5A', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#888', marginBottom: 24 },
    label: { fontSize: 12, color: '#666', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 14 },
    errorText: { color: '#D64545', fontSize: 12, marginTop: 10 },
    button: { backgroundColor: '#F4B333', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
    buttonText: { color: '#061D5A', fontWeight: 'bold', fontSize: 14 },
    link: { textAlign: 'center', color: '#061D5A', marginTop: 16, fontSize: 12 },
    noteBox: { backgroundColor: '#F4F6FA', borderRadius: 8, padding: 14, marginTop: 28 },
    noteTitle: { fontSize: 12, fontWeight: 'bold', color: '#061D5A', marginBottom: 4 },
    noteText: { fontSize: 11, color: '#666', lineHeight: 16 },
});