import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';

interface NotificationBellProps {
    unreadCount: number;
}

export default function NotificationBell({ unreadCount }: NotificationBellProps) {
    return (
        <TouchableOpacity style={styles.wrap} onPress={() => router.push('/announcements')}>
            <Bell size={20} color="#fff" />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -3,
        right: -3,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#e7000b',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#003087',
    },
    badgeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 8.5,
        color: '#fff',
    },
});