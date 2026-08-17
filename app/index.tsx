import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated, StatusBar, ActivityIndicator } from 'react-native';
import { GraduationCap, Clock, TrendingUp, Star, ClipboardList } from 'lucide-react-native';
import { useFonts, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const LoadingScreen = () => {
  const pulseAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 700, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={styles.loadingContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#030F2E" />
      <Animated.View style={[styles.loadingLogo, { transform: [{ scale: pulseAnim }] }]}>
        <GraduationCap size={34} color="#061D5A" />
      </Animated.View>
      <Text style={styles.loadingTitle}>SAMS</Text>
      <Text style={styles.loadingSubtitle}>NU LIPA</Text>
      <ActivityIndicator size="small" color="#F4B333" style={styles.loadingSpinner} />
    </SafeAreaView>
  );
};

const LandingScreen = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      SplashScreen.hideAsync().catch(() => undefined);
    }, 700);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#030F2E" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <GraduationCap size={20} color="#061D5A" />
            </View>
            <View>
              <Text style={styles.logoTextMain}>SAMS</Text>
              <Text style={styles.logoTextSub}>NU LIPA</Text>
            </View>
          </View>

          <View style={styles.heroBadge}>
            <Animated.View style={[styles.heroBadgeDot, { opacity: pulseAnim }]} />
            <Text style={styles.heroBadgeText}>NOW ACCEPTING APPLICATIONS</Text>
          </View>

          <Text style={styles.heroTitle}>
            {'Student\n'}
            <Text style={{ color: '#F4B333' }}>Assistant</Text>
            {'\nProgram'}
          </Text>

          <Text style={styles.heroSub}>Earn while you learn. Build skills that matter.</Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatText}>500+ <Text style={{ color: '#F4B333' }}>Active SAs</Text></Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatText}>20+ <Text style={{ color: '#F4B333' }}>Offices</Text></Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatText}>128h <Text style={{ color: '#F4B333' }}>Per Term</Text></Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnPrimaryFull}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.btnPrimaryText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.landingBody}>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Clock size={18} color="#061D5A" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitStrong}>Flexible Hours</Text>
                <Text style={styles.benefitSpan}>Schedule fits your class timetable perfectly</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <TrendingUp size={18} color="#061D5A" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitStrong}>Skill Development</Text>
                <Text style={styles.benefitSpan}>Level up your professional capabilities</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Star size={18} color="#061D5A" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitStrong}>Career Growth</Text>
                <Text style={styles.benefitSpan}>Build connections for your dream career</Text>
              </View>
            </View>
          </View>

          <View style={styles.requirementsCard}>
            <View style={styles.reqHeader}>
              <ClipboardList size={14} color="#F4B333" />
              <Text style={styles.reqHeaderText}>REQUIREMENTS</Text>
            </View>

            <View style={styles.reqList}>
              <View style={styles.reqItem}>
                <View style={styles.reqNum}><Text style={styles.reqNumText}>1</Text></View>
                <Text style={styles.reqText}>Currently enrolled at NU Lipa</Text>
              </View>
              <View style={styles.reqItem}>
                <View style={styles.reqNum}><Text style={styles.reqNumText}>2</Text></View>
                <Text style={styles.reqText}>Good academic standing (no failing grades)</Text>
              </View>
              <View style={styles.reqItem}>
                <View style={styles.reqNum}><Text style={styles.reqNumText}>3</Text></View>
                <Text style={styles.reqText}>Available 10-20 hours per week</Text>
              </View>
              <View style={styles.reqItem}>
                <View style={styles.reqNum}><Text style={styles.reqNumText}>4</Text></View>
                <Text style={styles.reqText}>Complete application on the SAMS web portal</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030F2E' },
  loadingLogo: { width: 84, height: 84, borderRadius: 22, backgroundColor: '#F4B333', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loadingTitle: { color: '#ffffff', fontFamily: 'Poppins_700Bold', fontSize: 28, letterSpacing: 2 },
  loadingSubtitle: { color: '#F4B333', fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 3, marginTop: 4 },
  loadingSpinner: { marginTop: 18 },
  safeArea: { flex: 1, backgroundColor: '#030F2E' },
  heroSection: { paddingHorizontal: 24, paddingBottom: 36, backgroundColor: '#030F2E' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, marginBottom: 10 },
  logoIcon: { width: 38, height: 38, backgroundColor: '#F4B333', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoTextMain: { color: '#ffffff', fontFamily: 'Poppins_700Bold', fontSize: 13, lineHeight: 14 },
  logoTextSub: { color: '#F4B333', fontFamily: 'Inter_600SemiBold', fontSize: 10, opacity: 0.8 },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(244,179,51,0.15)', borderWidth: 1, borderColor: 'rgba(244,179,51,0.3)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 14 },
  heroBadgeDot: { width: 5, height: 5, backgroundColor: '#F4B333', borderRadius: 2.5 },
  heroBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#F4B333', letterSpacing: 0.5 },
  heroTitle: { fontSize: 34, fontFamily: 'Poppins_800ExtraBold', lineHeight: 38, color: '#ffffff', marginBottom: 8 },
  heroSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.55)', marginBottom: 20, lineHeight: 18 },
  heroStats: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  heroStat: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12 },
  heroStatText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#ffffff' },
  btnPrimaryFull: { height: 48, backgroundColor: '#F4B333', borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#F4B333', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 5 },
  btnPrimaryText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#061D5A' },
  landingBody: { padding: 24, flex: 1, backgroundColor: '#ffffff' },
  benefitsList: { gap: 14, marginBottom: 20 },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  benefitIcon: { width: 38, height: 38, backgroundColor: '#EAEEF8', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  benefitText: { flex: 1 },
  benefitStrong: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#061D5A', marginBottom: 2 },
  benefitSpan: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94A3B8', lineHeight: 16 },
  requirementsCard: { backgroundColor: '#061D5A', borderRadius: 20, padding: 18 },
  reqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  reqHeaderText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#F4B333', letterSpacing: 1 },
  reqList: { gap: 10 },
  reqItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reqNum: { width: 20, height: 20, backgroundColor: '#F4B333', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  reqNumText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#061D5A' },
  reqText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.75)', lineHeight: 16, flex: 1 },
});

export default LandingScreen;