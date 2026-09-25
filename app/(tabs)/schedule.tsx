import NotificationBell from "@/components/NotificationBell";
import ApiState from "@/components/api-state";
import { authenticatedRequest } from "@/constants/api";
import {
    AlertCircle,
    AlertTriangle,
    Briefcase,
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit3,
    FileText,
    MapPin,
    Send,
    Shield,
    X,
    XCircle,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
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

type ScheduleStatus = "assigned" | "accepted" | "declined" | "deployed";

interface ScheduleNote {
  note_id: number;
  duty_id: number;
  schedule_date: string;
  reason: string;
  status: "pending" | "approved" | "excused" | "declined" | "removed";
  admin_reply?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ScheduleEntry {
  id: number;
  day: string;
  date: string;
  fullDate?: string;
  isoDate?: string;
  timeStart: string;
  timeEnd: string;
  timeStartLabel: string;
  timeEndLabel: string;
  office: string;
  hours: number;
  status: ScheduleStatus;
  supervisor?: string;
  notes?: string;
}

interface WeekDayInfo {
  dayName: string;
  shortName: string;
  date: Date;
  dateNum: number;
  isoDate: string;
  monthShort: string;
  fullDateString: string;
  formattedDate: string;
  isToday: boolean;
}

function getWeekDates(offset: number = 0): WeekDayInfo[] {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // SAMS duty week starts Monday (day 1). If Sunday (0), Monday was 6 days ago.
  const diffToMonday = (currentDay === 0 ? -6 : 1 - currentDay) + offset * 7;

  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diffToMonday,
  );

  return DAYS.map((dayName, index) => {
    const d = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + index,
    );
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    return {
      dayName,
      shortName: DAY_SHORT[index],
      date: d,
      dateNum: d.getDate(),
      isoDate,
      monthShort: d.toLocaleDateString("en-US", { month: "short" }),
      fullDateString: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      formattedDate: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      isToday,
    };
  });
}

