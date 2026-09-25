import NotificationBell from "@/components/NotificationBell";
import ApiState from "@/components/api-state";
import { authenticatedRequest } from "@/constants/api";
import { router } from "expo-router";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Hourglass,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DeployedDuty {
  duty_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  office_name: string;
  status: string;
}

function getDutyDateForDay(dayName: string): {
  isoDate: string;
  formattedDate: string;
  fullDateString: string;
} {
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 is Sunday, 1 is Monday...
  const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + mondayOffset);

  const targetDayIndex = dayNames.indexOf(dayName);
  const targetDate = new Date(mondayDate);
  if (targetDayIndex !== -1) {
    targetDate.setDate(mondayDate.getDate() + targetDayIndex);
  } else {
    targetDate.setTime(today.getTime());
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const isoDate = `${year}-${month}-${day}`;

  const formattedDate = targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const fullDateString = `${dayName}, ${formattedDate}`;

  return { isoDate, formattedDate, fullDateString };
}

function formatDutyTime(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || "00";
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

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
    excused: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState<{
    time: string;
    office: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [deployedDuties, setDeployedDuties] = useState<DeployedDuty[]>([]);
  const [isExcuseModalVisible, setIsExcuseModalVisible] = useState(false);
  const [selectedDutyId, setSelectedDutyId] = useState<number | null>(null);
  const [excuseReason, setExcuseReason] = useState("");
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);

  const fetchDashboardData = () => {
    return authenticatedRequest<{
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
        excused?: number;
      };
      next_duty: {
        day_of_week: string;
        start_time: string;
        end_time: string;
        office_name: string;
      } | null;
      unread_notifications: number;
      deployed_duties?: DeployedDuty[];
    }>("/student_dashboard_snapshot.php")
      .then((data) => {
        setStudent({ name: data.student.name, office: data.assignment.office });
        setStats({
          totalHours: data.hours.worked,
          upcomingDuties: data.duties.total,
          acceptedDuties: data.duties.accepted,
          pendingResponses: data.duties.pending_responses,
        });
        setAttendanceSnapshot({
          ...data.attendance,
          excused: data.attendance.excused ?? 0,
        });
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
        setUnreadNotifications(data.unread_notifications ?? 0);
        setDeployedDuties(data.deployed_duties ?? []);
      })
      .catch((requestError) => {
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard data.",
        );
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openExcuseModal = () => {
    if (deployedDuties.length === 0) {
      Alert.alert(
        "Deployment Required",
        "Only Student Assistants who are actively deployed to duty can access and submit duty excuse notes. Approved students can check their schedule and browse the app.",
      );
      return;
    }
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayDuty = deployedDuties.find((d) => d.day_of_week === today);
    setSelectedDutyId(todayDuty ? todayDuty.duty_id : deployedDuties[0].duty_id);
    setExcuseReason("");
    setIsExcuseModalVisible(true);
  };

  const handleSendExcuse = async () => {
    if (!selectedDutyId) {
      Alert.alert(
        "Select a Duty",
        "Please select a duty shift to report an excuse for.",
      );
      return;
    }
    const chosenDuty = deployedDuties.find((d) => d.duty_id === selectedDutyId);
    if (!chosenDuty) return;

    if (excuseReason.trim().length < 5) {
      Alert.alert(
        "Invalid Reason",
        "Please provide a clear reason (at least 5 characters) explaining why you cannot perform this scheduled duty.",
      );
      return;
    }

    const { isoDate, fullDateString } = getDutyDateForDay(chosenDuty.day_of_week);

    setIsSubmittingExcuse(true);
    try {
      await authenticatedRequest<{
        success: boolean;
        message: string;
      }>("/api/mobile/submit-schedule-note.php", {
        method: "POST",
        body: JSON.stringify({
          duty_id: chosenDuty.duty_id,
          schedule_date: isoDate,
          reason: excuseReason.trim(),
        }),
      });

      setIsExcuseModalVisible(false);
      setExcuseReason("");
      Alert.alert(
        "Excuse Note Submitted",
        `Your excuse note for ${chosenDuty.day_of_week} (${fullDateString}) has been sent to the administration. If approved, your duty will be excused or removed for this week.`,
      );
      fetchDashboardData();
    } catch (err) {
      Alert.alert(
        "Submission Failed",
        err instanceof Error
          ? err.message
          : "Failed to submit excuse note. Please try again.",
      );
    } finally {
      setIsSubmittingExcuse(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061D5A" />
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
              <NotificationBell unreadCount={unreadNotifications} />
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
                  <Calendar size={16} color="#061D5A" />
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
                    <Calendar size={18} color="#061D5A" />
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

                {deployedDuties.length > 0 && (
                  <TouchableOpacity
                    style={styles.quickAction}
                    onPress={openExcuseModal}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.quickActionIcon,
                        { backgroundColor: "#fef3c7" },
                      ]}
                    >
                      <FileText size={20} color="#b45309" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quickActionLabel}>Duty Excuse Note</Text>
                      <Text style={styles.quickActionSub}>
                        Report absence for deployed shift
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Schedule Progress */}
            <View style={styles.card}>
              <View style={styles.cardTitleWithIcon}>
                <TrendingUp size={16} color="#061D5A" />
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
                <Clock size={16} color="#061D5A" />
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
              {attendanceSnapshot.excused > 0 && (
                <ProgressRow
                  label="Excused by Admin"
                  value={100}
                  valueLabel={`${attendanceSnapshot.excused} excused`}
                  color="#15803d"
                />
              )}

              <Text style={styles.lastLogText}>
                {attendanceSnapshot.absent > 0
                  ? `${attendanceSnapshot.absent} missed duty record(s) logged this term.`
                  : attendanceSnapshot.excused > 0
                    ? `${attendanceSnapshot.excused} duty absence(s) excused by administration.`
                    : attendanceSnapshot.present + attendanceSnapshot.late > 0
                      ? `${attendanceSnapshot.present + attendanceSnapshot.late} duty attendance record(s) logged this term.`
                      : "No attendance logs recorded yet for this period."}
              </Text>

              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => router.push("/(tabs)/attendance")}
                activeOpacity={0.8}
              >
                <Text style={styles.reportBtnText}>Open duty-hour report</Text>
                <ArrowRight size={14} color="#061D5A" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : null}

      {/* Duty Excuse Note Modal */}
      <Modal
        visible={isExcuseModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsExcuseModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsExcuseModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardWrap}
          >
            <Pressable
              style={styles.modalCard}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.modalHeaderIconWrap}>
                    <FileText size={18} color="#b45309" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>Duty Excuse Note</Text>
                    <Text style={styles.modalSubtitle}>
                      Report absence or important matter
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsExcuseModalVisible(false)}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Policy Warning Banner */}
              <View style={styles.policyBanner}>
                <AlertTriangle
                  size={15}
                  color="#b45309"
                  style={{ marginTop: 1 }}
                />
                <Text style={styles.policyBannerText}>
                  If you have an important matter and cannot perform your scheduled duty, submit an excuse note explaining why. Admins will review to excuse or remove your schedule. If you fail to submit a note, missed shifts are automatically considered Absent.
                </Text>
              </View>

              {deployedDuties.length === 0 ? (
                <View style={styles.modalEmptyState}>
                  <Calendar size={32} color="#94a3b8" />
                  <Text style={styles.modalEmptyText}>Deployment Required</Text>
                  <Text style={styles.modalEmptySub}>
                    Only Student Assistants who are actively deployed to duty can access and submit duty excuse notes. Approved students can check their schedule and browse the app.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalScheduleBtn}
                    onPress={() => {
                      setIsExcuseModalVisible(false);
                      router.push("/(tabs)/schedule");
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalScheduleBtnText}>
                      Check My Schedule
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 360 }}
                >
                  {/* Duty Shift Selector */}
                  <View style={styles.dutySelectorSection}>
                    <Text style={styles.modalSectionLabel}>
                      Select Deployed Duty Shift:
                    </Text>
                    <View style={styles.dutyChipsRow}>
                      {deployedDuties.map((duty) => {
                        const isSelected = selectedDutyId === duty.duty_id;
                        const dateInfo = getDutyDateForDay(duty.day_of_week);
                        const timeStr = `${formatDutyTime(duty.start_time)} – ${formatDutyTime(duty.end_time)}`;

                        return (
                          <TouchableOpacity
                            key={duty.duty_id}
                            style={[
                              styles.dutySelectCard,
                              isSelected && styles.dutySelectCardActive,
                            ]}
                            onPress={() => setSelectedDutyId(duty.duty_id)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.dutyCardTop}>
                              <View style={styles.rowCenter}>
                                <Text
                                  style={[
                                    styles.dutyCardDay,
                                    isSelected && styles.dutyCardDayActive,
                                  ]}
                                >
                                  {dateInfo.fullDateString}
                                </Text>
                                {duty.day_of_week ===
                                  new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                  }) && (
                                  <View style={styles.todayBadge}>
                                    <Text style={styles.todayBadgeText}>
                                      Today
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <View
                                style={[
                                  styles.dutyCardOfficeTag,
                                  isSelected && styles.dutyCardOfficeTagActive,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.dutyCardOfficeText,
                                    isSelected && styles.dutyCardOfficeTextActive,
                                  ]}
                                >
                                  {duty.office_name}
                                </Text>
                              </View>
                            </View>
                            <Text
                              style={[
                                styles.dutyCardTime,
                                isSelected && styles.dutyCardTimeActive,
                              ]}
                            >
                              {timeStr}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Reason Text Input */}
                  <Text style={styles.modalSectionLabel}>
                    Reason For Absence / Inability To Attend:
                  </Text>
                  <TextInput
                    style={styles.reasonInput}
                    placeholder="Provide a detailed explanation of why you cannot attend this duty (e.g., medical concern, exam conflict, personal emergency)..."
                    placeholderTextColor="#94a3b8"
                    value={excuseReason}
                    onChangeText={setExcuseReason}
                    multiline={true}
                    numberOfLines={4}
                    maxLength={500}
                  />
                  <Text style={styles.inputHint}>
                    {excuseReason.trim().length < 5
                      ? "Minimum 5 characters required"
                      : `${excuseReason.trim().length}/500 characters`}
                  </Text>

                  {/* Modal Action Buttons */}
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setIsExcuseModalVisible(false)}
                      disabled={isSubmittingExcuse}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalSubmitBtn,
                        (excuseReason.trim().length < 5 || isSubmittingExcuse) &&
                          styles.modalSubmitBtnDisabled,
                      ]}
                      onPress={handleSendExcuse}
                      disabled={
                        excuseReason.trim().length < 5 || isSubmittingExcuse
                      }
                      activeOpacity={0.8}
                    >
                      {isSubmittingExcuse ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <>
                          <Send size={13} color="#ffffff" />
                          <Text style={styles.modalSubmitBtnText}>
                            Submit Note to Admin
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#061D5A",
  },
  container: {
    flex: 1,
    backgroundColor: "#061D5A",
  },
  header: {
    backgroundColor: "#061D5A",
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
    backgroundColor: "#061D5A",
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 0.2,
    borderColor: "#f4b333",
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
    color: "#061D5A",
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
    color: "#061D5A",
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
    backgroundColor: "#061D5A",
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
    color: "#061D5A",
  },

  /* Excuse Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalKeyboardWrap: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "90%",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  modalHeaderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#0f172a",
  },
  modalSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  policyBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  policyBannerText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#92400e",
    lineHeight: 16,
  },
  dutySelectorSection: {
    marginBottom: 14,
  },
  modalSectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10.5,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dutyChipsRow: {
    gap: 8,
  },
  dutySelectCard: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#f8fafc",
    marginBottom: 6,
  },
  dutySelectCardActive: {
    borderColor: "#061D5A",
    backgroundColor: "#eff6ff",
  },
  dutyCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dutyCardDay: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    color: "#0f172a",
  },
  dutyCardDayActive: {
    color: "#061D5A",
  },
  dutyCardOfficeTag: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dutyCardOfficeTagActive: {
    backgroundColor: "rgba(6, 29, 90, 0.12)",
  },
  dutyCardOfficeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#475569",
  },
  dutyCardOfficeTextActive: {
    color: "#061D5A",
  },
  dutyCardTime: {
    fontFamily: "Inter_500Medium",
    fontSize: 11.5,
    color: "#64748b",
  },
  dutyCardTimeActive: {
    color: "#1e3a8a",
  },
  todayBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 6,
  },
  todayBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9.5,
    color: "#1d4ed8",
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    textAlignVertical: "top",
    minHeight: 85,
    marginBottom: 6,
  },
  inputHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 10.5,
    color: "#94a3b8",
    marginBottom: 16,
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#64748b",
  },
  modalSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#061D5A",
    justifyContent: "center",
  },
  modalSubmitBtnDisabled: {
    opacity: 0.6,
  },
  modalSubmitBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#ffffff",
  },
  modalEmptyState: {
    alignItems: "center",
    paddingVertical: 18,
  },
  modalEmptyText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#0f172a",
    marginTop: 8,
  },
  modalEmptySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 14,
  },
  modalScheduleBtn: {
    backgroundColor: "#061D5A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalScheduleBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#ffffff",
  },
});
