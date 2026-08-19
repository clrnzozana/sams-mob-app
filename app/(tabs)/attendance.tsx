import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import {
    Clock,
    Calendar,
    CheckCircle2,
    AlertCircle,
    XCircle,
    ArrowRight,
    TrendingUp,
    Timer,
} from 'lucide-react-native';
import NotificationBell from '@/components/NotificationBell';

type AttendanceStatus = 'present' | 'late' | 'absent';

interface LogEntry {
    id: number;
    date: string;
    day: string;
    timeIn: string | null;
    timeOut: string | null;
    hours: number;
    status: AttendanceStatus;
    office?: string;
}

const mockLogs: LogEntry[] = [
    {
        id: 1,
        date: 'Aug 12, 2026',
        day: 'Wednesday',
        timeIn: null,
        timeOut: null,
        hours: 0,
        status: 'absent',
        office: 'University Library - 2nd Flr',
    },
    {
        id: 2,
        date: 'Aug 11, 2026',
        day: 'Tuesday',
        timeIn: null,
        timeOut: null,
        hours: 0,
        status: 'absent',
        office: 'University Library - 2nd Flr',
    },
    {
        id: 3,
        date: 'Aug 10, 2026',
        day: 'Monday',
        timeIn: null,
        timeOut: null,
        hours: 0,
        status: 'absent',
        office: 'University Library - 2nd Flr',
    },
    {
        id: 4,
        date: 'Aug 8, 2026',
        day: 'Saturday',
        timeIn: '1:02 PM',
        timeOut: '4:01 PM',
        hours: 3.0,
        status: 'present',
        office: 'University Library - 2nd Flr',
    },
    {
        id: 5,
        date: 'Aug 7, 2026',
        day: 'Friday',
        timeIn: '1:20 PM',
        timeOut: '4:00 PM',
        hours: 2.7,
        status: 'late',
        office: 'IT Support Office - Rm 304',
    },
];

const statusMeta: Record<
    AttendanceStatus,
    { bg: string; text: string; border: string; label: string }
> = {
    present: {
        bg: '#f0fdf4',
        text: '#15803d',
        border: '#bbf7d0',
        label: 'Present',
    },
    late: {
        bg: '#fffbeb',
        text: '#b45309',
        border: '#fde68a',
        label: 'Late',
    },
    absent: {
        bg: '#fef2f2',
        text: '#b91c1c',
        border: '#fecaca',
        label: 'Absent',
    },
};

function AttendanceStatusIcon({
    status,
    size = 12,
    color,
}: {
    status: AttendanceStatus;
    size?: number;
    color?: string;
}) {
    const iconColor = color ?? statusMeta[status].text;
    switch (status) {
        case 'present':
            return <CheckCircle2 size={size} color={iconColor} />;
        case 'late':
            return <Timer size={size} color={iconColor} />;
        case 'absent':
            return <XCircle size={size} color={iconColor} />;
    }
}