function formatWeekRange(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${start.getDate()}, ${startYear} – ${endMonth} ${end.getDate()}, ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${startYear}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${startYear}`;
}

function formatTimeTo12Hour(timeStr: string): string {
  const parts = timeStr.split(":");
  let h = parseInt(parts[0], 10);
  const m = parts[1] ?? "00";
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

const statusMeta: Record<
  ScheduleStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  deployed: {
    bg: "#eff6ff",
    text: "#1d4ed8",
    border: "#bfdbfe",
    label: "Deployed",
  },
  accepted: {
    bg: "#f0fdf4",
    text: "#15803d",
    border: "#bbf7d0",
    label: "Approved",
  },
  assigned: {
    bg: "#fffbeb",
    text: "#b45309",
    border: "#fde68a",
    label: "Pending Approval",
  },
  declined: {
    bg: "#fef2f2",
    text: "#b91c1c",
    border: "#fecaca",
    label: "Declined",
  },
};

function StatusIcon({
  status,
  size = 12,
  color,
}: {
  status: ScheduleStatus;
  size?: number;
  color?: string;
}) {
  const iconColor = color ?? statusMeta[status].text;
  switch (status) {
    case "deployed":
      return <Send size={size} color={iconColor} />;
    case "accepted":
      return <CheckCircle2 size={size} color={iconColor} />;
    case "assigned":
      return <Clock size={size} color={iconColor} />;
    case "declined":
      return <XCircle size={size} color={iconColor} />;
  }
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = [
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
];
const ROW_H = 54;
const TIME_COL_W = 54;
const DAY_COL_W = 120;

function timeToRow(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return Math.max(0, h - 7 + m / 60);
}

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [scheduleNotes, setScheduleNotes] = useState<ScheduleNote[]>([]);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteReason, setNoteReason] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "all">(
    "all",
  );
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(
    null,
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    authenticatedRequest<{
      schedule: Array<{
        duty_id: number;
        office: string;
        day_of_week: string;
        start_time: string;
        end_time: string;
        status: "assigned" | "accepted" | "declined" | "deployed";
      }>;
      notes?: Array<ScheduleNote>;
      unread_notifications: number;
    }>("/api/mobile/schedule.php")
      .then((data) => {
        setUnreadNotifications(data.unread_notifications ?? 0);
        if (data.notes) {
          setScheduleNotes(data.notes);
        }
        setSchedule(
          data.schedule.map((item) => ({
            id: item.duty_id,
            day: item.day_of_week,
            date: item.day_of_week,
            timeStart: item.start_time.slice(0, 5),
            timeEnd: item.end_time.slice(0, 5),
            timeStartLabel: formatTimeTo12Hour(item.start_time),
            timeEndLabel: formatTimeTo12Hour(item.end_time),
            office: item.office,
            hours:
              (new Date(`1970-01-01T${item.end_time}`).getTime() -
                new Date(`1970-01-01T${item.start_time}`).getTime()) /
              3600000,
            status: item.status,
          })),
        );
      })
      .catch((requestError) => {
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load schedule data.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const weekDays = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const weekLabel = useMemo(() => {
    return formatWeekRange(
      weekDays[0].date,
      weekDays[weekDays.length - 1].date,
    );
  }, [weekDays]);

  const weekTag = useMemo(() => {
    if (weekOffset === 0) return "Current Week";
    if (weekOffset === 1) return "Next Week";
    if (weekOffset === -1) return "Last Week";
    return weekOffset > 0
      ? `In ${weekOffset} Weeks`
      : `${Math.abs(weekOffset)} Weeks Ago`;
  }, [weekOffset]);

  const openEntryModal = (entry: ScheduleEntry) => {
    const dayInfo = weekDays.find((d) => d.dayName === entry.day);
    const isoDate = dayInfo?.isoDate ?? "";
    setSelectedEntry({
      ...entry,
      isoDate,
      date: dayInfo?.formattedDate ?? entry.date,
      fullDate: dayInfo?.fullDateString ?? `${entry.day}, ${entry.date}`,
    });

    const existingNote = scheduleNotes.find(
      (n) => n.duty_id === entry.id && n.schedule_date === isoDate,
    );
    setNoteReason(existingNote ? existingNote.reason : "");
    setIsEditingNote(false);
  };

  const handleSaveNote = async () => {
    if (!selectedEntry || !selectedEntry.isoDate) return;
    if (noteReason.trim().length < 5) {
      Alert.alert(
        "Invalid Reason",
        "Please provide a clear reason (at least 5 characters) explaining why you cannot perform this scheduled duty.",
      );
      return;
    }

    setIsSubmittingNote(true);
    try {
      const response = await authenticatedRequest<{
        success: boolean;
        message: string;
        note: ScheduleNote;
      }>("/api/mobile/submit-schedule-note.php", {
        method: "POST",
        body: JSON.stringify({
          duty_id: selectedEntry.id,
          schedule_date: selectedEntry.isoDate,
          reason: noteReason.trim(),
        }),
      });

      setScheduleNotes((prev) => {
        const filtered = prev.filter(
          (n) =>
            !(
              n.duty_id === selectedEntry.id &&
              n.schedule_date === selectedEntry.isoDate
            ),
        );
        return [response.note, ...filtered];
      });

      setIsEditingNote(false);
      Alert.alert(
        "Note Submitted",
        "Your excuse note has been submitted to the Administrator. If approved, your duty will be excused or removed for this week.",
      );
    } catch (error) {
      Alert.alert(
        "Submission Failed",
        error instanceof Error
          ? error.message
          : "Failed to submit excuse note. Please try again.",
      );
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Dynamic Summary Stats
  const totalWeeklyHours = useMemo(() => {
    return schedule
      .filter((s) => s.status === "accepted" || s.status === "deployed")
      .reduce((sum, s) => sum + s.hours, 0);
  }, [schedule]);

  const scheduledDaysCount = useMemo(() => {
    const activeDays = schedule
      .filter((s) => s.status === "accepted" || s.status === "deployed")
      .map((s) => s.day);
    return new Set(activeDays).size;
  }, [schedule]);

  const pendingCount = useMemo(() => {
    return schedule.filter((s) => s.status === "assigned").length;
  }, [schedule]);

  const filteredSchedule = useMemo(() => {
    if (statusFilter === "all") return schedule;
    return schedule.filter((s) => s.status === statusFilter);
  }, [schedule, statusFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ApiState loading={isLoading} error={loadError} />
      {!isLoading && !loadError ? (
        <>
          <StatusBar barStyle="light-content" backgroundColor="#061D5A" />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.headerTitle}>My Schedule</Text>
                <Text style={styles.headerSub}>
                  Manage your weekly duty assignments
                </Text>
              </View>
              <NotificationBell unreadCount={unreadNotifications} />
            </View>

            {/* View Switcher Tabs */}
            <View style={styles.viewSwitcher}>
              <TouchableOpacity
                style={[
                  styles.switchBtn,
                  view === "calendar" && styles.switchBtnActive,
                ]}
                onPress={() => setView("calendar")}
                activeOpacity={0.8}
              >
                <CalendarIcon
                  size={14}
                  color={
                    view === "calendar" ? "#061D5A" : "rgba(255,255,255,0.85)"
                  }
                />
                <Text
                  style={[
                    styles.switchText,
                    view === "calendar" && styles.switchTextActive,
                  ]}
                >
                  Calendar View
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchBtn,
                  view === "list" && styles.switchBtnActive,
                ]}
                onPress={() => setView("list")}
                activeOpacity={0.8}
              >
                <Clock
                  size={14}
                  color={view === "list" ? "#061D5A" : "rgba(255,255,255,0.85)"}
                />
                <Text
                  style={[
                    styles.switchText,
                    view === "list" && styles.switchTextActive,
                  ]}
                >
                  List View
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.mainContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Week Navigator Card */}
            <View style={styles.weekCard}>
              <TouchableOpacity
                style={styles.weekNavArrow}
                onPress={() => setWeekOffset((prev) => prev - 1)}
                activeOpacity={0.7}
              >
                <ChevronLeft size={18} color="#061D5A" />
              </TouchableOpacity>

              <View style={styles.weekInfo}>
                <TouchableOpacity
                  style={[
                    styles.weekTagPill,
                    weekOffset !== 0 && styles.weekTagPillActive,
                  ]}
                  onPress={() => setWeekOffset(0)}
                  disabled={weekOffset === 0}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.weekTagText,
                      weekOffset !== 0 && styles.weekTagTextActive,
                    ]}
                  >
                    {weekOffset === 0 ? weekTag : `${weekTag} • Today`}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.weekLabelText}>{weekLabel}</Text>
              </View>

              <TouchableOpacity
                style={styles.weekNavArrow}
                onPress={() => setWeekOffset((prev) => prev + 1)}
                activeOpacity={0.7}
              >
                <ChevronRight size={18} color="#061D5A" />
              </TouchableOpacity>
            </View>

            {/* KPI Metric Summary Strip */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View
                  style={[styles.statIconWrap, { backgroundColor: "#dbeafe" }]}
                >
                  <Clock size={16} color="#1d4ed8" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statVal}>
                    {totalWeeklyHours.toFixed(1)}h
                  </Text>
                  <Text style={styles.statLbl}>Approved Hours</Text>
                </View>
              </View>

              <View style={styles.statBox}>
                <View
                  style={[styles.statIconWrap, { backgroundColor: "#dcfce7" }]}
                >
                  <CalendarIcon size={16} color="#15803d" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statVal}>{scheduledDaysCount} Days</Text>
                  <Text style={styles.statLbl}>Duty Days</Text>
                </View>
              </View>

              <View
                style={[
                  styles.statBox,
                  pendingCount > 0 && styles.statBoxHighlight,
                ]}
              >
                <View
                  style={[
                    styles.statIconWrap,
                    {
                      backgroundColor: pendingCount > 0 ? "#fef3c7" : "#f3f4f6",
                    },
                  ]}
                >
                  <AlertCircle
                    size={16}
                    color={pendingCount > 0 ? "#d97706" : "#6b7280"}
                  />
                </View>
                <View style={styles.statInfo}>
                  <Text
                    style={[
                      styles.statVal,
                      pendingCount > 0 && { color: "#b45309" },
                    ]}
                  >
                    {pendingCount}
                  </Text>
                  <Text style={styles.statLbl}>Pending Approval</Text>
                </View>
              </View>
            </View>

            {/* View Mode: CALENDAR */}
            {view === "calendar" ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Weekly Duty Matrix</Text>
                  <Text style={styles.sectionHelper}>
                    Tap any block to view details
                  </Text>
                </View>

                {/* Calendar Horizontal & Vertical Grid */}
                <View style={styles.calendarContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.calScrollInner}
                  >
                    <View>
                      {/* Day Headers */}
                      <View style={styles.calHeaderRow}>
                        <View
                          style={[
                            styles.calHeaderTimeCell,
                            { width: TIME_COL_W },
                          ]}
                        >
                          <Text style={styles.calHeaderTimeText}>TIME</Text>
                        </View>
                        {weekDays.map((dayInfo) => (
                          <View
                            key={dayInfo.dayName}
                            style={[
                              styles.calHeaderDayCell,
                              { width: DAY_COL_W },
                              dayInfo.isToday && styles.calHeaderDayCellToday,
                            ]}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <Text
                                style={[
                                  styles.calHeaderDayShort,
                                  dayInfo.isToday &&
                                    styles.calHeaderDayShortToday,
                                ]}
                              >
                                {dayInfo.shortName}
                              </Text>
                              <View
                                style={[
                                  styles.calDateBadge,
                                  dayInfo.isToday && styles.calDateBadgeToday,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.calDateBadgeText,
                                    dayInfo.isToday &&
                                      styles.calDateBadgeTextToday,
                                  ]}
                                >
                                  {dayInfo.dateNum}
                                </Text>
                              </View>
                            </View>
                            <Text
                              style={[
                                styles.calHeaderDayName,
                                dayInfo.isToday &&
                                  styles.calHeaderDayNameToday,
                              ]}
                            >
                              {dayInfo.dayName}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Grid Body */}
                      <View style={styles.calGridBody}>
                        {/* Time Axis */}
                        <View style={{ width: TIME_COL_W }}>
                          {HOURS.map((h) => (
                            <View
                              key={h}
                              style={[styles.calTimeCell, { height: ROW_H }]}
                            >
                              <Text style={styles.calTimeText}>{h}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Days Columns */}
                        {weekDays.map((dayInfo) => {
                          const day = dayInfo.dayName;
                          const dayEvents = schedule.filter(
                            (s) => s.day === day && s.status !== "declined",
                          );
                          return (
                            <View
                              key={day}
                              style={[
                                styles.calDayColumn,
                                {
                                  width: DAY_COL_W,
                                  height: ROW_H * HOURS.length,
                                },
                                dayInfo.isToday && styles.calDayColumnToday,
                              ]}
                            >
                              {/* Hour Grid Lines */}
                              {HOURS.map((_, i) => (
                                <View
                                  key={i}
                                  style={[
                                    styles.calGridLine,
                                    {
                                      top: i * ROW_H,
                                      height: ROW_H,
                                    },
                                  ]}
                                />
                              ))}

                              {/* Event Blocks */}
                              {dayEvents.map((ev) => {
                                const top = timeToRow(ev.timeStart) * ROW_H;
                                const duration =
                                  timeToRow(ev.timeEnd) -
                                  timeToRow(ev.timeStart);
                                const height = Math.max(
                                  ROW_H * 1.1,
                                  duration * ROW_H - 6,
                                );
                                const meta = statusMeta[ev.status];
                                const evNote = scheduleNotes.find(
                                  (n) =>
                                    n.duty_id === ev.id &&
                                    n.schedule_date === dayInfo.isoDate,
                                );

                                return (
                                  <TouchableOpacity
                                    key={ev.id}
                                    style={[
                                      styles.calEventCard,
                                      {
                                        top: top + 3,
                                        height,
                                        backgroundColor: meta.bg,
                                        borderColor: meta.border,
                                      },
                                    ]}
                                    activeOpacity={0.85}
                                    onPress={() => openEntryModal(ev)}
                                  >
                                    <View style={styles.calEventTop}>
                                      <Text
                                        style={[
                                          styles.calEventTime,
                                          { color: meta.text },
                                        ]}
                                      >
                                        {ev.timeStartLabel}
                                      </Text>
                                      <StatusIcon
                                        status={ev.status}
                                        size={11}
                                        color={meta.text}
                                      />
                                    </View>
                                    <Text
                                      style={[
                                        styles.calEventOffice,
                                        { color: meta.text },
                                      ]}
                                      numberOfLines={2}
                                    >
                                      {ev.office}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.calEventHours,
                                        { color: meta.text },
                                      ]}
                                    >
                                      {ev.hours} hrs
                                    </Text>
                                    {evNote && (
                                      <View
                                        style={[
                                          styles.calNotePill,
                                          evNote.status === "excused"
                                            ? { backgroundColor: "#15803d" }
                                            : evNote.status === "declined"
                                              ? { backgroundColor: "#b91c1c" }
                                              : { backgroundColor: "#b45309" },
                                        ]}
                                      >
                                        <Text style={styles.calNotePillText}>
                                          {evNote.status === "excused"
                                            ? "Excused"
                                            : evNote.status === "declined"
                                              ? "Declined"
                                              : "Note"}
                                        </Text>
                                      </View>
                                    )}
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            ) : (
              /* View Mode: LIST */
              <View style={styles.sectionWrap}>
                {/* Filter Tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterBar}
                >
                  {(
                    [
                      { key: "all", label: "All" },
                      { key: "assigned", label: "Pending Approval" },
                      { key: "accepted", label: "Approved" },
                      { key: "deployed", label: "Deployed" },
                      { key: "declined", label: "Declined" },
                    ] as const
                  ).map((tab) => {
                    const active = statusFilter === tab.key;
                    const count =
                      tab.key === "all"
                        ? schedule.length
                        : schedule.filter((s) => s.status === tab.key).length;

                    return (
                      <TouchableOpacity
                        key={tab.key}
                        style={[
                          styles.filterChip,
                          active && styles.filterChipActive,
                        ]}
                        onPress={() => setStatusFilter(tab.key)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            active && styles.filterChipTextActive,
                          ]}
                        >
                          {tab.label}
                        </Text>
                        <View
                          style={[
                            styles.filterCountBadge,
                            active && styles.filterCountBadgeActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterCountText,
                              active && styles.filterCountTextActive,
                            ]}
                          >
                            {count}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* List Items */}
                {filteredSchedule.length === 0 ? (
                  <View style={styles.emptyState}>
                    <CalendarIcon size={36} color="#94a3b8" />
                    <Text style={styles.emptyTitle}>No duties found</Text>
                    <Text style={styles.emptySub}>
                      There are no duty slots matching the selected filter.
                    </Text>
                  </View>
                ) : (
                  filteredSchedule.map((item) => {
                    const meta = statusMeta[item.status];
                    const dayInfo = weekDays.find((d) => d.dayName === item.day);
                    const formattedDate = dayInfo ? dayInfo.formattedDate : item.day;
                    const itemNote = scheduleNotes.find(
                      (n) =>
                        n.duty_id === item.id &&
                        n.schedule_date === dayInfo?.isoDate,
                    );

                    return (
                      <View key={item.id} style={styles.listCard}>
                        {/* Card Header */}
                        <TouchableOpacity
                          style={styles.listCardTop}
                          onPress={() => openEntryModal(item)}
                          activeOpacity={0.75}
                        >
                          <View>
                            <Text style={styles.listDayText}>
                              {item.day}, {formattedDate}
                            </Text>
                            <View style={styles.listTimeWrap}>
                              <Clock size={13} color="#4b5563" />
                              <Text style={styles.listTimeText}>
                                {item.timeStartLabel} – {item.timeEndLabel} (
                                {item.hours} hrs)
                              </Text>
                            </View>
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
                            <StatusIcon
                              status={item.status}
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
                        </TouchableOpacity>

                        {/* Office Location */}
                        <View style={styles.listOfficeWrap}>
                          <MapPin size={14} color="#061D5A" />
                          <Text style={styles.listOfficeText}>
                            {item.office}
                          </Text>
                        </View>

                        {item.notes && (
                          <Text style={styles.listNotesText}>{item.notes}</Text>
                        )}

                        {/* Status Notice */}
                        <View
                          style={[
                            styles.noticeRow,
                            item.status === "assigned"
                              ? styles.noticeRowPending
                              : item.status === "accepted"
                                ? styles.noticeRowApproved
                                : item.status === "deployed"
                                  ? styles.noticeRowDeployed
                                  : styles.noticeRowDeclined,
                          ]}
                        >
                          {item.status === "assigned" ? (
                            <Clock size={13} color="#b45309" />
                          ) : item.status === "accepted" ? (
                            <CheckCircle2 size={13} color="#15803d" />
                          ) : item.status === "deployed" ? (
                            <Shield size={13} color="#1d4ed8" />
                          ) : (
                            <XCircle size={13} color="#b91c1c" />
                          )}
                          <Text
                            style={[
                              styles.noticeText,
                              item.status === "assigned" && { color: "#92400e" },
                              item.status === "accepted" && { color: "#166534" },
                              item.status === "deployed" && { color: "#1e40af" },
                              item.status === "declined" && { color: "#991b1b" },
                            ]}
                          >
                            {item.status === "assigned"
                              ? "Proposed schedule submitted • Awaiting admin approval"
                              : item.status === "accepted"
                                ? "Schedule approved by admin • Ready for deployment"
                                : item.status === "deployed"
                                  ? "Active duty deployment • Monitored by admin"
                                  : "Schedule proposal declined by admin"}
                          </Text>
                        </View>

                        {/* Deployed Quick Action Row */}
                        {item.status === "deployed" && (
                          <TouchableOpacity
                            style={styles.deployedActionRow}
                            onPress={() => openEntryModal(item)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.deployedActionLeft}>
                              <FileText
                                size={13}
                                color={
                                  itemNote?.status === "excused"
                                    ? "#15803d"
                                    : itemNote?.status === "declined"
                                      ? "#b91c1c"
                                      : itemNote
                                        ? "#b45309"
                                        : "#061D5A"
                                }
                              />
                              <Text
                                style={[
                                  styles.deployedActionText,
                                  itemNote?.status === "excused" && {
                                    color: "#15803d",
                                  },
                                  itemNote?.status === "declined" && {
                                    color: "#b91c1c",
                                  },
                                  itemNote?.status === "pending" && {
                                    color: "#b45309",
                                  },
                                ]}
                              >
                                {itemNote
                                  ? `Excuse Note: ${
                                      itemNote.status === "excused"
                                        ? "Excused by Admin"
                                        : itemNote.status === "declined"
                                          ? "Excuse Declined"
                                          : itemNote.status === "removed"
                                            ? "Removed for Week"
                                            : "Pending Admin Review"
                                    }`
                                  : "Report Inability to Attend / Add Note"}
                              </Text>
                            </View>
                            <ChevronRight size={14} color="#64748b" />
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </ScrollView>

          {/* Event Detail Modal (for Calendar taps) */}
          {selectedEntry && (() => {
            const currentNote = scheduleNotes.find(
              (n) =>
                n.duty_id === selectedEntry.id &&
                n.schedule_date === selectedEntry.isoDate,
            );

            return (
              <Modal
                visible={true}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                  setSelectedEntry(null);
                  setIsEditingNote(false);
                }}
              >
                <Pressable
                  style={styles.modalBackdrop}
                  onPress={() => {
                    setSelectedEntry(null);
                    setIsEditingNote(false);
                  }}
                >
                  <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalKeyboardWrap}
                  >
                    <Pressable
                      style={styles.modalCard}
                      onPress={(e) => e.stopPropagation()}
                    >
                      <View style={styles.modalHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalDay}>
                            {selectedEntry.fullDate ??
                              `${selectedEntry.day}, ${selectedEntry.date}`}
                          </Text>
                          <Text style={styles.modalTime}>
                            {selectedEntry.timeStartLabel} –{" "}
                            {selectedEntry.timeEndLabel} ({selectedEntry.hours} hrs)
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedEntry(null);
                            setIsEditingNote(false);
                          }}
                          style={styles.modalCloseBtn}
                        >
                          <X size={18} color="#6b7280" />
                        </TouchableOpacity>
                      </View>

                      <ScrollView
                        style={styles.modalScrollBody}
                        contentContainerStyle={styles.modalBody}
                        showsVerticalScrollIndicator={false}
                      >
                        <View style={styles.modalRow}>
                          <MapPin size={16} color="#061D5A" />
                          <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text style={styles.modalLabel}>Assigned Office</Text>
                            <Text style={styles.modalValue}>
                              {selectedEntry.office}
                            </Text>
                          </View>
                        </View>

                        {selectedEntry.supervisor && (
                          <View style={styles.modalRow}>
                            <Briefcase size={16} color="#061D5A" />
                            <View style={{ marginLeft: 10, flex: 1 }}>
                              <Text style={styles.modalLabel}>
                                Supervisor / Contact
                              </Text>
                              <Text style={styles.modalValue}>
                                {selectedEntry.supervisor}
                              </Text>
                            </View>
                          </View>
                        )}

                        {selectedEntry.notes && (
                          <View style={styles.modalRow}>
                            <AlertCircle size={16} color="#061D5A" />
                            <View style={{ marginLeft: 10, flex: 1 }}>
                              <Text style={styles.modalLabel}>Instructions</Text>
                              <Text style={styles.modalValue}>
                                {selectedEntry.notes}
                              </Text>
                            </View>
                          </View>
                        )}

                        <View style={styles.modalStatusBox}>
                          <Text style={styles.modalLabel}>Admin Approval Status</Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  statusMeta[selectedEntry.status].bg,
                                borderColor:
                                  statusMeta[selectedEntry.status].border,
                                marginTop: 6,
                                alignSelf: "flex-start",
                              },
                            ]}
                          >
                            <StatusIcon
                              status={selectedEntry.status}
                              size={11}
                              color={statusMeta[selectedEntry.status].text}
                            />
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: statusMeta[selectedEntry.status].text },
                              ]}
                            >
                              {statusMeta[selectedEntry.status].label}
                            </Text>
                          </View>
                          <Text style={styles.modalStatusHint}>
                            {selectedEntry.status === "assigned"
                              ? "This proposed duty schedule was submitted from your availability during application and is currently pending approval by the administrator."
                              : selectedEntry.status === "accepted"
                                ? "This schedule proposal has been approved by the administrator. You are scheduled for duty during these hours."
                                : selectedEntry.status === "deployed"
                                  ? "You are currently deployed for this duty slot. Attendance and hours are actively tracked."
                                  : "This schedule proposal was declined by the administrator."}
                          </Text>
                        </View>

                        {/* Deployed Duty Excuse & Attendance Note Section */}
                        {selectedEntry.status === "deployed" && (
                          <View style={styles.excuseCard}>
                            <View style={styles.excuseCardHeader}>
                              <View style={styles.excuseHeaderTitleRow}>
                                <FileText size={16} color="#061D5A" />
                                <Text style={styles.excuseCardTitle}>
                                  Duty Attendance & Excuse Note
                                </Text>
                              </View>
                              {currentNote && (
                                <View
                                  style={[
                                    styles.excuseStatusPill,
                                    currentNote.status === "excused"
                                      ? styles.pillExcused
                                      : currentNote.status === "removed"
                                        ? styles.pillRemoved
                                        : currentNote.status === "declined"
                                          ? styles.pillDeclined
                                          : styles.pillPending,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.excuseStatusPillText,
                                      currentNote.status === "excused"
                                        ? styles.textExcused
                                        : currentNote.status === "removed"
                                          ? styles.textRemoved
                                          : currentNote.status === "declined"
                                            ? styles.textDeclined
                                            : styles.textPending,
                                    ]}
                                  >
                                    {currentNote.status === "excused"
                                      ? "Excused"
                                      : currentNote.status === "removed"
                                        ? "Removed for Week"
                                        : currentNote.status === "declined"
                                          ? "Declined"
                                          : "Pending Admin Review"}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Policy Warning Banner */}
                            <View style={styles.policyBanner}>
                              <AlertTriangle
                                size={15}
                                color="#b45309"
                                style={{ marginTop: 1 }}
                              />
                              <Text style={styles.policyBannerText}>
                                If you have an important matter and cannot perform this duty, submit a note explaining why. Admins will be notified to review and excuse or remove your schedule. If you fail to submit a note, missed shifts are automatically considered Absent.
                              </Text>
                            </View>

                            {/* Existing Note or Form */}
                            {currentNote && !isEditingNote ? (
                              <View style={styles.existingNoteBox}>
                                <Text style={styles.existingNoteLabel}>
                                  Your Submitted Excuse Note:
                                </Text>
                                <Text style={styles.existingNoteReason}>
                                  &ldquo;{currentNote.reason}&rdquo;
                                </Text>
                                {currentNote.admin_reply && (
                                  <View style={styles.adminReplyBox}>
                                    <Text style={styles.adminReplyLabel}>
                                      Admin Remark:
                                    </Text>
                                    <Text style={styles.adminReplyText}>
                                      {currentNote.admin_reply}
                                    </Text>
                                  </View>
                                )}
                                {currentNote.status === "pending" && (
                                  <TouchableOpacity
                                    style={styles.editNoteBtn}
                                    onPress={() => {
                                      setNoteReason(currentNote.reason);
                                      setIsEditingNote(true);
                                    }}
                                    activeOpacity={0.8}
                                  >
                                    <Edit3 size={13} color="#061D5A" />
                                    <Text style={styles.editNoteBtnText}>
                                      Edit Reason
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            ) : isEditingNote ? (
                              <View style={styles.noteFormBox}>
                                <Text style={styles.formInputLabel}>
                                  Reason for Inability to Perform Duty:
                                </Text>
                                <TextInput
                                  style={styles.reasonInput}
                                  placeholder="Explain why you cannot perform duty (e.g. Departmental exam, medical consultation, urgent academic conflict)..."
                                  placeholderTextColor="#94a3b8"
                                  multiline
                                  numberOfLines={3}
                                  value={noteReason}
                                  onChangeText={setNoteReason}
                                  textAlignVertical="top"
                                />
                                <View style={styles.formBtnRow}>
                                  {currentNote && (
                                    <TouchableOpacity
                                      style={styles.cancelNoteBtn}
                                      onPress={() => setIsEditingNote(false)}
                                      disabled={isSubmittingNote}
                                    >
                                      <Text style={styles.cancelNoteBtnText}>
                                        Cancel
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                  <TouchableOpacity
                                    style={[
                                      styles.submitNoteBtn,
                                      isSubmittingNote &&
                                        styles.submitNoteBtnDisabled,
                                    ]}
                                    onPress={handleSaveNote}
                                    disabled={isSubmittingNote}
                                    activeOpacity={0.8}
                                  >
                                    {isSubmittingNote ? (
                                      <ActivityIndicator
                                        size="small"
                                        color="#ffffff"
                                      />
                                    ) : (
                                      <>
                                        <Send size={13} color="#ffffff" />
                                        <Text style={styles.submitNoteBtnText}>
                                          {currentNote
                                            ? "Update Note"
                                            : "Submit Note to Admin"}
                                        </Text>
                                      </>
                                    )}
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ) : (
                              <TouchableOpacity
                                style={styles.addNoteBtn}
                                onPress={() => {
                                  setNoteReason("");
                                  setIsEditingNote(true);
                                }}
                                activeOpacity={0.8}
                              >
                                <Edit3 size={14} color="#061D5A" />
                                <Text style={styles.addNoteBtnText}>
                                  Report Inability to Attend / Add Note
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </ScrollView>

                      <TouchableOpacity
                        style={styles.modalDoneBtn}
                        onPress={() => {
                          setSelectedEntry(null);
                          setIsEditingNote(false);
                        }}
                      >
                        <Text style={styles.modalDoneText}>Close</Text>
                      </TouchableOpacity>
                    </Pressable>
                  </KeyboardAvoidingView>
                </Pressable>
              </Modal>
            );
          })()}
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#061D5A",
  },
  header: {
    backgroundColor: "#061D5A",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#ffffff",
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  viewSwitcher: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 10,
    padding: 4,
  },
  switchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  switchBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  switchText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  switchTextActive: {
    color: "#061D5A",
  },

  mainContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  /* Week Navigator */
  weekCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  weekNavArrow: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  weekInfo: {
    alignItems: "center",
  },
  weekTagPill: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 3,
  },
  weekTagPillActive: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  weekTagText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#1d4ed8",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  weekTagTextActive: {
    color: "#b45309",
  },
  weekLabelText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#0f172a",
  },

  /* Quick KPIs */
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  statBoxHighlight: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  statVal: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    color: "#0f172a",
  },
  statLbl: {
    fontFamily: "Inter_500Medium",
    fontSize: 9.5,
    color: "#64748b",
    marginTop: 1,
  },

  /* Section Wrapper */
  sectionWrap: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#0f172a",
  },
  sectionHelper: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#94a3b8",
  },

  /* Calendar Grid */
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  calScrollInner: {
    paddingBottom: 8,
  },
  calHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  calHeaderTimeCell: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: "#e2e8f0",
  },
  calHeaderTimeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9.5,
    color: "#64748b",
    letterSpacing: 0.5,
  },
  calHeaderDayCell: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 4,
  },
  calHeaderDayCellToday: {
    backgroundColor: "#eff6ff",
  },
  calHeaderDayShort: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#0f172a",
  },
  calHeaderDayShortToday: {
    color: "#1d4ed8",
  },
  calDateBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  calDateBadgeToday: {
    backgroundColor: "#1d4ed8",
  },
  calDateBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#475569",
  },
  calDateBadgeTextToday: {
    color: "#ffffff",
  },
  calHeaderDayName: {
    fontFamily: "Inter_400Regular",
    fontSize: 9.5,
    color: "#64748b",
    marginTop: 1,
  },
  calHeaderDayNameToday: {
    fontFamily: "Inter_600SemiBold",
    color: "#1d4ed8",
  },

  calGridBody: {
    flexDirection: "row",
  },
  calTimeCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingTop: 4,
    paddingLeft: 6,
  },
  calTimeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9.5,
    color: "#64748b",
  },
  calDayColumn: {
    position: "relative",
    borderRightWidth: 1,
    borderColor: "#f1f5f9",
  },
  calDayColumnToday: {
    backgroundColor: "rgba(59, 130, 246, 0.03)",
  },
  calGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  calEventCard: {
    position: "absolute",
    left: 4,
    right: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 6,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  calEventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calEventTime: {
    fontFamily: "Inter_700Bold",
    fontSize: 9.5,
  },
  calEventOffice: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9.5,
    lineHeight: 12,
    marginVertical: 2,
  },
  calEventHours: {
    fontFamily: "Inter_500Medium",
    fontSize: 8.5,
    opacity: 0.85,
  },

  /* List View Styles */
  filterBar: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: "#061D5A",
    borderColor: "#061D5A",
  },
  filterChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  filterCountBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  filterCountBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  filterCountText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#475569",
  },
  filterCountTextActive: {
    color: "#ffffff",
  },

  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  listCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  listDayText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#0f172a",
  },
  listTimeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  listTimeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#4b5563",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  listOfficeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 8,
  },
  listOfficeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#1e293b",
    flex: 1,
  },
  listNotesText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 16,
    marginBottom: 12,
  },
  actionButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  btnAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    borderRadius: 8,
    gap: 6,
  },
  btnAccept: {
    backgroundColor: "#16a34a",
  },
  btnAcceptText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#ffffff",
  },
  btnDecline: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  btnDeclineText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#b91c1c",
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  noticeRowPending: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  noticeRowApproved: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  noticeRowDeployed: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  noticeRowDeclined: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  noticeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#64748b",
    flex: 1,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#1e293b",
    marginTop: 10,
  },
  emptySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 3,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  /* Modal Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalDay: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#0f172a",
  },
  modalTime: {
    fontFamily: "Inter_500Medium",
    fontSize: 12.5,
    color: "#061D5A",
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    gap: 12,
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  modalLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10.5,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  modalValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#0f172a",
    marginTop: 2,
  },
  modalStatusBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalStatusHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
    marginTop: 8,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalDoneBtn: {
    backgroundColor: "#061D5A",
    borderRadius: 10,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDoneText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#ffffff",
  },
  /* Note Indicators & Excuse Card Styles */
  calNotePill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  calNotePillText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: "#ffffff",
  },
  deployedActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dbeafe",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  deployedActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
  },
  deployedActionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#061D5A",
  },
  modalKeyboardWrap: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
  },
  modalScrollBody: {
    maxHeight: 460,
  },
  excuseCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 4,
  },
  excuseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  excuseHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  excuseCardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12.5,
    color: "#061D5A",
  },
  excuseStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 20,
    borderWidth: 1,
  },
  excuseStatusPillText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10.5,
  },
  pillPending: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  textPending: {
    color: "#b45309",
  },
  pillExcused: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  textExcused: {
    color: "#15803d",
  },
  pillRemoved: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  textRemoved: {
    color: "#1d4ed8",
  },
  pillDeclined: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  textDeclined: {
    color: "#b91c1c",
  },
  policyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 8,
    padding: 9,
  },
  policyBannerText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#92400e",
    lineHeight: 16,
  },
  existingNoteBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    gap: 5,
  },
  existingNoteLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10.5,
    color: "#64748b",
  },
  existingNoteReason: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#1e293b",
    fontStyle: "italic",
    lineHeight: 17,
  },
  adminReplyBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  adminReplyLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10.5,
    color: "#166534",
  },
  adminReplyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "#15803d",
  },
  editNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  editNoteBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#061D5A",
  },
  noteFormBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 10,
    gap: 7,
  },
  formInputLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#334155",
  },
  reasonInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 9,
    minHeight: 68,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#0f172a",
  },
  formBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 2,
  },
  cancelNoteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: "#f1f5f9",
  },
  cancelNoteBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11.5,
    color: "#475569",
  },
  submitNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: "#061D5A",
  },
  submitNoteBtnDisabled: {
    opacity: 0.6,
  },
  submitNoteBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11.5,
    color: "#ffffff",
  },
  addNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#061D5A",
    backgroundColor: "#f0f4ff",
  },
  addNoteBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#061D5A",
  },
});
