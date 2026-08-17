import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';

const records = [
    { date: 'Aug 8', in: '1:02 PM', out: '4:01 PM', status: 'active' },
    { date: 'Aug 7', in: '1:20 PM', out: '4:00 PM', status: 'late' },
    { date: 'Aug 6', in: null, out: null, status: 'absent' },
    { date: 'Aug 5', in: '8:58 AM', out: '12:00 PM', status: 'active' },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: '#E6F4EA', text: '#1F7A46', label: 'Active' },
    late: { bg: '#FFF4DA', text: '#A67300', label: 'Late' },
    absent: { bg: '#F1F2F6', text: '#9AA1B4', label: 'Absent' },
};

export default function AttendanceScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#061D5A" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Attendance</Text>
                    <Text style={styles.headerSub}>Recorded via SDAO Reader Terminal</Text>
                </View>

                <View style={styles.body}>
                    <View style={styles.listCard}>
                        {records.map((r, i) => {
                            const s = statusStyles[r.status];
                            return (
                                <View
                                    key={r.date}
                                    style={[styles.row, i === records.length - 1 && { borderBottomWidth: 0 }]}
                                >
                                    <View>
                                        <Text style={styles.rowMain}>
                                            {r.date} {r.in ? `— ${r.in}` : '— No record'}
                                        </Text>
                                        <Text style={styles.rowSub}>
                                            {r.out ? `Out ${r.out}` : 'Duty not fulfilled'}
                                        </Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                                        <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
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
    body: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: 600 },
    listCard: { backgroundColor: '#F4F6FA', borderRadius: 14, paddingHorizontal: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E7EAF2' },
    rowMain: { fontFamily: 'Inter_600SemiBold', fontSize: 12.5, color: '#061D5A' },
    rowSub: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#94A3B8', marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontFamily: 'Inter_700Bold', fontSize: 9.5 },
});