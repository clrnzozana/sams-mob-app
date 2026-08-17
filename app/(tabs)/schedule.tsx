import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';

type ScheduleStatus = 'pending' | 'accepted' | 'declined' | 'deployed';

interface ScheduleEntry {
    id: number;
    day: string;      // must match one of DAYS below for calendar placement
    date: string;
    timeStart: string; // 24h "HH:mm" for math
    timeEnd: string;
    timeStartLabel: string;
    timeEndLabel: string;
    office: string;
    hours: number;
    status: ScheduleStatus;
    isTodayOrDeployed: boolean;
}

const initialSchedule: ScheduleEntry[] = [
    { id: 1, day: 'Monday', date: 'Aug 18', timeStart: '08:00', timeEnd: '12:00', timeStartLabel: '8:00 AM', timeEndLabel: '12:00 PM', office: 'Library', hours: 4, status: 'deployed', isTodayOrDeployed: true },
    { id: 2, day: 'Wednesday', date: 'Aug 20', timeStart: '08:00', timeEnd: '12:00', timeStartLabel: '8:00 AM', timeEndLabel: '12:00 PM', office: 'Library', hours: 4, status: 'accepted', isTodayOrDeployed: false },
    { id: 3, day: 'Friday', date: 'Aug 22', timeStart: '13:00', timeEnd: '20:00', timeStartLabel: '1:00 PM', timeEndLabel: '8:00 PM', office: 'Library', hours: 7, status: 'pending', isTodayOrDeployed: false },
    { id: 4, day: 'Saturday', date: 'Aug 23', timeStart: '08:00', timeEnd: '12:00', timeStartLabel: '8:00 AM', timeEndLabel: '12:00 PM', office: 'Library', hours: 4, status: 'pending', isTodayOrDeployed: false },
];

// Exact colors from the real web app's schedule.php status logic
const statusStyle: Record<ScheduleStatus, { bg: string; text: string; icon: string; label: string }> = {
    deployed: { bg: '#dbeafe', text: '#1d4ed8', icon: '🚀', label: 'Deployed' },
    accepted: { bg: '#dcfce7', text: '#166534', icon: '✓', label: 'Accepted' },
    declined: { bg: '#fee2e2', text: '#991b1b', icon: '✕', label: 'Declined' },
    pending: { bg: '#fffbeb', text: '#d97706', icon: '⏳', label: 'Pending' },
};

