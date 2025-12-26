import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import useSWR from "swr";

import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.365scores.com/web/v2"; // Example fallback

// --- Types ---
interface Competitor {
  id: number;
  name: string;
  score: number;
}

interface Game {
  id: number;
  statusGroup: number; // 2=Scheduled, 3=Live, 4=Finished
  statusText: string;
  gameTime: number;
  startTime: string;
  competitionId: number;
  competitionDisplayName: string;
  homeCompetitor: Competitor;
  awayCompetitor: Competitor;
}

// --- Utils ---
const formatDateForAPI = (date: Date) => {
  return date.toISOString().split("T")[0].replace(/-/g, "/"); // YYYY/MM/DD
};

const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
};

// --- Animations ---
const LivePulse = () => {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <View style={styles.pulseContainer}>
      <Animated.View style={[styles.pulseDot, style]} />
      <View style={styles.pulseInner} />
    </View>
  );
};

// --- Component: Match Card ---
const MatchCard = ({
  game,
  onPress,
}: {
  game: Game;
  onPress: (id: number) => void;
}) => {
  const theme = usePlayerTheme();
  const [showGoalPopup, setShowGoalPopup] = useState(false);

  const isLive = game.statusGroup === 3;
  const isFinished = game.statusGroup === 4;
  const isScheduled = game.statusGroup === 2;

  const currentTotalScore =
    game.homeCompetitor.score + game.awayCompetitor.score;
  const prevScoreRef = useRef(currentTotalScore);

  // Goal Detection Logic
  useEffect(() => {
    if (isLive && currentTotalScore > prevScoreRef.current) {
      setShowGoalPopup(true);
      const timer = setTimeout(() => setShowGoalPopup(false), 5000);
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = currentTotalScore;
  }, [currentTotalScore, isLive]);

  const progressPercent = Math.min((game.gameTime / 90) * 100, 100);

  return (
    <Pressable
      onPress={() => onPress(game.id)}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          borderColor: showGoalPopup ? "#FACC15" : theme.border,
          backgroundColor:
            isLive ? "rgba(255,255,255,0.03)" : theme.surfaceSecondary,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Goal Popup Overlay */}
      {showGoalPopup && (
        <Animated.View
          entering={ZoomIn}
          exiting={ZoomOut}
          style={styles.goalPopup}
        >
          <View style={styles.goalBadge}>
            <Text style={styles.goalText}>GOAL!</Text>
          </View>
          <View style={styles.goalScoreRow}>
            <Image
              source={{
                uri: `https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.homeCompetitor.id}`,
              }}
              style={styles.goalLogo}
            />
            <Text style={styles.goalScore}>
              {game.homeCompetitor.score} - {game.awayCompetitor.score}
            </Text>
            <Image
              source={{
                uri: `https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.awayCompetitor.id}`,
              }}
              style={styles.goalLogo}
            />
          </View>
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.statusRow}>
            {isLive ?
              <View style={styles.liveBadge}>
                <LivePulse />
                <Text style={styles.liveText}>{game.gameTime}</Text>
              </View>
            : <Text style={[styles.statusText, { color: theme.textMuted }]}>
                {isFinished ?
                  "FT"
                : new Date(game.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                }
              </Text>
            }
            <Text
              style={[styles.compName, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {game.competitionDisplayName}
            </Text>
          </View>
        </View>

        {/* Teams & Scores */}
        <View style={styles.teamsContainer}>
          <TeamRow
            competitor={game.homeCompetitor}
            opponentScore={game.awayCompetitor.score}
            isLive={isLive}
            isFinished={isFinished}
            isScheduled={isScheduled}
            theme={theme}
          />
          <TeamRow
            competitor={game.awayCompetitor}
            opponentScore={game.homeCompetitor.score}
            isLive={isLive}
            isFinished={isFinished}
            isScheduled={isScheduled}
            theme={theme}
          />
        </View>
      </View>

      {/* Progress Bar (Only live or finished) */}
      {!isScheduled && (
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: isLive ? theme.accentSuccess : theme.textMuted,
              },
            ]}
          />
        </View>
      )}
    </Pressable>
  );
};

const TeamRow = ({
  competitor,
  opponentScore,
  isLive,
  isFinished,
  isScheduled,
  theme,
}: any) => {
  const isWinner = isFinished && competitor.score > opponentScore;
  return (
    <View style={styles.teamRow}>
      <View style={styles.teamInfo}>
        <Image
          source={{
            uri: `https://imagecache.365scores.com/image/upload/f_auto,w_48/competitors/${competitor.id}`,
          }}
          style={styles.teamLogo}
        />
        <Text
          style={[
            styles.teamName,
            {
              color:
                isWinner || isLive ? theme.textPrimary : theme.textSecondary,
              fontWeight: isWinner ? "800" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {competitor.name}
        </Text>
      </View>
      {!isScheduled && (
        <Text
          style={[
            styles.scoreText,
            { color: isWinner || isLive ? theme.textPrimary : theme.textMuted },
          ]}
        >
          {competitor.score}
        </Text>
      )}
    </View>
  );
};

// --- Component: Match Details Modal ---
const MatchDetailsModal = ({
  gameId,
  visible,
  onClose,
}: {
  gameId: number | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const theme = usePlayerTheme();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && gameId) {
      setLoading(true);
      // Simulating API call - replace with your actual fetcher
      // fetch(`${API_URL}/game/${gameId}`)...
      // Mocking data for demo purposes since we don't have the real endpoint
      const timer = setTimeout(() => {
        setMatch({
          // Mock data structure matching your component needs
          homeCompetitor: { id: 1, name: "Home Team", score: 2 },
          awayCompetitor: { id: 2, name: "Away Team", score: 1 },
          statusText: "65'",
          stats: [
            { name: "Possession", homeValue: "60%", awayValue: "40%" },
            { name: "Shots", homeValue: "12", awayValue: "5" },
            { name: "Corners", homeValue: "8", awayValue: "2" },
          ],
          events: [
            {
              time: "12",
              isHome: true,
              playerName: "Player A",
              typeText: "Goal",
            },
            {
              time: "45",
              isHome: false,
              playerName: "Player B",
              typeText: "Yellow Card",
            },
          ],
        });
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible, gameId]);

  if (!visible) return null;

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: "#0f0f0f" }]}>
          {/* Handle Bar */}
          <View style={styles.modalHandle} />

          {/* Close Button */}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X color='#fff' size={24} />
          </Pressable>

          {loading ?
            <View style={styles.modalLoading}>
              <ActivityIndicator size='large' color={theme.primary} />
            </View>
          : match ?
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Scoreboard */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTeam}>
                  <Image
                    source={{
                      uri: `https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/1`,
                    }}
                    style={styles.modalLogo}
                  />
                  <Text
                    style={[styles.modalTeamName, { color: theme.textPrimary }]}
                  >
                    {match.homeCompetitor.name}
                  </Text>
                </View>
                <View style={styles.modalScoreBox}>
                  <Text
                    style={[styles.modalScore, { color: theme.textPrimary }]}
                  >
                    {match.homeCompetitor.score} - {match.awayCompetitor.score}
                  </Text>
                  <Text
                    style={[styles.modalStatus, { color: theme.accentSuccess }]}
                  >
                    {match.statusText}
                  </Text>
                </View>
                <View style={styles.modalTeam}>
                  <Image
                    source={{
                      uri: `https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/2`,
                    }}
                    style={styles.modalLogo}
                  />
                  <Text
                    style={[styles.modalTeamName, { color: theme.textPrimary }]}
                  >
                    {match.awayCompetitor.name}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                  MATCH STATS
                </Text>
                {match.stats?.map((stat: any, i: number) => {
                  const homeVal = parseFloat(stat.homeValue);
                  const awayVal = parseFloat(stat.awayValue);
                  const total = homeVal + awayVal;
                  const percent = total === 0 ? 50 : (homeVal / total) * 100;

                  return (
                    <View key={i} style={styles.statRow}>
                      <View style={styles.statLabels}>
                        <Text style={styles.statVal}>{stat.homeValue}</Text>
                        <Text
                          style={[
                            styles.statName,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {stat.name}
                        </Text>
                        <Text style={styles.statVal}>{stat.awayValue}</Text>
                      </View>
                      <View style={styles.statBarBg}>
                        <View
                          style={[
                            styles.statBarFill,
                            {
                              width: `${percent}%`,
                              backgroundColor: theme.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          : null}
        </View>
      </View>
    </Modal>
  );
};
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- Main Screen ---
export default function LiveScoresScreen() {
  const theme = usePlayerTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // 2. Fetch data with dynamic date param
  const { data, error, isLoading } = useSWR<Game[]>(
    `${process.env.EXPO_PUBLIC_API_URL}/live-matches?date=${formatDateForAPI(currentDate)}`,
    fetcher,
    { refreshInterval: 60000 } // Higher frequency for live scores
  );

  const games = useMemo(() => data || [], [data]);

  // Derived State
  const liveMatches = useMemo(
    () => games.filter((g) => g.statusGroup === 3),
    [games]
  );
  const groupedGames = useMemo(() => {
    const others = games.filter((g) => g.statusGroup !== 3);
    return others.reduce(
      (acc, game) => {
        const key = game.competitionDisplayName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(game);
        return acc;
      },
      {} as Record<string, Game[]>
    );
  }, [games]);

  const handleDayChange = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {/* Date Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <View style={styles.headerTop}>
            <Calendar size={12} color={theme.textMuted} />
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>
              MATCHDAY SCHEDULE
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={[styles.dateTitle, { color: theme.textPrimary }]}>
              {formatDisplayDate(currentDate)}
            </Text>
            {new Date().toDateString() !== currentDate.toDateString() && (
              <Pressable
                onPress={() => setCurrentDate(new Date())}
                style={styles.todayBtn}
              >
                <Text style={styles.todayBtnText}>Return Today</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View
          style={[
            styles.navContainer,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Pressable onPress={() => handleDayChange(-1)} style={styles.navBtn}>
            <ChevronLeft size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={() => handleDayChange(1)} style={styles.navBtn}>
            <ChevronRight size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ?
          <ActivityIndicator
            size='large'
            color={theme.primary}
            style={{ marginTop: 50 }}
          />
        : <>
            {/* Live Section */}
            {liveMatches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LivePulse />
                  <Text style={styles.sectionTitle}>LIVE NOW</Text>
                </View>
                <FlashList
                  horizontal
                  data={liveMatches}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  renderItem={({ item }) => (
                    <MatchCard game={item} onPress={setSelectedGameId} />
                  )}
                />
              </View>
            )}

            {/* Grouped Competitions */}
            {Object.entries(groupedGames).map(([compName, matches]) => {
              const compId = matches[0].competitionId;
              return (
                <View key={compName} style={styles.section}>
                  <View style={styles.compHeader}>
                    <Image
                      source={{
                        uri: `https://imagecache.365scores.com/image/upload/f_auto,w_48/competitions/${compId}`,
                      }}
                      style={styles.goalLogo}
                    />
                    <Text
                      style={[styles.compTitle, { color: theme.textSecondary }]}
                    >
                      {compName}
                    </Text>
                  </View>
                  <FlashList
                    horizontal
                    data={matches}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({ item }) => (
                      <MatchCard game={item} onPress={setSelectedGameId} />
                    )}
                  />
                </View>
              );
            })}
          </>
        }
      </ScrollView>

      {/* Modal */}
      <MatchDetailsModal
        gameId={selectedGameId}
        visible={!!selectedGameId}
        onClose={() => setSelectedGameId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dateTitle: { fontSize: 22, fontWeight: "800" },
  todayBtn: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  todayBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: "black",
    textTransform: "uppercase",
  },

  navContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  navBtn: { padding: 10 },
  divider: { width: 1, height: 16, backgroundColor: "rgba(255,255,255,0.1)" },

  // Sections
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
    letterSpacing: 1,
  },
  horizontalList: { paddingHorizontal: 20 },

  compHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  compTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // Match Card
  cardContainer: {
    width: 300,
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },
  cardContent: { padding: 16, flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  liveText: { fontSize: 11, fontWeight: "800", color: "#4ade80" },
  statusText: { fontSize: 11, fontWeight: "800" },
  compName: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    opacity: 0.7,
    flex: 1,
    textAlign: "right",
  },

  teamsContainer: { gap: 12 },
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  teamLogo: { width: 24, height: 24 },
  teamName: { fontSize: 15 },
  scoreText: { fontSize: 18, fontWeight: "800" },

  progressBarTrack: {
    height: 4,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  progressBarFill: { height: "100%" },

  // Goal Popup
  goalPopup: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  goalBadge: {
    backgroundColor: "#FACC15",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  goalText: { color: "black", fontWeight: "900", fontSize: 12 },
  goalScoreRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  goalLogo: { width: 40, height: 40 },
  goalScore: { color: "white", fontSize: 24, fontWeight: "900" },

  // Animations
  pulseContainer: {
    width: 10,
    height: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ade80",
  },
  pulseInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "85%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginTop: 12,
    borderRadius: 2,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  modalLoading: { flex: 1, justifyContent: "center", alignItems: "center" },

  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  modalTeam: { alignItems: "center", width: 80 },
  modalLogo: { width: 50, height: 50, marginBottom: 8 },
  modalTeamName: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  modalScoreBox: { alignItems: "center" },
  modalScore: { fontSize: 40, fontWeight: "900", letterSpacing: -2 },
  modalStatus: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  sectionContainer: { padding: 24 },

  statRow: { marginBottom: 12 },
  statLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statVal: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    width: 30,
    textAlign: "center",
  },
  statName: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  statBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 3,
    flexDirection: "row",
  },
  statBarFill: { height: "100%" },
});
