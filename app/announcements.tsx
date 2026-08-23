import ApiState from "@/components/api-state";
import { authenticatedRequest } from "@/constants/api";
import { router } from "expo-router";
import { ArrowLeft, Megaphone } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Announcement {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    authenticatedRequest<{
      notifications: Array<{
        notification_id: number;
        title: string;
        message: string | null;
        created_at: string;
        is_read: boolean;
      }>;
    }>("/announcements/list.php")
      .then((data) =>
        setAnnouncements(
          data.notifications.map((item) => ({
            id: item.notification_id,
            title: item.title,
            body: item.message ?? "",
            createdAt: item.created_at,
            isRead: item.is_read,
          })),
        ),
      )
      .catch((requestError) => {
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load announcements.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const markAsRead = async (id: number) => {
    await authenticatedRequest("/announcements/mark_read.php", {
      method: "POST",
      body: JSON.stringify({ notification_id: id }),
    });
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    );
  };

  const handleToggle = (item: Announcement) => {
    setExpandedId(expandedId === item.id ? null : item.id);
    if (!item.isRead) {
      markAsRead(item.id);
    }
  };

  const markAllRead = async () => {
    const unread = announcements.filter((item) => !item.isRead);
    await Promise.all(unread.map((item) => markAsRead(item.id)));
    setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#003087" />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Announcements</Text>
          <View style={{ width: 34 }} />
        </View>
        <Text style={styles.headerSub}>
          {unreadCount > 0
            ? `${unreadCount} unread announcement${unreadCount > 1 ? "s" : ""}`
            : "All caught up"}
        </Text>
      </View>

      <View style={styles.body}>
        <ApiState loading={isLoading} error={loadError} />
        {!isLoading && !loadError ? (
          <>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            )}

            {announcements.length === 0 ? (
              <View style={styles.emptyState}>
                <Megaphone size={28} color="#99a1af" />
                <Text style={styles.emptyText}>No announcements yet</Text>
              </View>
            ) : (
              announcements.map((item) => {
                const expanded = expandedId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.card, !item.isRead && styles.cardUnread]}
                    onPress={() => handleToggle(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardTopRow}>
                      {!item.isRead && <View style={styles.unreadDot} />}
                      <Text
                        style={[
                          styles.cardTitle,
                          !item.isRead && styles.cardTitleUnread,
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Text style={styles.cardDate}>{item.createdAt}</Text>
                    {expanded && (
                      <Text style={styles.cardBody}>{item.body}</Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#003087" },

  header: {
    backgroundColor: "#003087",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 17, color: "#fff" },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    marginTop: 10,
  },

  body: {
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    minHeight: 600,
  },

  markAllBtn: { alignSelf: "flex-end", marginBottom: 12 },
  markAllText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11.5,
    color: "#003087",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardUnread: { borderColor: "#bfdbfe", backgroundColor: "#eff6ff" },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#003087",
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#364153",
    flex: 1,
  },
  cardTitleUnread: { fontFamily: "Inter_700Bold", color: "#101828" },
  cardDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#99a1af",
    marginTop: 4,
    marginLeft: 14,
  },
  cardBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#4a5565",
    marginTop: 10,
    lineHeight: 18,
  },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#99a1af",
    marginTop: 10,
  },
});
