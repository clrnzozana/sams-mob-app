import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Clock, Calendar, CheckCircle2, Hourglass, Sparkles, Bell, Briefcase, ArrowRight } from 'lucide-react-native';

// ---- Mock data (replace with real API data later) ----
const student = { name: 'Juan Dela Cruz', office: 'Library' };
const stats = { totalHours: 38.0, upcomingDuties: 8, acceptedDuties: 8, pendingResponses: 0 };
const todaySchedule = null; // set to an object like { time: '8:00 AM - 12:00 PM', office: 'Library' } to test the non-empty state
const nextDuty = { day: 'Wednesday', time: '8:00 AM' };
const scheduleProgress = { acceptedRate: 100, responseRate: 100, pendingLoad: 0 };
const attendanceSnapshot = { rate: 0, present: 0, late: 0, absent: 31, incomplete: 0 };

function ProgressRow({ label, value, valueLabel, color }: { label: string; value: number; valueLabel: string; color: string }) {
    return (
        <View style={{ marginBottom: 14 }}>
            <View style={styles.progressMeta}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={[styles.progressValue, { color }]}>{valueLabel}</Text>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

export default function DashboardScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#003087" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Welcome back, {student.name}! 👋</Text>
                    <Text style={styles.headerSub}>Here's what's happening with your duties today</Text>
                </View>

                <View style={styles.body}>
                    {/* Assignment Overview panel */}
                    <View style={styles.overviewPanel}>
                        <Text style={styles.overviewLabel}>ASSIGNMENT OVERVIEW</Text>

                        <View style={styles.overviewSubCard}>
                            <View style={styles.rowCenter}>
                                <Briefcase size={14} color="#ffb81c" />
                                <Text style={styles.overviewSubLabel}>CURRENT ASSIGNMENT</Text>
                            </View>
                            <Text style={styles.overviewSubValue}>{student.office}</Text>
                        </View>

                        <View style={styles.overviewSubCard}>
                            <Text style={styles.overviewSubLabel}>HOURS SUMMARY</Text>
                            <Text style={styles.overviewSubValue}>{stats.totalHours.toFixed(1)} hrs</Text>
                            <Text style={styles.overviewSubHint}>Rendered duty hours logged from your attendance records.</Text>
                        </View>

                        <View style={[styles.overviewSubCard, { marginBottom: 0 }]}>
                            <View style={styles.rowCenter}>
                                <Bell size={14} color="#ffb81c" />
                                <Text style={styles.overviewSubLabel}>NOTIFICATIONS</Text>
                            </View>
                            <Text style={styles.overviewSubValue}>0 items</Text>
                        </View>
                    </View>

                    {/* 4 Stat cards */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                                <Clock size={16} color="#155dfc" />
                            </View>
                            <Text style={styles.statValue}>{stats.totalHours.toFixed(1)} hrs</Text>
                            <Text style={styles.statLabel}>Total Hours</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#fffbeb' }]}>
                                <Calendar size={16} color="#e17100" />
                            </View>
                            <Text style={styles.statValue}>{stats.upcomingDuties}</Text>
                            <Text style={styles.statLabel}>Upcoming Duties</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                                <CheckCircle2 size={16} color="#00a63e" />
                            </View>
                            <Text style={styles.statValue}>{stats.acceptedDuties}</Text>
                            <Text style={styles.statLabel}>Accepted Duties</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
                                <Hourglass size={16} color="#9810fa" />
                            </View>
                            <Text style={styles.statValue}>{stats.pendingResponses}</Text>
                            <Text style={styles.statLabel}>Pending Responses</Text>
                        </View>
                    </View>

                    {/* Today's Schedule */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <Text style={styles.cardHeading}>Today's Schedule</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
                                <Text style={styles.cardLink}>View Full Schedule →</Text>
                            </TouchableOpacity>
                        </View>

                        {todaySchedule ? (
                            <View style={styles.dutyItem}>
                                <View style={styles.dutyIconWrap}>
                                    <Calendar size={16} color="#003087" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.dutyDay}>Today</Text>
                                    <Text style={styles.dutyTime}>{(todaySchedule as any).time}</Text>
                                </View>
                                <Text style={styles.dutyOffice}>{(todaySchedule as any).office}</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Sparkles size={26} color="#ffb81c" />
                                <Text style={styles.emptyTitle}>No Duty Today! 🎉</Text>
                                <Text style={styles.emptySub}>
                                    {nextDuty ? `Your next duty is ${nextDuty.day}, ${nextDuty.time}.` : 'Enjoy your free day.'}
                                </Text>
                                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/schedule')}>
                                    <Text style={styles.emptyBtnText}>View Schedule</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.card}>
                        <Text style={[styles.cardHeading, { marginBottom: 14 }]}>Quick Actions</Text>
                        <View style={styles.quickActionsRow}>
                            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/schedule')}>
                                <View style={[styles.quickActionIcon, { backgroundColor: '#dbeafe' }]}>
                                    <Calendar size={18} color="#155dfc" />
                                </View>
                                <Text style={styles.quickActionLabel}>View Schedule</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/profile')}>
                                <View style={[styles.quickActionIcon, { backgroundColor: '#f3e8ff' }]}>
                                    <Briefcase size={18} color="#9810fa" />
                                </View>
                                <Text style={styles.quickActionLabel}>My Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Schedule Progress */}
                    <View style={styles.card}>
                        <Text style={[styles.cardHeadingSm, { marginBottom: 14 }]}>Schedule Progress</Text>
                        <ProgressRow label="Accepted Rate" value={scheduleProgress.acceptedRate} valueLabel={`${scheduleProgress.acceptedRate}%`} color="#00a63e" />
                        <ProgressRow label="Responded Rate" value={scheduleProgress.responseRate} valueLabel={`${scheduleProgress.responseRate}%`} color="#155dfc" />
                        <ProgressRow label="Pending Load" value={scheduleProgress.pendingLoad} valueLabel={`${scheduleProgress.pendingLoad} duty(s)`} color="#9810fa" />
                    </View>

                    {/* Attendance Snapshot */}
                    <View style={styles.card}>
                        <Text style={[styles.cardHeadingSm, { marginBottom: 14 }]}>Attendance Snapshot</Text>
                        <ProgressRow label="Attendance Rate" value={attendanceSnapshot.rate} valueLabel={`${attendanceSnapshot.rate}%`} color="#00a63e" />
                        <ProgressRow
                            label="Present / Late"
                            value={0}
                            valueLabel={`${attendanceSnapshot.present} / ${attendanceSnapshot.late}`}
                            color="#155dfc"
                        />
                        <ProgressRow
                            label="Absent / Incomplete"
                            value={0}
                            valueLabel={`${attendanceSnapshot.absent} / ${attendanceSnapshot.incomplete}`}
                            color="#9810fa"
                        />
                        <Text style={styles.lastLogText}>No attendance logs recorded yet.</Text>
                        <TouchableOpacity style={styles.reportBtn} onPress={() => router.push('/(tabs)/attendance')}>
                            <Text style={styles.reportBtnText}>Open duty-hour report</Text>
                            <ArrowRight size={14} color="#003087" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#003087' },
    header: { backgroundColor: '#003087', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 22 },
    greeting: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#fff' },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
    body: { backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, minHeight: 900 },
    rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },

    overviewPanel: { backgroundColor: '#003087', borderRadius: 16, padding: 16, marginBottom: 14 },
    overviewLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#ffb81c', letterSpacing: 0.6, marginBottom: 12 },
    overviewSubCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, marginBottom: 10 },
    overviewSubLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9.5, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.4 },
    overviewSubValue: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#fff', marginTop: 4 },
    overviewSubHint: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
    statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#f3f4f6' },
    statIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#101828' },
    statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#4a5565', marginTop: 2 },

    card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f3f4f6' },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardHeading: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#101828' },
    cardHeadingSm: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#101828' },
    cardLink: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#003087' },

    dutyItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', borderRadius: 10, padding: 10 },
    dutyIconWrap: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    dutyDay: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#101828' },
    dutyTime: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#4a5565' },
    dutyOffice: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#003087' },

    emptyState: { alignItems: 'center', paddingVertical: 14 },
    emptyTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#101828', marginTop: 8 },
    emptySub: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#4a5565', marginTop: 4, textAlign: 'center' },
    emptyBtn: { marginTop: 12, backgroundColor: '#003087', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
    emptyBtnText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: '#fff' },

    quickActionsRow: { flexDirection: 'row', gap: 10 },
    quickAction: { flex: 1, alignItems: 'center', gap: 8, backgroundColor: '#f9fafb', borderRadius: 12, paddingVertical: 14 },
    quickActionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    quickActionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10.5, color: '#101828' },

    progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#4a5565' },
    progressValue: { fontFamily: 'Inter_700Bold', fontSize: 11.5 },
    progressTrack: { height: 7, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },

    lastLogText: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#364153', marginTop: 4, marginBottom: 10 },
    reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
    reportBtnText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: '#003087' },
});