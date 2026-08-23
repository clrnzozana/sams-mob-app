import NotificationBell from "@/components/NotificationBell";
import ApiState from "@/components/api-state";
import { authenticatedRequest } from "@/constants/api";
import { router } from "expo-router";
import {
    ArrowRight,
    Briefcase,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Hourglass,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function ProgressRow({
  label,
  value,
  valueLabel,
  color,
}: {
  label: string;
  value: number;
  valueLabel: string;
  color: string;
}) {
  return (
    <View style={styles.progressRowContainer}>
      <View style={styles.progressMeta}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressValue, { color }]}>{valueLabel}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(Math.max(value, 0), 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [student, setStudent] = useState({
    name: "Student",
    office: "Unassigned",
  });
  const [stats, setStats] = useState({
    totalHours: 0,
    upcomingDuties: 0,
    acceptedDuties: 0,
    pendingResponses: 0,
  });
  const [nextDuty, setNextDuty] = useState<{
    day: string;
    time: string;
  } | null>(null);
  const [scheduleProgress, setScheduleProgress] = useState({
    acceptedRate: 0,
    responseRate: 0,
    pendingLoad: 0,
  });
  const [attendanceSnapshot, setAttendanceSnapshot] = useState({
    rate: 0,
    present: 0,
    late: 0,
    absent: 0,
    incomplete: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState<{
    time: string;
    office: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    authenticatedRequest<{
      student: { name: string };
      assignment: { office: string };
      hours: { worked: number };
      duties: { total: number; accepted: number; pending_responses: number };
      attendance: {
        rate: number;
        present: number;
        late: number;
        absent: number;
        incomplete: number;
      };
      next_duty: {
        day_of_week: string;
        start_time: string;
        end_time: string;
        office_name: string;
      } | null;
    }>("/student_dashboard_snapshot.php")
      .then((data) => {
        setStudent({ name: data.student.name, office: data.assignment.office });
        setStats({
          totalHours: data.hours.worked,
          upcomingDuties: data.duties.total,
          acceptedDuties: data.duties.accepted,
          pendingResponses: data.duties.pending_responses,
        });
        setAttendanceSnapshot(data.attendance);
        const acceptedRate =
          data.duties.total > 0
            ? (data.duties.accepted / data.duties.total) * 100
            : 0;
        const responseCount = data.duties.total - data.duties.pending_responses;
        setScheduleProgress({
          acceptedRate,
          responseRate:
            data.duties.total > 0
              ? (responseCount / data.duties.total) * 100
              : 0,
          pendingLoad: data.duties.pending_responses,
        });
        setNextDuty(
          data.next_duty
            ? {
                day: data.next_duty.day_of_week,
                time: data.next_duty.start_time,
              }
            : null,
        );
        const today = new Date().toLocaleDateString("en-US", {
          weekday: "long",
        });
        setTodaySchedule(
          data.next_duty?.day_of_week === today
            ? {
                time: `${data.next_duty.start_time.slice(0, 5)} - ${data.next_duty.end_time.slice(0, 5)}`,
                office: data.next_duty.office_name,
              }
            : null,
        );
      })
      .catch((requestError) => {
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard data.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#003087" />
      <ApiState loading={isLoading} error={loadError} />
      {!isLoading && !loadError ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          {/* Lively Hero Header */}
          <View style={styles.header}>
            <View style={styles.headerBadgeRow}>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusPillText}>
                  Active Assistant · 2026
                </Text>
              </View>
              <NotificationBell unreadCount={2} />
            </View>

            <View style={styles.greetingWrap}>
              <Text style={styles.greeting}>Welcome back, {student.name}!</Text>
              <Text style={styles.headerSub}>
                Here&apos;s what&apos;s happening with your duties today
              </Text>
            </View>
          </View>

          <View style={styles.body}>
            {/* Lively Assignment Overview Panel */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewTopBar}>
                <View style={styles.overviewTitleWrap}>
                  <ShieldCheck size={16} color="#f4b333" />
                  <Text style={styles.overviewLabel}>ASSIGNMENT OVERVIEW</Text>
                </View>
                <View style={styles.officeTag}>
                  <Text style={styles.officeTagText}>Enrolled</Text>
                </View>
              </View>

              {/* Current Assignment Subcard */}
              <View style={styles.overviewSubCard}>
                <View style={styles.rowCenter}>
                  <View style={styles.subCardIconWrap}>
                    <Briefcase size={14} color="#f4b333" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.overviewSubLabel}>
                      CURRENT ASSIGNMENT
                    </Text>
                    <Text style={styles.overviewSubValue}>
                      {student.office}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Hours Summary Subcard */}
              <View style={styles.overviewSubCard}>
                <View style={styles.hoursRowBetween}>
                  <View>
                    <Text style={styles.overviewSubLabel}>HOURS SUMMARY</Text>
                    <Text style={styles.overviewHoursValue}>
                      {stats.totalHours.toFixed(1)}{" "}
                      <Text style={styles.hoursUnit}>hrs</Text>
                    </Text>
                  </View>
                  <View style={styles.hoursChip}>
                    <TrendingUp size={12} color="#10b981" />
                    <Text style={styles.hoursChipText}>Rendered</Text>
                  </View>
                </View>
                <Text style={styles.overviewSubHint}>
                  Rendered duty hours logged from your attendance records.
                </Text>
              </View>

              {/* Today's duty reminder */}
              <TouchableOpacity
                style={[styles.overviewSubCard, { marginBottom: 0 }]}
                onPress={() => router.push("/(tabs)/schedule")}
                activeOpacity={0.85}
              >
                <View style={styles.rowBetweenCenter}>
                  <View style={styles.rowCenter}>
                    <View style={styles.subCardIconWrap}>
                      <Clock size={14} color="#f4b333" />
                    </View>
                    <View>
                      <Text style={styles.overviewSubLabel}>
                        TODAY&apos;S DUTY
                      </Text>
                      <Text style={styles.overviewSubValue}>
                        {todaySchedule ? todaySchedule.time : "No duty today"}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
                </View>
              </TouchableOpacity>
            </View>

            {/* 4 Vibrant Stat Cards (2x2) */}
            <View style={styles.statsGrid}>
              {/* 1. Total Hours */}
              <View style={[styles.statCard, styles.statBlue]}>
                <View style={styles.statCardHeader}>
                  <View
                    style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}
                  >
                    <Clock size={16} color="#1d4ed8" />
                  </View>
                  <Text style={[styles.statBadgeText, { color: "#1d4ed8" }]}>
                    Logged
                  </Text>
                </View>
                <Text style={styles.statValue}>
                  {stats.totalHours.toFixed(1)} hrs
                </Text>
                <Text style={styles.statLabel}>Total Hours</Text>
              </View>

              {/* 2. Upcoming Duties */}
              <View style={[styles.statCard, styles.statAmber]}>
                <View style={styles.statCardHeader}>
                  <View
                    style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}
                  >
                    <Calendar size={16} color="#d97706" />
                  </View>
                  <Text style={[styles.statBadgeText, { color: "#b45309" }]}>
                    Scheduled
                  </Text>
                </View>
                <Text style={styles.statValue}>{stats.upcomingDuties}</Text>
                <Text style={styles.statLabel}>Upcoming Duties</Text>
              </View>

              {/* 3. Accepted Duties */}
              <View style={[styles.statCard, styles.statGreen]}>
                <View style={styles.statCardHeader}>
                  <View
                    style={[styles.statIcon, { backgroundColor: "#dcfce7" }]}
                  >
                    <CheckCircle2 size={16} color="#15803d" />
                  </View>
                  <Text style={[styles.statBadgeText, { color: "#15803d" }]}>
                    Confirmed
                  </Text>
                </View>
                <Text style={styles.statValue}>{stats.acceptedDuties}</Text>
                <Text style={styles.statLabel}>Accepted Duties</Text>
              </View>

              {/* 4. Pending Responses */}
              <View style={[styles.statCard, styles.statPurple]}>
                <View style={styles.statCardHeader}>
                  <View
                    style={[styles.statIcon, { backgroundColor: "#f3e8ff" }]}
                  >
                    <Hourglass size={16} color="#7e22ce" />
                  </View>
                  <Text style={[styles.statBadgeText, { color: "#7e22ce" }]}>
                    Action
                  </Text>
                </View>
                <Text style={styles.statValue}>{stats.pendingResponses}</Text>
                <Text style={styles.statLabel}>Pending Responses</Text>
              </View>
            </View>

            {/* Today's Schedule Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleWithIcon}>
                  <Calendar size={16} color="#003087" />
                  <Text style={styles.cardHeading}>Today&apos;s Schedule</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/schedule")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cardLink}>View Full Schedule →</Text>
                </TouchableOpacity>
              </View>

              {todaySchedule ? (
                <View style={styles.dutyItem}>
                  <View style={styles.dutyIconWrap}>
                    <Calendar size={18} color="#003087" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dutyDay}>Today&apos;s Shift</Text>
                    <Text style={styles.dutyTime}>
                      {(todaySchedule as any).time}
                    </Text>
                  </View>
                  <View style={styles.dutyOfficePill}>
                    <Text style={styles.dutyOfficeText}>
                      {(todaySchedule as any).office}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Sparkles size={24} color="#f4b333" />
                  </View>
                  <Text style={styles.emptyTitle}>No Duty Today</Text>
                  <Text style={styles.emptySub}>
                    {nextDuty
                      ? `Your next duty is ${nextDuty.day} at ${nextDuty.time}.`
                      : "Enjoy your free day."}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() => router.push("/(tabs)/schedule")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.emptyBtnText}>View Schedule</Text>
                    <ArrowRight size={13} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.card}>
              <Text style={[styles.cardHeading, { marginBottom: 12 }]}>
                Quick Actions
              </Text>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => router.push("/(tabs)/schedule")}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: "#dbeafe" },
                    ]}
                  >
                    <Calendar size={20} color="#1d4ed8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickActionLabel}>My Schedule</Text>
                    <Text style={styles.quickActionSub}>
                      View calendar & shifts
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => router.push("/(tabs)/profile")}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: "#f3e8ff" },
                    ]}
                  >
                    <User size={20} color="#7e22ce" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickActionLabel}>My Profile</Text>
                    <Text style={styles.quickActionSub}>
                      Account & credentials
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Schedule Progress */}
            <View style={styles.card}>
              <View style={styles.cardTitleWithIcon}>
                <TrendingUp size={16} color="#003087" />
                <Text style={styles.cardHeadingSm}>Schedule Progress</Text>
              </View>
              <ProgressRow
                label="Accepted Rate"
                value={scheduleProgress.acceptedRate}
                valueLabel={`${scheduleProgress.acceptedRate}%`}
                color="#10b981"
              />
              <ProgressRow
                label="Responded Rate"
                value={scheduleProgress.responseRate}
                valueLabel={`${scheduleProgress.responseRate}%`}
                color="#1d4ed8"
              />
              <ProgressRow
                label="Pending Load"
                value={scheduleProgress.pendingLoad}
                valueLabel={`${scheduleProgress.pendingLoad} duty(s)`}
                color="#7e22ce"
              />
            </View>

            {/* Attendance Snapshot */}
            <View style={styles.card}>
              <View style={styles.cardTitleWithIcon}>
                <Clock size={16} color="#003087" />
                <Text style={styles.cardHeadingSm}>Attendance Snapshot</Text>
              </View>

              <ProgressRow
                label="Attendance Rate"
                value={attendanceSnapshot.rate}
                valueLabel={`${attendanceSnapshot.rate}%`}
                color="#10b981"
              />
              <ProgressRow
                label="Present / Late"
                value={0}
                valueLabel={`${attendanceSnapshot.present} / ${attendanceSnapshot.late}`}
                color="#1d4ed8"
              />
              <ProgressRow
                label="Absent / Incomplete"
                value={0}
                valueLabel={`${attendanceSnapshot.absent} / ${attendanceSnapshot.incomplete}`}
                color="#dc2626"
              />

              <Text style={styles.lastLogText}>
                No attendance logs recorded yet for this period.
              </Text>

              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => router.push("/(tabs)/attendance")}
                activeOpacity={0.8}
              >
                <Text style={styles.reportBtnText}>Open duty-hour report</Text>
                <ArrowRight size={14} color="#003087" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#003087",
  },
  container: {
    flex: 1,
    backgroundColor: "#003087",
  },
  header: {
    backgroundColor: "#003087",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 22,
  },
  headerBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  statusPillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10.5,
    color: "#f4b333",
    letterSpacing: 0.3,
  },
  greetingWrap: {
    paddingRight: 10,
  },
  greeting: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#ffffff",
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
  },

  body: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
  },

  /* Assignment Overview Card */
  overviewCard: {
    backgroundColor: "#003087",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#002566",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  overviewTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  overviewTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  overviewLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10.5,
    color: "#f4b333",
    letterSpacing: 0.6,
  },
  officeTag: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  officeTagText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9.5,
    color: "#ffffff",
  },
  overviewSubCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  subCardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(244, 179, 51, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  overviewSubLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9.5,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.4,
  },
  overviewSubValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14.5,
    color: "#ffffff",
    marginTop: 2,
  },
  hoursRowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  overviewHoursValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#ffffff",
    marginTop: 2,
  },
  hoursUnit: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#f4b333",
  },
  hoursChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hoursChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9.5,
    color: "#10b981",
  },
  overviewSubHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
    lineHeight: 14,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowBetweenCenter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* 4 Stat Cards Grid */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statBlue: { borderColor: "#dbeafe" },
  statAmber: { borderColor: "#fef3c7" },
  statGreen: { borderColor: "#dcfce7" },
  statPurple: { borderColor: "#f3e8ff" },

  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 17,
    color: "#0f172a",
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10.5,
    color: "#64748b",
    marginTop: 1,
  },

  /* Standard Dashboard Cards */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  cardHeading: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#0f172a",
  },
  cardHeadingSm: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#0f172a",
  },
  cardLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11.5,
    color: "#003087",
  },

  /* Today's Schedule Card Content */
  dutyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dutyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  dutyDay: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    color: "#0f172a",
  },
  dutyTime: {
    fontFamily: "Inter_500Medium",
    fontSize: 11.5,
    color: "#475569",
    marginTop: 1,
  },
  dutyOfficePill: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dutyOfficeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#003087",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 12,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fffbeb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#0f172a",
  },
  emptySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#003087",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#ffffff",
  },

  /* Quick Actions */
  quickActionsRow: {
    gap: 10,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: 12,
  },
  quickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#0f172a",
  },
  quickActionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },

  /* Progress Rows */
  progressRowContainer: {
    marginBottom: 12,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  progressLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#475569",
  },
  progressValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  progressTrack: {
    height: 7,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  /* Attendance Snapshot Extra */
  lastLogText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 6,
    marginBottom: 12,
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  reportBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#003087",
  },
});
