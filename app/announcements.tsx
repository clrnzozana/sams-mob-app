import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Megaphone } from 'lucide-react-native';

interface Announcement {
    id: number;
    title: string;
    body: string;
    createdAt: string;
    isRead: boolean;
}

// Mock data — replace with a real call to announcements/list.php's JSON output once wired up
const initialAnnouncements: Announcement[] = [
    { id: 1, title: 'Evaluation period opens next week', body: 'The end-of-term evaluation period will open on August 25 and close September 1. Make sure your attendance logs are complete before then.', createdAt: 'Aug 18, 2026', isRead: false },
    { id: 2, title: 'SDAO office closed on Nov 1', body: 'The SDAO office will be closed for the holiday. No duty schedules are assigned for this date; attendance will not be recorded.', createdAt: 'Aug 15, 2026', isRead: false },
    { id: 3, title: 'Reminder: bring your school ID', body: 'Please make sure to bring your school ID when reporting to your assigned office, since it is used to record your attendance at the SDAO reader.', createdAt: 'Aug 10, 2026', isRead: true },
];

export default function AnnouncementsScreen() {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const markAsRead = (id: number) => {
        // TODO: replace with a real POST to announcements/mark_read.php once the API is ready
        setAnnouncements((prev) =>
            prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
        );
    };

    const handleToggle = (item: Announcement) => {
        setExpandedId(expandedId === item.id ? null : item.id);
        if (!item.isRead) {
            markAsRead(item.id);
        }
    };

    const markAllRead = () => {
        // TODO: replace with a real POST to announcements/mark_read.php with mark_all: true
        setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
    };

    const unreadCount = announcements.filter((a) => !a.isRead).length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#003087" />

            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Announcements</Text>
                    <View style={{ width: 34 }} />
                </View>
                <Text style={styles.headerSub}>
                    {unreadCount > 0 ? `${unreadCount} unread announcement${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </Text>
            </View>

            <View style={styles.body}>
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
                                    <Text style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}>
                                        {item.title}
                                    </Text>
                                </View>
                                <Text style={styles.cardDate}>{item.createdAt}</Text>
                                {expanded && <Text style={styles.cardBody}>{item.body}</Text>}
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#003087' },

    header: { backgroundColor: '#003087', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 20 },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#fff' },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 10 },

    body: { backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, minHeight: 600 },

    markAllBtn: { alignSelf: 'flex-end', marginBottom: 12 },
    markAllText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: '#003087' },

    card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f3f4f6' },
    cardUnread: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#003087' },
    cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#364153', flex: 1 },
    cardTitleUnread: { fontFamily: 'Inter_700Bold', color: '#101828' },
    cardDate: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#99a1af', marginTop: 4, marginLeft: 14 },
    cardBody: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#4a5565', marginTop: 10, lineHeight: 18 },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#99a1af', marginTop: 10 },
});