import NotificationBell from "@/components/NotificationBell";
import ApiState from "@/components/api-state";
import { authenticatedRequest } from "@/constants/api";
import {
    AlertCircle,
    Briefcase,
    Calendar as CalendarIcon,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Send,
    Shield,
    X,
    XCircle,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ScheduleStatus = "assigned" | "accepted" | "declined" | "deployed";

interface ScheduleEntry {
  id: number;
  day: string;
  date: string;
  fullDate?: string;
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

const initialSchedule: ScheduleEntry[] = [
  {
    id: 1,
    day: "Monday",
    date: "Aug 18",
    fullDate: "Monday, August 18, 2026",
    timeStart: "08:00",
    timeEnd: "12:00",
    timeStartLabel: "8:00 AM",
    timeEndLabel: "12:00 PM",
    office: "University Library - 2nd Flr",
    hours: 4,
    status: "deployed",
    supervisor: "Ms. Clara Reyes",
    notes: "Assigned to Circulation and Reference Section desk.",
  },
  {
    id: 2,
    day: "Wednesday",
    date: "Aug 20",
    fullDate: "Wednesday, August 20, 2026",
    timeStart: "08:00",
    timeEnd: "12:00",
    timeStartLabel: "8:00 AM",
    timeEndLabel: "12:00 PM",
    office: "University Library - 2nd Flr",
    hours: 4,
    status: "accepted",
    supervisor: "Ms. Clara Reyes",
    notes: "Book inventory and student assistance.",
  },
  {
    id: 3,
    day: "Friday",
    date: "Aug 22",
    fullDate: "Friday, August 22, 2026",
    timeStart: "13:00",
    timeEnd: "20:00",
    timeStartLabel: "1:00 PM",
    timeEndLabel: "8:00 PM",
    office: "IT Support Office - Rm 304",
    hours: 7,
    status: "assigned",
    supervisor: "Engr. Mark Santos",
    notes: "Evening lab monitoring and workstation maintenance.",
  },
  {
    id: 4,
    day: "Saturday",
    date: "Aug 23",
    fullDate: "Saturday, August 23, 2026",
    timeStart: "08:00",
    timeEnd: "12:00",
    timeStartLabel: "8:00 AM",
    timeEndLabel: "12:00 PM",
    office: "University Library - 2nd Flr",
    hours: 4,
    status: "assigned",
    supervisor: "Ms. Clara Reyes",
    notes: "Weekend morning shift duty.",
  },
];

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
    label: "Accepted",
  },
  assigned: {
    bg: "#fffbeb",
    text: "#b45309",
    border: "#fde68a",
    label: "Pending Response",
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
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "all">(
    "all",
  );
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(
    null,
  );
  const [weekOffset, setWeekOffset] = useState(0);
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
    }>("/api/mobile/schedule.php")
      .then((data) =>
        setSchedule(
          data.schedule.map((item) => ({
            id: item.duty_id,
            day: item.day_of_week,
            date: item.day_of_week,
            timeStart: item.start_time.slice(0, 5),
            timeEnd: item.end_time.slice(0, 5),
            timeStartLabel: item.start_time.slice(0, 5),
            timeEndLabel: item.end_time.slice(0, 5),
            office: item.office,
            hours:
              (new Date(`1970-01-01T${item.end_time}`).getTime() -
                new Date(`1970-01-01T${item.start_time}`).getTime()) /
              3600000,
            status: item.status,
          })),
        ),
      )
      .catch((requestError) => {
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load schedule data.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const weekLabel = useMemo(() => {
    if (weekOffset === 0) return "Aug 18 – Aug 23, 2026";
    if (weekOffset === 1) return "Aug 25 – Aug 30, 2026";
    if (weekOffset === -1) return "Aug 11 – Aug 16, 2026";
    return `Week Offset: ${weekOffset > 0 ? `+${weekOffset}` : weekOffset}`;
  }, [weekOffset]);

  const weekTag = useMemo(() => {
    if (weekOffset === 0) return "Current Week";
    if (weekOffset === 1) return "Next Week";
    if (weekOffset === -1) return "Last Week";
    return weekOffset > 0
      ? `In ${weekOffset} Weeks`
      : `${Math.abs(weekOffset)} Weeks Ago`;
  }, [weekOffset]);

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

  const handleRespond = async (
    id: number,
    newStatus: "accepted" | "declined",
  ) => {
    await authenticatedRequest("/respond_schedule.php", {
      method: "POST",
      body: JSON.stringify({ duty_id: id, status: newStatus }),
    });
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );
    if (selectedEntry?.id === id) {
      setSelectedEntry((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }

    Alert.alert(
      newStatus === "accepted" ? "Duty Accepted" : "Duty Declined",
      newStatus === "accepted"
        ? "Your assignment has been confirmed. Please report to your assigned office on time."
        : "You have declined this duty slot. Your coordinator will be notified.",
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ApiState loading={isLoading} error={loadError} />
      {!isLoading && !loadError ? (
        <>
          <StatusBar barStyle="light-content" backgroundColor="#003087" />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.headerTitle}>My Schedule</Text>
                <Text style={styles.headerSub}>
                  Manage your weekly duty assignments
                </Text>
              </View>
              <NotificationBell unreadCount={pendingCount} />
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
                    view === "calendar" ? "#003087" : "rgba(255,255,255,0.85)"
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
                  color={view === "list" ? "#003087" : "rgba(255,255,255,0.85)"}
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
                <ChevronLeft size={18} color="#003087" />
              </TouchableOpacity>

              <View style={styles.weekInfo}>
                <View style={styles.weekTagPill}>
                  <Text style={styles.weekTagText}>{weekTag}</Text>
                </View>
                <Text style={styles.weekLabelText}>{weekLabel}</Text>
              </View>

              <TouchableOpacity
                style={styles.weekNavArrow}
                onPress={() => setWeekOffset((prev) => prev + 1)}
                activeOpacity={0.7}
              >
                <ChevronRight size={18} color="#003087" />
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
                  <Text style={styles.statLbl}>Accepted Hours</Text>
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
                  <Text style={styles.statLbl}>Pending Action</Text>
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
                        {DAYS.map((day, i) => (
                          <View
                            key={day}
                            style={[
                              styles.calHeaderDayCell,
                              { width: DAY_COL_W },
                            ]}
                          >
                            <Text style={styles.calHeaderDayShort}>
                              {DAY_SHORT[i]}
                            </Text>
                            <Text style={styles.calHeaderDayName}>{day}</Text>
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
                        {DAYS.map((day) => {
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
                                    onPress={() => setSelectedEntry(ev)}
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
                      "all",
                      "assigned",
                      "accepted",
                      "deployed",
                      "declined",
                    ] as const
                  ).map((tab) => {
                    const active = statusFilter === tab;
                    const count =
                      tab === "all"
                        ? schedule.length
                        : schedule.filter((s) => s.status === tab).length;

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
                    return (
                      <View key={item.id} style={styles.listCard}>
                        {/* Card Header */}
                        <View style={styles.listCardTop}>
                          <View>
                            <Text style={styles.listDayText}>
                              {item.day}, {item.date}
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
                        </View>

                        {/* Office Location */}
                        <View style={styles.listOfficeWrap}>
                          <MapPin size={14} color="#003087" />
                          <Text style={styles.listOfficeText}>
                            {item.office}
                          </Text>
                        </View>

                        {item.notes && (
                          <Text style={styles.listNotesText}>{item.notes}</Text>
                        )}

                        {/* Actions or Status Hint */}
                        {item.status === "assigned" ? (
                          <View style={styles.actionButtonRow}>
                            <TouchableOpacity
                              style={[styles.btnAction, styles.btnAccept]}
                              onPress={() => handleRespond(item.id, "accepted")}
                              activeOpacity={0.8}
                            >
                              <Check size={15} color="#fff" />
                              <Text style={styles.btnAcceptText}>
                                Accept Duty
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.btnAction, styles.btnDecline]}
                              onPress={() => handleRespond(item.id, "declined")}
                              activeOpacity={0.8}
                            >
                              <X size={15} color="#b91c1c" />
                              <Text style={styles.btnDeclineText}>Decline</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.noticeRow}>
                            <Shield size={13} color="#64748b" />
                            <Text style={styles.noticeText}>
                              {item.status === "deployed"
                                ? "Attendance is active and monitored by admin."
                                : item.status === "accepted"
                                  ? "Scheduled duty confirmed. Ready for deployment."
                                  : "This slot was declined."}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </ScrollView>

          {/* Event Detail Modal (for Calendar taps) */}
          {selectedEntry && (
            <Modal
              visible={true}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setSelectedEntry(null)}
            >
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setSelectedEntry(null)}
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
                      onPress={() => setSelectedEntry(null)}
                      style={styles.modalCloseBtn}
                    >
                      <X size={18} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <View style={styles.modalRow}>
                      <MapPin size={16} color="#003087" />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.modalLabel}>Assigned Office</Text>
                        <Text style={styles.modalValue}>
                          {selectedEntry.office}
                        </Text>
                      </View>
                    </View>

                    {selectedEntry.supervisor && (
                      <View style={styles.modalRow}>
                        <Briefcase size={16} color="#003087" />
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
                        <AlertCircle size={16} color="#003087" />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                          <Text style={styles.modalLabel}>Instructions</Text>
                          <Text style={styles.modalValue}>
                            {selectedEntry.notes}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.modalStatusBox}>
                      <Text style={styles.modalLabel}>Current Status</Text>
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
                    </View>
                  </View>

                  {selectedEntry.status === "assigned" ? (
                    <View style={styles.modalActionRow}>
                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnAccept]}
                        onPress={() =>
                          handleRespond(selectedEntry.id, "accepted")
                        }
                        activeOpacity={0.8}
                      >
                        <Check size={16} color="#fff" />
                        <Text style={styles.btnAcceptText}>Accept Duty</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnDecline]}
                        onPress={() =>
                          handleRespond(selectedEntry.id, "declined")
                        }
                        activeOpacity={0.8}
                      >
                        <X size={16} color="#b91c1c" />
                        <Text style={styles.btnDeclineText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.modalDoneBtn}
                      onPress={() => setSelectedEntry(null)}
                    >
                      <Text style={styles.modalDoneText}>Close</Text>
                    </TouchableOpacity>
                  )}
                </Pressable>
              </Pressable>
            </Modal>
          )}
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#003087",
  },
  header: {
    backgroundColor: "#003087",
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
    color: "#003087",
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
  weekTagText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#1d4ed8",
    letterSpacing: 0.3,
    textTransform: "uppercase",
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
    height: 44,
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
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: "#e2e8f0",
  },
  calHeaderDayShort: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#0f172a",
  },
  calHeaderDayName: {
    fontFamily: "Inter_400Regular",
    fontSize: 9.5,
    color: "#64748b",
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
    backgroundColor: "#003087",
    borderColor: "#003087",
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
    color: "#003087",
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
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalDoneBtn: {
    backgroundColor: "#003087",
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
});
