import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const fields = [
    { label: 'Student ID', value: '2023-04521' },
    { label: 'Program', value: 'BSIT-MWA' },
    { label: 'Skills', value: 'Data Encoding, +3' },
    { label: 'Contact No.', value: '0917 000 0000' },
];

export default function ProfileScreen() {
    const handleLogout = () => {
        // TODO: clear session/token once auth is wired up
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#061D5A" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <Text style={styles.headerSub}>Your account details</Text>
                </View>

                <View style={styles.body}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>JD</Text>
                    </View>
                    <Text style={styles.name}>Juan Dela Cruz</Text>
                    <Text style={styles.role}>Student Assistant · Registrar's Office</Text>

                    <View style={styles.fieldsCard}>
                        {fields.map((f, i) => (
                            <View
                                key={f.label}
                                style={[styles.fieldRow, i === fields.length - 1 && { borderBottomWidth: 0 }]}
                            >
                                <Text style={styles.fieldLabel}>{f.label}</Text>
                                <Text style={styles.fieldValue}>{f.value}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.outlineBtn}>
                        <Text style={styles.outlineBtnText}>Edit Limited Fields</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.outlineBtn} onPress={handleLogout}>
                        <Text style={styles.outlineBtnText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#061D5A' },
    header: { backgroundColor: '#061D5A', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 22 },
    title: { fontFamily: 'Poppins_700Bold', fontSize: 19, color: '#fff' },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    body: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: 600, alignItems: 'center' },
    avatar: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#061D5A', borderWidth: 3, borderColor: '#F4B333', alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 12 },
    avatarText: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#fff' },
    name: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#061D5A' },
    role: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#94A3B8', marginTop: 2, marginBottom: 20 },
    fieldsCard: { width: '100%', backgroundColor: '#F4F6FA', borderRadius: 14, paddingHorizontal: 16, marginBottom: 22 },
    fieldRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#E7EAF2' },
    fieldLabel: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#94A3B8' },
    fieldValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#061D5A' },
    outlineBtn: { width: '100%', height: 46, borderWidth: 1.5, borderColor: '#061D5A', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    outlineBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#061D5A' },
});