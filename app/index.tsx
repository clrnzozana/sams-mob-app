import { authenticatedRequest, getAuthToken } from "@/constants/api";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  ArrowRight,
  Clock,
  Star,
  TrendingUp,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const LoadingScreen = () => {
  const [pulseAnim] = useState(() => new Animated.Value(0.9));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={styles.loadingContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#030F2E" />
      <Animated.View
        style={[{ transform: [{ scale: pulseAnim }] }, { marginBottom: 16 }]}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </Animated.View>
      <Text style={styles.loadingSubtitle}>NU LIPA</Text>
      <ActivityIndicator
        size="small"
        color="#F4B333"
        style={styles.loadingSpinner}
      />
    </SafeAreaView>
  );
};

const LandingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Staggered animation values
  const [fadeAnimHeader] = useState(() => new Animated.Value(0));
  const [slideAnimTitle] = useState(() => new Animated.Value(20));
  const [fadeAnimTitle] = useState(() => new Animated.Value(0));
  const [slideAnimCTA] = useState(() => new Animated.Value(30));
  const [fadeAnimCTA] = useState(() => new Animated.Value(0));

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      const checkToken = async () => {
        const token = await getAuthToken();
        if (token) {
          try {
            await authenticatedRequest("/student_dashboard_snapshot.php");
            router.replace("/(tabs)/dashboard");
            return;
          } catch {
            // Token is invalid/expired and has been cleared from storage
          }
        }
        setIsLoading(false);
        SplashScreen.hideAsync().catch(() => undefined);

        // Start staggered entrance animations after loading screen hides
        Animated.sequence([
          Animated.timing(fadeAnimHeader, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(fadeAnimTitle, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnimTitle, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(fadeAnimCTA, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnimCTA, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      };

      checkToken();
    }, 700);

    return () => clearTimeout(timer);
  }, [fontsLoaded, fadeAnimCTA, fadeAnimHeader, fadeAnimTitle, slideAnimCTA, slideAnimTitle]);

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061D5A" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Top Section */}
        <View style={styles.heroSection}>
          <Animated.View style={{ opacity: fadeAnimHeader }}>
            <View style={styles.logoRow}>
              <Image
                source={require('../assets/images/logo.png')}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.logoTextSub}>NU LIPA</Text>
              </View>
            </View>

            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeText}>NOW ACCEPTING APPLICATIONS</Text>
            </View>
          </Animated.View>

          <Animated.View style={{
            opacity: fadeAnimTitle,
            transform: [{ translateY: slideAnimTitle }]
          }}>
            <Text style={styles.heroTitle}>
              {"Student\n"}
              <Text style={{ color: "#F4B333" }}>Assistant</Text>
              {"\nProgram"}
            </Text>

            <Text style={styles.heroSub}>
              Build skills that matter.
            </Text>

            <TouchableOpacity
              style={styles.btnPrimaryFull}
              onPress={() => router.push("/login")}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>Sign In</Text>
              <ArrowRight size={16} color="#061D5A" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Floating Stats Card overlapping the seam */}
        <Animated.View style={[
          styles.floatingStatsWrapper,
          { opacity: fadeAnimCTA, transform: [{ translateY: slideAnimCTA }] }
        ]}>
          <View style={styles.floatingStatsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>50+</Text>
              <Text style={styles.statLabel}>Active SAs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>20+</Text>
              <Text style={styles.statLabel}>Offices</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>128h</Text>
              <Text style={styles.statLabel}>Per Term</Text>
            </View>
          </View>
        </Animated.View>

        {/* White Body Container */}
        <View style={styles.landingBody}>

          <Text style={styles.sectionHeader}>Why become an SA?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.benefitsCarousel}
            snapToInterval={180}
            decelerationRate="fast"
          >
            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Clock size={20} color="#061D5A" />
              </View>
              <Text style={styles.benefitStrong}>Flexible Hours</Text>
              <Text style={styles.benefitSpan}>
                Schedule fits your class timetable perfectly
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <TrendingUp size={20} color="#061D5A" />
              </View>
              <Text style={styles.benefitStrong}>Skill Development</Text>
              <Text style={styles.benefitSpan}>
                Level up your professional capabilities
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Star size={20} color="#061D5A" />
              </View>
              <Text style={styles.benefitStrong}>Career Growth</Text>
              <Text style={styles.benefitSpan}>
                Build connections for your dream career
              </Text>
            </View>
          </ScrollView>

          {/* Timeline Requirements */}
          <Text style={[styles.sectionHeader, { marginTop: 32 }]}>How to qualify</Text>
          <View style={styles.timelineContainer}>
            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View style={styles.timelineNode}>
                <Text style={styles.timelineNodeText}>1</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Enrollment</Text>
                <Text style={styles.timelineDesc}>Must be currently enrolled at NU Lipa for the current term.</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineNode}>
                <Text style={styles.timelineNodeText}>2</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Academics</Text>
                <Text style={styles.timelineDesc}>Maintain good academic standing with no failing grades.</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineNode}>
                <Text style={styles.timelineNodeText}>3</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Availability</Text>
                <Text style={styles.timelineDesc}>Be available to render 10-20 hours per week.</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineNode}>
                <Text style={styles.timelineNodeText}>4</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Application</Text>
                <Text style={styles.timelineDesc}>Complete your application exclusively on the SAMS web portal.</Text>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#061D5A",
  },
  loadingSubtitle: {
    color: "#F4B333",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 4,
  },
  loadingSpinner: {
    marginTop: 18,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#061D5A",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Changed root back to white so overlap works
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 70, // Extra padding at bottom for the overlapping card
    backgroundColor: "#061D5A",

  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    paddingVertical: 10,
    marginBottom: 16,
  },
  logoTextSub: {
    color: "#F4B333",
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 18,
    opacity: 0.9,
    letterSpacing: 0.4,
  },
  heroBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(244,179,51,0.1)",
    borderWidth: 1,
    borderColor: "rgba(244,179,51,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    backgroundColor: "#F4B333",
    borderRadius: 3,
  },
  heroBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#F4B333",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: "Poppins_800ExtraBold",
    lineHeight: 42,
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 28,
    lineHeight: 20,
    textAlign: "center",
  },
  btnPrimaryFull: {
    height: 52,
    backgroundColor: "#F4B333",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#061D5A",
  },
  floatingStatsWrapper: {
    paddingHorizontal: 24,
    marginTop: -40, // Negative margin to overlap the hero section
    zIndex: 10,
  },
  floatingStatsCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: "space-evenly",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    // Standard clean drop shadow, no color glows
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statNum: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#061D5A",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#64748b",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e2e8f0",
  },
  landingBody: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 36,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#061D5A",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  benefitsCarousel: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 10,
  },
  benefitCard: {
    width: 164,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitStrong: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  benefitSpan: {
    fontSize: 11.5,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
    lineHeight: 16,
  },
  timelineContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  timelineLine: {
    position: "absolute",
    left: 41,
    top: 10,
    bottom: 30,
    width: 2,
    backgroundColor: "#e2e8f0",
    zIndex: 1,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 24,
    zIndex: 2,
  },
  timelineNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#061D5A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#ffffff",
    marginRight: 16,
  },
  timelineNodeText: {
    color: "#F4B333",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 6,
  },
  timelineTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    color: "#475569",
    lineHeight: 18,
  },
});

export default LandingScreen;
