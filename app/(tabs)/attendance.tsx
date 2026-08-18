import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';

interface LogEntry {
    date: string;
    timeIn: string | null;
    timeOut: string | null;
    hours: number;
    status: 'present' | 'late' | 'absent';
}

// Mock data — replace with real query results once the backend is ready
const logs: LogEntry[] = [
    { date: 'Aug 12, 2026', timeIn: null, timeOut: null, hours: 0, status: 'absent' },
    { date: 'Aug 11, 2026', timeIn: null, timeOut: null, hours: 0, status: 'absent' },
    { date: 'Aug 10, 2026', timeIn: null, timeOut: null, hours: 0, status: 'absent' },
    { date: 'Aug 8, 2026', timeIn: '1:02 PM', timeOut: '4:01 PM', hours: 3, status: 'present' },
    { date: 'Aug 7, 2026', timeIn: '1:20 PM', timeOut: '4:00 PM', hours: 2.7, status: 'late' },
];

const summary = {
    renderedHours: logs.reduce((sum, l) => sum + l.hours, 0),
    active: logs.filter((l) => l.status === 'present').length,
    late: logs.filter((l) => l.status === 'late').length,
    absent: logs.filter((l) => l.status === 'absent').length,
    termLabel: 'Spring 2026',
    totalRecords: logs.length,
};

// Exact colors from attendance_history.php's badge--* classes
const statusStyle: Record<LogEntry['status'], { bg: string; text: string; label: string }> = {
    present: { bg: '#dcfce7', text: '#166534', label: 'Present' },
    late: { bg: '#fffbeb', text: '#92400e', label: 'Late' },
    absent: { bg: '#fee2e2', text: '#991b1b', label: 'Absent' },
};

export default function AttendanceScreen() {
    const latestLog = logs[0];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#003087" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Overview hero — matches .overview-card */}
                <View style={styles.hero}>
                    <Text style={styles.heroEyebrow}>📊 Individual duty-hour report</Text>
                    <Text style={styles.heroTitle}>Juan Dela Cruz</Text>
                    <Text style={styles.heroDesc}>
                        This report shows your rendered duty hours for the term and an attendance summary
                        limited to Active, Late, and Absent counts. Evaluation data is intentionally excluded.
                    </Text>
                    <View style={styles.chipRow}>
                        <View style={styles.chip}><Text style={styles.chipText}>📈 Rendered hours</Text></View>
                        <View style={styles.chip}><Text style={styles.chipText}>📋 Attendance summary</Text></View>
                        <View style={styles.chip}><Text style={styles.chipText}>🔒 No evaluation data</Text></View>
                        <View style={styles.chip}><Text style={styles.chipText}>📅 {summary.termLabel}</Text></View>
                    </View>
                </View>

                <View style={styles.body}>
                    {/* 4 metric cards — matches .overview-grid */}
                    <View style={styles.metricsGrid}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>📌 Rendered Hours</Text>
                            <Text style={[styles.metricValue, { color: '#003087' }]}>{summary.renderedHours.toFixed(1)} hrs</Text>
                            <Text style={styles.metricSub}>Total rendered time from your attendance logs.</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>✓ Active (Present)</Text>
                            <Text style={[styles.metricValue, { color: '#00a63e' }]}>{summary.active}</Text>
                            <Text style={styles.metricSub}>Successfully clocked in on time.</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>⏰ Late</Text>
                            <Text style={[styles.metricValue, { color: '#e17100' }]}>{summary.late}</Text>
                            <Text style={styles.metricSub}>Clocked in after grace period.</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>✗ Absent</Text>
                            <Text style={[styles.metricValue, { color: '#fb2c36' }]}>{summary.absent}</Text>
                            <Text style={styles.metricSub}>No clock-in by schedule end.</Text>
                        </View>
                    </View>

                    {/* Attendance Summary card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Attendance Summary</Text>
                        <View style={styles.noteRow}>
                            <View style={styles.pill}><Text style={styles.pillText}>Current term</Text></View>
                            <Text style={styles.noteStrong}>{summary.termLabel}</Text>
                        </View>
                        <View style={styles.noteRow}>
                            <View style={styles.pill}><Text style={styles.pillText}>Latest log</Text></View>
                            <Text style={styles.noteText}>{latestLog.status === 'absent' ? 'Absent' : 'Present'} on {latestLog.date}</Text>
                        </View>
                        <View style={styles.noteRow}>
                            <View style={styles.pill}><Text style={styles.pillText}>Total records</Text></View>
                            <Text style={styles.noteStrong}>{summary.totalRecords} logs</Text>
                        </View>
                    </View>

                    {/* Recent Attendance Logs — Date / Time In / Time Out / Status only, per MAA-05 (no Remarks) */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Recent Attendance Logs</Text>
                        <Text style={styles.cardSub}>Your attendance records for the current term.</Text>

                        {logs.map((log, i) => {
                            const s = statusStyle[log.status];
                            return (
                                <View key={log.date} style={[styles.logRow, i === logs.length - 1 && { borderBottomWidth: 0 }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.logDate}>{log.date}</Text>
                                        <Text style={styles.logTimes}>
                                            {log.timeIn ?? '-'} → {log.timeOut ?? '-'}
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
    safeArea: { flex: 1, backgroundColor: '#003087' },

    hero: { backgroundColor: '#003087', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20 },
    heroEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#ffb81c' },
    heroTitle: { fontFamily: 'Poppins_700Bold', fontSize: 19, color: '#fff', marginTop: 6 },
    heroDesc: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 17 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    chip: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
    chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 9.5, color: '#fff' },

    body: { backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, minHeight: 700 },

    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
    metricCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#f3f4f6' },
    metricLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#4a5565' },
    metricValue: { fontFamily: 'Poppins_700Bold', fontSize: 20, marginTop: 6 },
    metricSub: { fontFamily: 'Inter_400Regular', fontSize: 9.5, color: '#99a1af', marginTop: 4, lineHeight: 13 },

    card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f3f4f6' },
    cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#101828' },
    cardSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#99a1af', marginTop: 2, marginBottom: 10 },

    noteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
    pill: { backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    pillText: { fontFamily: 'Inter_700Bold', fontSize: 9.5, color: '#003087' },
    noteStrong: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#101828' },
    noteText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#364153' },

    logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    logDate: { fontFamily: 'Inter_700Bold', fontSize: 12.5, color: '#101828' },
    logTimes: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#4a5565', marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    badgeText: { fontFamily: 'Inter_700Bold', fontSize: 10.5 },
});