// Calendar event colors — matches cal-event--pending/accepted/deployed exactly (declined isn't shown on the grid)
const calEventStyle: Record<string, { bg: string; border: string; text: string }> = {
    pending: { bg: '#fff1f2', border: '#fda4af', text: '#9f1239' },
    accepted: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    deployed: { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = ['7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'];
const ROW_H = 56;         // scaled down from web's 64px to fit mobile better, same proportions
const TIME_COL_W = 52;
const DAY_COL_W = 118;

const student = { name: 'Juan Dela Cruz', id: '2021-1' };
const weekRangeLabel = 'Aug 18 - Aug 23, 2026';
const scheduledDays = 4; // count of distinct accepted/deployed days this week

function timeToRow(hhmm: string) {
    const [h, m] = hhmm.split(':').map(Number);
    return (h - 7) + m / 60; // 7AM = row 0
}

export default function ScheduleScreen() {
    const [schedule, setSchedule] = useState<ScheduleEntry[]>(initialSchedule);
    const [view, setView] = useState<'calendar' | 'list'>('calendar');

    const respondToSchedule = (id: number, newStatus: 'accepted' | 'declined') => {
        // TODO: replace with a real POST to respond_schedule.php equivalent once backend is ready
        setSchedule((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
        Alert.alert(newStatus === 'accepted' ? 'Duty accepted' : 'Duty declined');
    };

    const totalWeeklyHours = schedule
        .filter((s) => s.status === 'accepted' || s.status === 'deployed')
        .reduce((sum, s) => sum + s.hours, 0);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#003087" />
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <View>
                        <Text style={styles.title}>My Schedule</Text>
                        <Text style={styles.headerSub}>View and manage your weekly duty schedule</Text>
                    </View>
                    <View style={styles.toggleGroup}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, view === 'calendar' && styles.toggleBtnActive]}
                            onPress={() => setView('calendar')}
                        >
                            <Text style={[styles.toggleText, view === 'calendar' && styles.toggleTextActive]}>Calendar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, view === 'list' && styles.toggleBtnActive]}
                            onPress={() => setView('list')}
                        >
                            <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>List</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Stat mini-cards + week navigator — matches schedule.php's .stat-row exactly */}
            <View style={styles.statRow}>
                <View style={styles.statMini}>
                    <View style={[styles.statMiniIcon, { backgroundColor: '#dbeafe' }]}>
                        <Clock size={16} color="#155dfc" />
                    </View>
                    <View>
                        <Text style={styles.statMiniLabel}>Total Hours This Week</Text>
                        <Text style={styles.statMiniValue}>{totalWeeklyHours.toFixed(1)} hrs</Text>
                    </View>
                </View>
                <View style={styles.statMini}>
                    <View style={[styles.statMiniIcon, { backgroundColor: '#fffbeb' }]}>
                        <Calendar size={16} color="#e17100" />
                    </View>
                    <View>
                        <Text style={styles.statMiniLabel}>Scheduled Days</Text>
                        <Text style={styles.statMiniValue}>{scheduledDays}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.weekNav}>
                <TouchableOpacity style={styles.weekNavBtn}>
                    <ChevronLeft size={18} color="#4a5565" />
                </TouchableOpacity>
                <View style={styles.weekNavInfo}>
                    <Text style={styles.weekNavLabel}>Current Week</Text>
                    <Text style={styles.weekNavRange}>{weekRangeLabel}</Text>
                    <Text style={styles.weekNavSub}>{student.name} · {student.id}</Text>
                </View>
                <TouchableOpacity style={styles.weekNavBtn}>
                    <ChevronRight size={18} color="#4a5565" />
                </TouchableOpacity>
            </View>

            {view === 'calendar' ? (
                <ScrollView style={styles.bodyCal} showsVerticalScrollIndicator={false}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.calHScroll}>
                        <View>
                            {/* Header row */}
                            <View style={styles.calHeaderRow}>
                                <View style={[styles.calHeaderCell, { width: TIME_COL_W }]}>
                                    <Text style={styles.calHeaderTimeText}>TIME</Text>
                                </View>
                                {DAYS.map((d) => (
                                    <View key={d} style={[styles.calHeaderCell, { width: DAY_COL_W }]}>
                                        <Text style={styles.calHeaderDayText}>{d.slice(0, 3)}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Grid body */}
                            <View style={{ flexDirection: 'row' }}>
                                {/* Time column */}
                                <View style={{ width: TIME_COL_W }}>
                                    {HOURS.map((h) => (
                                        <View key={h} style={[styles.calTimeCell, { height: ROW_H }]}>
                                            <Text style={styles.calTimeText}>{h}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Day columns */}
                                {DAYS.map((day) => {
                                    const dayEvents = schedule.filter((s) => s.day === day && s.status !== 'declined');
                                    return (
                                        <View key={day} style={[styles.calDayCol, { width: DAY_COL_W, height: ROW_H * HOURS.length }]}>
                                            {HOURS.map((_, i) => (
                                                <View key={i} style={[styles.calDayLine, { top: i * ROW_H, height: ROW_H }]} />
                                            ))}
                                            {dayEvents.map((ev) => {
                                                const top = timeToRow(ev.timeStart) * ROW_H;
                                                const height = Math.max(ROW_H * 1.3, (timeToRow(ev.timeEnd) - timeToRow(ev.timeStart)) * ROW_H);
                                                const c = calEventStyle[ev.status] ?? calEventStyle.pending;
                                                return (
                                                    <View
                                                        key={ev.id}
                                                        style={[
                                                            styles.calEvent,
                                                            { top, height, backgroundColor: c.bg, borderColor: c.border },
                                                        ]}
                                                    >
                                                        <Text style={[styles.calEventTime, { color: c.text }]}>{ev.timeStartLabel}</Text>
                                                        <Text style={[styles.calEventLoc, { color: c.text }]} numberOfLines={1}>{ev.office}</Text>
                                                        <Text style={[styles.calEventIcon, { color: c.text }]}>
                                                            {ev.status === 'deployed' ? '🚀' : ev.status === 'accepted' ? '✓' : '⏳'}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.calFooterNote}>
                        <Text style={styles.calFooterText}>Scroll sideways to see the full week →</Text>
                    </View>

                    {/* Upcoming Schedules — matches the web's sidebar, stacked below the grid on mobile */}
                    <View style={styles.upcomingCard}>
                        <Text style={styles.upcomingTitle}>Upcoming Schedules</Text>
                        <Text style={styles.upcomingSub}>Your next duties and their current status.</Text>

                        {schedule
                            .filter((s) => s.status !== 'declined')
                            .map((item) => {
                                const s = statusStyle[item.status];
                                return (
                                    <View key={item.id} style={styles.upcomingItem}>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.upcomingItemTopRow}>
                                                <Text style={styles.upcomingDay}>{item.day}</Text>
                                                <View style={[styles.upcomingBadge, { backgroundColor: s.bg }]}>
                                                    <Text style={[styles.upcomingBadgeText, { color: s.text }]}>{s.label}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.upcomingTime}>{item.timeStartLabel} - {item.timeEndLabel}</Text>
                                            <Text style={styles.upcomingOffice}>{item.office}</Text>
                                        </View>
                                    </View>
                                );
                            })}

                        <TouchableOpacity style={styles.upcomingLinkBtn} onPress={() => setView('list')}>
                            <Text style={styles.upcomingLinkText}>Open full schedule list</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <ScrollView style={styles.bodyList} showsVerticalScrollIndicator={false}>
                    {schedule.map((item) => {
                        const s = statusStyle[item.status];
                        return (
                            <View key={item.id} style={styles.card}>
                                <View style={styles.cardTopRow}>
                                    <View>
                                        <Text style={styles.dayDate}>{item.day.slice(0, 3)}, {item.date}</Text>
                                        <Text style={styles.timeRange}>{item.timeStartLabel} – {item.timeEndLabel}</Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                                        <Text style={[styles.badgeText, { color: s.text }]}>{s.icon} {s.label}</Text>
                                    </View>
                                </View>

                                <View style={styles.metaRow}>
                                    <Text style={styles.metaText}>{item.office}</Text>
                                    <Text style={styles.metaDot}>•</Text>
                                    <Text style={styles.metaText}>{item.hours}h</Text>
                                </View>

                                {item.status === 'pending' ? (
                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => respondToSchedule(item.id, 'accepted')}>
                                            <Text style={styles.acceptBtnText}>✓ Accept</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => respondToSchedule(item.id, 'declined')}>
                                            <Text style={styles.declineBtnText}>✕ Decline</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : item.isTodayOrDeployed || item.status === 'deployed' ? (
                                    <Text style={styles.hintText}>Attendance will be recorded by admin</Text>
                                ) : (
                                    <Text style={styles.noActionText}>No action needed</Text>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9fafb' },
    header: { backgroundColor: '#003087', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 16 },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    title: { fontFamily: 'Poppins_700Bold', fontSize: 19, color: '#fff' },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
    toggleGroup: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 3 },
    toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    toggleBtnActive: { backgroundColor: '#fff' },
    toggleText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.8)' },
    toggleTextActive: { color: '#003087' },

    statRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginTop: 14 },
    statMini: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#f3f4f6' },
    statMiniIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    statMiniLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9.5, color: '#4a5565' },
    statMiniValue: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#101828', marginTop: 2 },

    weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 18, marginTop: 10, padding: 12, borderWidth: 1, borderColor: '#f3f4f6' },
    weekNavBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
    weekNavInfo: { alignItems: 'center' },
    weekNavLabel: { fontFamily: 'Inter_700Bold', fontSize: 9.5, color: '#99a1af', letterSpacing: 0.3 },
    weekNavRange: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#101828', marginTop: 2 },
    weekNavSub: { fontFamily: 'Inter_400Regular', fontSize: 9.5, color: '#99a1af', marginTop: 2 },

    bodyCal: { flex: 1, backgroundColor: '#f9fafb' },
    calHScroll: { marginTop: 14 },
    calHeaderRow: { flexDirection: 'row' },
    calHeaderCell: { height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRightWidth: 1, borderBottomWidth: 2, borderColor: '#e5e7eb' },
    calHeaderTimeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#4a5565', letterSpacing: 0.4 },
    calHeaderDayText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: '#101828' },
    calTimeCell: { borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', paddingTop: 4, paddingLeft: 4 },
    calTimeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#4a5565' },
    calDayCol: { position: 'relative', borderRightWidth: 1, borderColor: '#e5e7eb' },
    calDayLine: { position: 'absolute', left: 0, right: 0, borderBottomWidth: 1, borderColor: '#e5e7eb' },
    calEvent: { position: 'absolute', left: 4, right: 4, borderRadius: 6, borderWidth: 2, padding: 6, alignItems: 'center', justifyContent: 'center' },
    calEventTime: { fontFamily: 'Inter_700Bold', fontSize: 9 },
    calEventLoc: { fontFamily: 'Inter_600SemiBold', fontSize: 8.5, marginTop: 2 },
    calEventIcon: { fontSize: 11, marginTop: 2 },
    calFooterNote: { padding: 14, alignItems: 'center' },
    calFooterText: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#99a1af' },

    upcomingCard: { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 18, marginTop: 4, marginBottom: 18, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
    upcomingTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#101828' },
    upcomingSub: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#99a1af', marginTop: 2, marginBottom: 12 },
    upcomingItem: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    upcomingItemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    upcomingDay: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#101828' },
    upcomingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    upcomingBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9 },
    upcomingTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#4a5565', marginTop: 3 },
    upcomingOffice: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#99a1af', marginTop: 1 },
    upcomingLinkBtn: { marginTop: 12, backgroundColor: '#f9fafb', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
    upcomingLinkText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: '#003087' },

    bodyList: { flex: 1, backgroundColor: '#f9fafb', padding: 18 },
    card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    dayDate: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#101828' },
    timeRange: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#4a5565', marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    badgeText: { fontFamily: 'Inter_700Bold', fontSize: 10.5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    metaText: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#4a5565' },
    metaDot: { color: '#99a1af', fontSize: 11 },
    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    actionBtn: { flex: 1, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    acceptBtn: { backgroundColor: '#dcfce7' },
    acceptBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#166534' },
    declineBtn: { backgroundColor: '#fee2e2' },
    declineBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#991b1b' },
    hintText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1d4ed8', marginTop: 12 },
    noActionText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#99a1af', marginTop: 12 },
});