export default function AttendanceScreen() {
    const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');

    const summary = useMemo(() => {
        const renderedHours = mockLogs.reduce((sum, l) => sum + l.hours, 0);
        const present = mockLogs.filter((l) => l.status === 'present').length;
        const late = mockLogs.filter((l) => l.status === 'late').length;
        const absent = mockLogs.filter((l) => l.status === 'absent').length;
        const total = mockLogs.length;
        const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

        return {
            renderedHours,
            present,
            late,
            absent,
            totalRecords: total,
            attendanceRate,
            termLabel: 'Spring Term 2026',
        };
    }, []);

    const filteredLogs = useMemo(() => {
        if (statusFilter === 'all') return mockLogs;
        return mockLogs.filter((l) => l.status === statusFilter);
    }, [statusFilter]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#003087" />

            {/* Clean Attendance Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={styles.headerTitle}>Attendance</Text>
                        <Text style={styles.headerSub}>
                            Duty hour records and time logs
                        </Text>
                    </View>
                    <NotificationBell unreadCount={2} />
                </View>

                {/* Term & Record Info */}
                <View style={styles.headerInfoRow}>
                    <View style={styles.termBadge}>
                        <Calendar size={12} color="#f4b333" />
                        <Text style={styles.termBadgeText}>{summary.termLabel}</Text>
                    </View>
                    <Text style={styles.recordCountText}>
                        {summary.totalRecords} Logs Recorded
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 2x2 Creative Duty Metrics Grid */}
                <View style={styles.creativeGrid}>
                    {/* 1. Hero Card: Total Rendered Hours */}
                    <View style={[styles.gridCard, styles.heroCard]}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.heroIconCircle}>
                                <Clock size={16} color="#f4b333" />
                            </View>
                            <View style={styles.heroPill}>
                                <Text style={styles.heroPillText}>Total</Text>
                            </View>
                        </View>
                        <View style={styles.heroValueWrap}>
                            <Text style={styles.heroMainValue}>
                                {summary.renderedHours.toFixed(1)}
                            </Text>
                            <Text style={styles.heroUnitText}>hrs</Text>
                        </View>
                        <Text style={styles.heroLabelText}>Rendered Duty Time</Text>
                    </View>

                    {/* 2. Present / On-Time Card */}
                    <View style={[styles.gridCard, styles.presentCard]}>
                        <View style={styles.cardHeaderRow}>
                            <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                                <CheckCircle2 size={16} color="#15803d" />
                            </View>
                            <View style={[styles.tagPill, { backgroundColor: '#dcfce7' }]}>
                                <Text style={[styles.tagPillText, { color: '#15803d' }]}>
                                    On-Time
                                </Text>
                            </View>
                        </View>
                        <View style={styles.valueRow}>
                            <Text style={[styles.cardMainValue, { color: '#15803d' }]}>
                                {summary.present}
                            </Text>
                            <Text style={styles.cardSubValueText}>duties</Text>
                        </View>
                        <Text style={styles.cardLabelText}>Present Sessions</Text>
                    </View>

                    {/* 3. Late Clock-ins Card */}
                    <View style={[styles.gridCard, styles.lateCard]}>
                        <View style={styles.cardHeaderRow}>
                            <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                                <Timer size={16} color="#d97706" />
                            </View>
                            <View style={[styles.tagPill, { backgroundColor: '#fef3c7' }]}>
                                <Text style={[styles.tagPillText, { color: '#b45309' }]}>
                                    Late
                                </Text>
                            </View>
                        </View>
                        <View style={styles.valueRow}>
                            <Text style={[styles.cardMainValue, { color: '#b45309' }]}>
                                {summary.late}
                            </Text>
                            <Text style={styles.cardSubValueText}>duties</Text>
                        </View>
                        <Text style={styles.cardLabelText}>Clocked In Late</Text>
                    </View>

                    {/* 4. Absent / Missed Card */}
                    <View style={[styles.gridCard, styles.absentCard]}>
                        <View style={styles.cardHeaderRow}>
                            <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
                                <XCircle size={16} color="#dc2626" />
                            </View>
                            <View style={[styles.tagPill, { backgroundColor: '#fee2e2' }]}>
                                <Text style={[styles.tagPillText, { color: '#b91c1c' }]}>
                                    Missed
                                </Text>
                            </View>
                        </View>
                        <View style={styles.valueRow}>
                            <Text style={[styles.cardMainValue, { color: '#b91c1c' }]}>
                                {summary.absent}
                            </Text>
                            <Text style={styles.cardSubValueText}>days</Text>
                        </View>
                        <Text style={styles.cardLabelText}>Unrendered Shifts</Text>
                    </View>
                </View>

                {/* Section Title & Filter Tabs */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Attendance Logs</Text>
                    <Text style={styles.sectionHelper}>
                        {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'}
                    </Text>
                </View>

                {/* Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterBar}
                >
                    {(['all', 'present', 'late', 'absent'] as const).map((tab) => {
                        const active = statusFilter === tab;
                        const count =
                            tab === 'all'
                                ? mockLogs.length
                                : mockLogs.filter((l) => l.status === tab).length;

                        return (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.filterChip,
                                    active && styles.filterChipActive,
                                ]}
                                onPress={() => setStatusFilter(tab)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        active && styles.filterChipTextActive,
                                    ]}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                                <View
                                    style={[
                                        styles.filterBadge,
                                        active && styles.filterBadgeActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.filterBadgeText,
                                            active && styles.filterBadgeTextActive,
                                        ]}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Log Records List */}
                {filteredLogs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Clock size={36} color="#94a3b8" />
                        <Text style={styles.emptyTitle}>No logs found</Text>
                        <Text style={styles.emptySub}>
                            There are no attendance records for the selected status.
                        </Text>
                    </View>
                ) : (
                    filteredLogs.map((log) => {
                        const meta = statusMeta[log.status];
                        return (
                            <View key={log.id} style={styles.logCard}>
                                <View style={styles.logTopRow}>
                                    <View>
                                        <Text style={styles.logDayText}>
                                            {log.day}, {log.date}
                                        </Text>
                                        {log.office && (
                                            <Text style={styles.logOfficeText}>
                                                {log.office}
                                            </Text>
                                        )}
                                    </View>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor: meta.bg,
                                                borderColor: meta.border,
                                            },
                                        ]}
                                    >
                                        <AttendanceStatusIcon
                                            status={log.status}
                                            size={11}
                                            color={meta.text}
                                        />
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                { color: meta.text },
                                            ]}
                                        >
                                            {meta.label}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.logBottomRow}>
                                    <View style={styles.timeTrackingBox}>
                                        <Text style={styles.timeLabel}>Clock In / Out</Text>
                                        <View style={styles.timeValuesRow}>
                                            <Text style={styles.timeValueText}>
                                                {log.timeIn ?? '—'}
                                            </Text>
                                            <ArrowRight size={12} color="#94a3b8" />
                                            <Text style={styles.timeValueText}>
                                                {log.timeOut ?? '—'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.hoursBox}>
                                        <Text style={styles.timeLabel}>Rendered</Text>
                                        <Text style={styles.hoursValueText}>
                                            {log.hours > 0 ? `${log.hours.toFixed(1)} hrs` : '0.0 hrs'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#003087',
    },
    header: {
        backgroundColor: '#003087',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 20,
        color: '#ffffff',
    },
    headerSub: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    headerInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    termBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 12,
    },
    termBadgeText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11,
        color: '#ffffff',
    },
    recordCountText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11.5,
        color: 'rgba(255,255,255,0.75)',
    },

    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },

    /* 2x2 Creative Grid */
    creativeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    gridCard: {
        width: '48%',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        justifyContent: 'space-between',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
    },

    /* Hero Navy Card (Total Hours) */
    heroCard: {
        backgroundColor: '#003087',
        borderColor: '#002566',
    },
    heroIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroPill: {
        backgroundColor: 'rgba(244, 179, 51, 0.22)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    heroPillText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        color: '#f4b333',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    heroValueWrap: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 10,
    },
    heroMainValue: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 26,
        color: '#ffffff',
        lineHeight: 32,
    },
    heroUnitText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: '#f4b333',
    },
    heroLabelText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.75)',
        marginTop: 4,
    },

    /* Present Mint Card */
    presentCard: {
        backgroundColor: '#ffffff',
        borderColor: '#bbf7d0',
    },
    /* Late Amber Card */
    lateCard: {
        backgroundColor: '#ffffff',
        borderColor: '#fde68a',
    },
    /* Absent Rose Card */
    absentCard: {
        backgroundColor: '#ffffff',
        borderColor: '#fecaca',
    },

    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    tagPillText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 9.5,
        letterSpacing: 0.2,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 10,
    },
    cardMainValue: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 24,
        lineHeight: 30,
    },
    cardSubValueText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        color: '#94a3b8',
    },
    cardLabelText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        color: '#64748b',
        marginTop: 4,
    },

    /* Section & Filters */
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 16,
        color: '#0f172a',
    },
    sectionHelper: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11.5,
        color: '#94a3b8',
    },

    filterBar: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 14,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
    },
    filterChipActive: {
        backgroundColor: '#003087',
        borderColor: '#003087',
    },
    filterChipText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: '#475569',
    },
    filterChipTextActive: {
        color: '#ffffff',
    },
    filterBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 10,
    },
    filterBadgeActive: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    filterBadgeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        color: '#475569',
    },
    filterBadgeTextActive: {
        color: '#ffffff',
    },

    /* Attendance Log Cards */
    logCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    logTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
    },
    logDayText: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 14,
        color: '#0f172a',
    },
    logOfficeText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 3.5,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusBadgeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
    },

    logBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },
    timeTrackingBox: {
        flex: 1,
    },
    timeLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 9.5,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginBottom: 3,
    },
    timeValuesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeValueText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12.5,
        color: '#1e293b',
    },
    hoursBox: {
        alignItems: 'flex-end',
    },
    hoursValueText: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 13,
        color: '#003087',
    },

    /* Empty state */
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 36,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 4,
    },
    emptyTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 15,
        color: '#1e293b',
        marginTop: 10,
    },
    emptySub: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 3,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});