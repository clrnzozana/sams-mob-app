import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { User, GraduationCap, Star, Trophy, Award, LogOut } from 'lucide-react-native';

// Mock data — replace with real API data once the backend is ready
const student = {
    name: 'Juan Dela Cruz',
    id: '2023-04521',
    statusLabel: 'Active Student Assistant',
    totalDutyHours: 38.0,
    acceptedDuties: 8,
    totalDuties: 8,
    attendanceRate: 92,
    email: 'juan.delacruz@nu-lipa.edu.ph',
    contact: '0917 000 0000',
    program: 'BSIT',
    yearLevel: '4th Year',
    dateJoined: 'June 2026',
    academicStatus: 'Active Student Assistant',
    office: 'Library',
    applicationStatus: 'Approved',
    hoursPerWeek: 20,
    assignmentReadiness: 'Ready',
    skills: ['Data Encoding', 'Record-Keeping and Filing', 'Communication Skills', 'Attention to Detail'],
    missedDuties: 0,
};

export default function ProfileScreen() {
    const scrollRef = useRef<ScrollView>(null);
    const personalInfoY = useRef(0);

    const scrollToPersonalInfo = () => {
        scrollRef.current?.scrollTo({ y: personalInfoY.current - 10, animated: true });
    };

    const handleLogout = () => {
        // TODO: clear session/token once auth is wired up
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#003087" />
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Profile</Text>
                    <Text style={styles.headerSub}>Manage your personal information and account settings</Text>
                </View>

                <View style={styles.body}>
                    {/* Avatar Card */}
                    <View style={styles.avatarCard}>
                        <View style={styles.avatarCircle}>
                            <User size={30} color="#fff" />
                        </View>
                        <Text style={styles.avatarName}>{student.name}</Text>
                        <Text style={styles.avatarId}>{student.id}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>{student.statusLabel}</Text>
                        </View>

                        <View style={styles.avatarStatsRow}>
                            <View style={[styles.avatarStat, { backgroundColor: '#eff6ff' }]}>
                                <Text style={[styles.avatarStatValue, { color: '#003087' }]}>{student.totalDutyHours.toFixed(1)}</Text>
                                <Text style={styles.avatarStatLabel}>Total Duty Hours</Text>
                            </View>
                            <View style={[styles.avatarStat, { backgroundColor: '#fffbeb' }]}>
                                <Text style={[styles.avatarStatValue, { color: '#a16207' }]}>{student.acceptedDuties}</Text>
                                <Text style={styles.avatarStatLabel}>Accepted Duties</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.primaryBtn} onPress={scrollToPersonalInfo}>
                            <Text style={styles.primaryBtnText}>View Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.outlineBtn}>
                            <Text style={styles.outlineBtnText}>Change Password</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Personal Information */}
                    <View
                        style={styles.infoCard}
                        onLayout={(e) => { personalInfoY.current = e.nativeEvent.layout.y; }}
                    >
                        <View style={styles.cardHeading}>
                            <User size={16} color="#003087" />
                            <Text style={styles.cardTitle}>Personal Information</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Full Name</Text>
                            <Text style={styles.fieldValue}>{student.name}</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Student ID</Text>
                            <Text style={styles.fieldValue}>{student.id}</Text>
                            <Text style={styles.fieldHint}>Cannot be changed</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Email Address</Text>
                            <Text style={styles.fieldValue}>{student.email}</Text>
                        </View>
                        <View style={[styles.field, { marginBottom: 0 }]}>
                            <Text style={styles.fieldLabel}>Contact Number</Text>
                            <Text style={styles.fieldValue}>{student.contact}</Text>
                        </View>
                    </View>

                    {/* Academic Information */}
                    <View style={styles.infoCard}>
                        <View style={styles.cardHeading}>
                            <GraduationCap size={16} color="#003087" />
                            <Text style={styles.cardTitle}>Academic Information</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Course/Program</Text>
                            <Text style={styles.fieldValue}>{student.program}</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Year Level</Text>
                            <Text style={styles.fieldValue}>{student.yearLevel}</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Date Joined SAMS</Text>
                            <Text style={styles.fieldValue}>{student.dateJoined}</Text>
                        </View>
                        <View style={[styles.field, { marginBottom: 0 }]}>
                            <Text style={styles.fieldLabel}>Status</Text>
                            <View style={styles.pillGreen}>
                                <Text style={styles.pillGreenText}>{student.academicStatus}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Skills & Qualifications */}
                    <View style={styles.infoCard}>
                        <View style={styles.cardHeading}>
                            <Star size={16} color="#003087" />
                            <Text style={styles.cardTitle}>Skills & Qualifications</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Assigned Role / Office</Text>
                            <Text style={styles.fieldValue}>{student.office}</Text>
                            <Text style={styles.fieldHint}>Based on your latest application and current schedule</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Application Status</Text>
                            <View style={styles.pillGreen}>
                                <Text style={styles.pillGreenText}>{student.applicationStatus}</Text>
                            </View>
                            <Text style={styles.fieldHint}>Reviewed by the student affairs team</Text>
                        </View>

                        <View style={styles.qualSummary}>
                            <View style={styles.qualItem}>
                                <Text style={styles.qualLabel}>Availability / Week</Text>
                                <Text style={styles.qualValue}>{student.hoursPerWeek} hrs</Text>
                            </View>
                            <View style={styles.qualItem}>
                                <Text style={styles.qualLabel}>Profile Approval</Text>
                                <Text style={styles.qualValue}>{student.applicationStatus}</Text>
                            </View>
                            <View style={[styles.qualItem, { borderRightWidth: 0 }]}>
                                <Text style={styles.qualLabel}>Readiness</Text>
                                <Text style={styles.qualValue}>{student.assignmentReadiness}</Text>
                            </View>
                        </View>

                        <Text style={styles.fieldLabel}>Skills</Text>
                        <View style={styles.chipsRow}>
                            {student.skills.map((skill) => (
                                <View key={skill} style={styles.chip}>
                                    <Text style={styles.chipText}>{skill}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.qualNote}>
                            Profile changes stay under admin oversight. If your skills or assignment details are
                            outdated, ask the SDAO office to review your record.
                        </Text>
                    </View>

                    {/* Performance Summary — dark card */}
                    <View style={styles.perfCard}>
                        <View style={styles.cardHeading}>
                            <Trophy size={16} color="#ffb81c" />
                            <Text style={[styles.cardTitle, { color: '#fff' }]}>Performance Summary</Text>
                        </View>

                        <View style={styles.perfStatsRow}>
                            <View style={styles.perfStat}>
                                <Text style={styles.perfStatValue}>{student.totalDutyHours.toFixed(1)} hrs</Text>
                                <Text style={styles.perfStatLabel}>Total Duty Hours</Text>
                            </View>
                            <View style={styles.perfStat}>
                                <Text style={styles.perfStatValue}>{student.totalDuties}</Text>
                                <Text style={styles.perfStatLabel}>Assigned Duties</Text>
                            </View>
                            <View style={styles.perfStat}>
                                <Text style={styles.perfStatValue}>{student.attendanceRate}%</Text>
                                <Text style={styles.perfStatLabel}>Attendance Rate</Text>
                            </View>
                        </View>

                        <View style={styles.achievement}>
                            <Text style={styles.achievementLabel}>Recent Achievement</Text>
                            <View style={styles.achievementRow}>
                                <View style={styles.achievementIcon}>
                                    <Award size={16} color="#003087" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.achievementTitle}>
                                        {student.missedDuties === 0 ? 'Perfect Attendance!' : 'Keep Improving!'}
                                    </Text>
                                    <Text style={styles.achievementSub}>
                                        {student.missedDuties === 0
                                            ? 'No missed duties recorded yet 🎉'
                                            : `You have ${student.missedDuties} missed duty log(s)`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Account Actions */}
                    <View style={styles.infoCard}>
                        <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Account Actions</Text>
                        <TouchableOpacity style={styles.greyBtn}>
                            <Text style={styles.greyBtnText}>Download My Data</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.greyBtn}>
                            <Text style={styles.greyBtnText}>Privacy Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.redBtn} onPress={handleLogout}>
                            <LogOut size={15} color="#e7000b" />
                            <Text style={styles.redBtnText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#003087' },
    header: { backgroundColor: '#003087', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20 },
    title: { fontFamily: 'Poppins_700Bold', fontSize: 19, color: '#fff' },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
    body: { backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, minHeight: 900 },

    avatarCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#f3f4f6' },
    avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#003087', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    avatarName: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#101828' },
    avatarId: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#99a1af', marginTop: 2 },
    statusBadge: { backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10 },
    statusBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10.5, color: '#166534' },
    avatarStatsRow: { flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' },
    avatarStat: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
    avatarStatValue: { fontFamily: 'Poppins_700Bold', fontSize: 17 },
    avatarStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 9.5, color: '#4a5565', marginTop: 3, textAlign: 'center' },
    primaryBtn: { width: '100%', height: 44, backgroundColor: '#003087', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
    primaryBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#fff' },
    outlineBtn: { width: '100%', height: 44, borderWidth: 1.5, borderColor: '#003087', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    outlineBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#003087' },

    infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#f3f4f6' },
    cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#101828' },
    field: { marginBottom: 14 },
    fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10.5, color: '#4a5565', marginBottom: 4 },
    fieldValue: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#101828' },
    fieldHint: { fontFamily: 'Inter_400Regular', fontSize: 9.5, color: '#99a1af', marginTop: 3 },
    pillGreen: { alignSelf: 'flex-start', backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    pillGreenText: { fontFamily: 'Inter_700Bold', fontSize: 10.5, color: '#166534' },

    qualSummary: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 10, marginBottom: 14 },
    qualItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
    qualLabel: { fontFamily: 'Inter_400Regular', fontSize: 8.5, color: '#99a1af', textAlign: 'center' },
    qualValue: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: '#101828', marginTop: 4 },

    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: 14 },
    chip: { backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
    chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#003087' },
    qualNote: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#99a1af', lineHeight: 15 },

    perfCard: { backgroundColor: '#003087', borderRadius: 16, padding: 18, marginBottom: 14 },
    perfStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    perfStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, alignItems: 'center' },
    perfStatValue: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff' },
    perfStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 8.5, color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center' },
    achievement: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 },
    achievementLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9.5, color: '#ffb81c', letterSpacing: 0.4, marginBottom: 8 },
    achievementRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    achievementIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#ffb81c', alignItems: 'center', justifyContent: 'center' },
    achievementTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff' },
    achievementSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

    greyBtn: { height: 42, backgroundColor: '#f3f4f6', borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    greyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#364153' },
    redBtn: { flexDirection: 'row', gap: 6, height: 42, backgroundColor: '#fee2e2', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    redBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#e7000b' },
});