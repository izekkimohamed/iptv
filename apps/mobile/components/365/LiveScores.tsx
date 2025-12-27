import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";
import MatchDetailsModal from "./Details";
import MatchCard from "./MatchCard";

// --- Types ---
export interface Competitor {
  id: number;
  name: string;
  score: number;
}

export interface Game {
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
export const formatDateForAPI = (date: Date): string => {
  return date.toLocaleDateString("en-GB"); // Returns DD/MM/YYYY
};

export const formatDisplayDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- Main Screen ---
export default function LiveScoresScreen() {
  const theme = usePlayerTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/live-matches?date=${formatDateForAPI(currentDate)}`;

  const {
    data: games = [],
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR<Game[]>(apiUrl, fetcher, {
    refreshInterval: (latestData) => {
      const hasLiveAction = latestData?.some((g) => g.statusGroup === 3);
      return hasLiveAction ? 30000 : 60000;
    },
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  });

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

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const onRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
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
              <Pressable onPress={handleGoToToday} style={styles.todayBtn}>
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
          <Pressable onPress={handlePrevDay} style={styles.navBtn}>
            <ChevronLeft size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={handleNextDay} style={styles.navBtn}>
            <ChevronRight size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isValidating && games.length > 0}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.surfaceSecondary}
          />
        }
      >
        {isLoading && games.length === 0 ?
          <ActivityIndicator
            size='large'
            color={theme.primary}
            style={{ marginTop: 50 }}
          />
        : games.length === 0 && !error ?
          <View style={styles.emptyContainer}>
            <RefreshCcw
              size={48}
              color={theme.textMuted}
              style={{ opacity: 0.5, marginBottom: 10 }}
            />
            <Text style={{ color: theme.textSecondary, fontWeight: "600" }}>
              No matches scheduled
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>
              Try changing the date
            </Text>
          </View>
        : <>
            {/* Live Section */}
            {liveMatches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.liveIndicator}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: theme.accentError },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.sectionTitle, { color: theme.accentError }]}
                  >
                    LIVE NOW
                  </Text>
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
                      style={styles.compLogo}
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

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
    fontWeight: "700",
    letterSpacing: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  dateTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  todayBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 6,
  },
  todayBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  // Navigation
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    height: 36,
  },
  navBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // Content
  scrollContent: { paddingBottom: 40 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },

  // Sections
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Competition Header
  compHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  compLogo: {
    width: 24,
    height: 24,
  },
  compTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  horizontalList: { paddingHorizontal: 20 },
});
