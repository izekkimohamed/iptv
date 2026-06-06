import { usePlayerTheme } from "@/theme/playerTheme";
import { usePlaylistStore } from "@/store";
import { useThemeStore, type AccentColor } from "@/store/theme-store";
import { useWatchedMoviesStore, useWatchedSeriesStore } from "@/store/watched-store";
import { useSearchHistoryStore } from "@/store/search-history-store";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Clock,
  Clapperboard,
  Film,
  ListVideo,
  Moon,
  Search,
  Settings2,
  Sun,
  Tv2,
  Trash2,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCENT_COLORS: { key: AccentColor; hex: string }[] = [
  { key: "orange", hex: "#D97706" },
  { key: "blue",   hex: "#3B82F6" },
  { key: "purple", hex: "#8B5CF6" },
  { key: "green",  hex: "#10B981" },
  { key: "red",    hex: "#EF4444" },
  { key: "pink",   hex: "#EC4899" },
];

function formatExpiry(expDate: string): { label: string; urgent: boolean } {
  if (!expDate || expDate === "Unlimited") return { label: "Unlimited", urgent: false };
  const ts = Number(expDate);
  const date = isNaN(ts) ? new Date(expDate) : new Date(ts * 1000);
  if (isNaN(date.getTime())) return { label: expDate, urgent: false };
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Expired", urgent: true };
  if (days === 0) return { label: "Expires today", urgent: true };
  if (days <= 7) return { label: `Expires in ${days}d`, urgent: true };
  if (days <= 30) return { label: `Expires in ${days}d`, urgent: false };
  return {
    label: date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
    urgent: false,
  };
}

export default function SettingsScreen() {
  const theme = usePlayerTheme();
  const router = useRouter();
  const { selectedPlaylist } = usePlaylistStore();
  const { themeMode, setThemeMode, accentColor, setAccentColor } = useThemeStore();

  const movieCount = useWatchedMoviesStore((s) => s.movies.length);
  const seriesCount = useWatchedSeriesStore((s) => s.series.length);
  const searchCount = useSearchHistoryStore((s) => s.searches.length);
  const clearMovies = useWatchedMoviesStore((s) => s.clearHistory);
  const clearSeries = useWatchedSeriesStore((s) => s.clearHistory);
  const clearSearches = useSearchHistoryStore((s) => s.clearSearches);

  const confirmClear = (title: string, onConfirm: () => void) =>
    Alert.alert(title, "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: onConfirm },
    ]);

  const expiry = selectedPlaylist?.expDate ? formatExpiry(selectedPlaylist.expDate) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Settings2 size={22} color={theme.primary} strokeWidth={2} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Active Playlist Card */}
        <Pressable
          style={({ pressed }) => [
            styles.playlistCard,
            { backgroundColor: theme.surfacePrimary, borderColor: theme.border },
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => router.push("/playlists/manage")}
        >
          <View style={[styles.playlistIconWrap, { backgroundColor: `${theme.primary}20` }]}>
            <ListVideo size={22} color={theme.primary} />
          </View>
          <View style={styles.playlistInfo}>
            <Text style={[styles.playlistLabel, { color: theme.textMuted }]}>Active Playlist</Text>
            {selectedPlaylist ? (
              <>
                <Text style={[styles.playlistName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {selectedPlaylist.username}
                </Text>
                <View style={styles.playlistMeta}>
                  <View style={[styles.statusDot, {
                    backgroundColor: selectedPlaylist.status === "Active" ? theme.accentSuccess : theme.accentError,
                  }]} />
                  <Text style={[styles.playlistMetaText, { color: theme.textMuted }]}>
                    {selectedPlaylist.status}
                  </Text>
                  {expiry && (
                    <>
                      <Text style={[styles.playlistMetaText, { color: theme.textMuted }]}>·</Text>
                      <Text style={[styles.playlistMetaText, {
                        color: expiry.urgent ? theme.accentError : theme.textMuted,
                        fontWeight: expiry.urgent ? "700" : "500",
                      }]}>
                        {expiry.label}
                      </Text>
                    </>
                  )}
                </View>
              </>
            ) : (
              <Text style={[styles.playlistName, { color: theme.textMuted }]}>No playlist selected</Text>
            )}
          </View>
          <ChevronRight size={18} color={theme.textMuted} />
        </Pressable>

        {/* Watch Stats */}
        <View style={styles.statsRow}>
          <StatCard icon={<Film size={18} color={theme.primary} />} value={movieCount} label="Movies" theme={theme} />
          <StatCard icon={<Tv2 size={18} color={theme.primary} />} value={seriesCount} label="Series" theme={theme} />
          <StatCard icon={<Search size={18} color={theme.primary} />} value={searchCount} label="Searches" theme={theme} />
        </View>

        {/* Appearance */}
        <SectionLabel title="APPEARANCE" theme={theme} />
        <View style={[styles.section, { backgroundColor: theme.surfacePrimary, borderColor: theme.border }]}>
          {/* Theme toggle */}
          <View style={styles.themeRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.surfaceSecondary }]}>
              {themeMode === "light" ? <Sun size={18} color={theme.primary} /> : <Moon size={18} color={theme.primary} />}
            </View>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Theme</Text>
            <View style={[styles.segmented, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              {(["dark", "light", "system"] as const).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[styles.segment, themeMode === mode && { backgroundColor: theme.primary, borderRadius: 8 }]}
                >
                  <Text style={[styles.segmentText, {
                    color: themeMode === mode ? theme.primaryForeground : theme.textMuted,
                  }]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Divider theme={theme} />

          {/* Accent color */}
          <View style={styles.accentRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.surfaceSecondary }]}>
              <View style={[styles.accentDot, { backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Accent Color</Text>
          </View>
          <View style={styles.swatchesRow}>
            {ACCENT_COLORS.map(({ key, hex }) => (
              <Pressable
                key={key}
                onPress={() => setAccentColor(key)}
                style={styles.swatchWrap}
              >
                <View style={[styles.swatch, { backgroundColor: hex }, accentColor === key && styles.swatchActive]}>
                  {accentColor === key && <View style={styles.swatchInner} />}
                </View>
                <Text style={[styles.swatchLabel, { color: accentColor === key ? hex : theme.textMuted }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* History */}
        <SectionLabel title="HISTORY" theme={theme} />
        <View style={[styles.section, { backgroundColor: theme.surfacePrimary, borderColor: theme.border }]}>
          <Row
            icon={<Clock size={18} color={theme.primary} />}
            label="Watch History"
            value={`${movieCount + seriesCount} items`}
            onPress={() => confirmClear("Clear Watch History", () => { clearMovies(); clearSeries(); })}
            actionLabel="Clear"
            danger
            theme={theme}
          />
          <Divider theme={theme} />
          <Row
            icon={<Search size={18} color={theme.primary} />}
            label="Search History"
            value={`${searchCount} searches`}
            onPress={() => confirmClear("Clear Search History", clearSearches)}
            actionLabel="Clear"
            danger
            theme={theme}
          />
        </View>

        {/* Playlists */}
        <SectionLabel title="PLAYLISTS" theme={theme} />
        <View style={[styles.section, { backgroundColor: theme.surfacePrimary, borderColor: theme.border }]}>
          <Row
            icon={<Clapperboard size={18} color={theme.primary} />}
            label="Add New Playlist"
            onPress={() => router.push("/playlists")}
            theme={theme}
          />
        </View>

        {/* Danger Zone */}
        <SectionLabel title="DANGER ZONE" theme={theme} />
        <View style={[styles.section, { backgroundColor: theme.surfacePrimary, borderColor: theme.border }]}>
          <Row
            icon={<Trash2 size={18} color={theme.accentError} />}
            label="Clear All Data"
            sublabel="Removes watch history & search history"
            onPress={() => confirmClear("Clear All Data", () => { clearMovies(); clearSeries(); clearSearches(); })}
            danger
            theme={theme}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ title, theme }: { title: string; theme: any }) {
  return <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{title}</Text>;
}

function Divider({ theme }: { theme: any }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

function StatCard({ icon, value, label, theme }: { icon: React.ReactNode; value: number; label: string; theme: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surfacePrimary, borderColor: theme.border }]}>
      {icon}
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function Row({
  icon, label, sublabel, value, onPress, actionLabel, danger = false, theme,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  value?: string;
  onPress?: () => void;
  actionLabel?: string;
  danger?: boolean;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceSecondary }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.surfaceSecondary }]}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: danger ? theme.accentError : theme.textPrimary }]}>{label}</Text>
        {sublabel && <Text style={[styles.rowSublabel, { color: theme.textMuted }]}>{sublabel}</Text>}
      </View>
      {value && !actionLabel && (
        <Text style={[styles.rowValue, { color: theme.textMuted }]}>{value}</Text>
      )}
      {actionLabel ? (
        <View style={[styles.actionBadge, { backgroundColor: `${theme.accentError}18`, borderColor: `${theme.accentError}30` }]}>
          <Text style={[styles.actionBadgeText, { color: theme.accentError }]}>{actionLabel}</Text>
        </View>
      ) : (
        onPress && <ChevronRight size={16} color={theme.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },

  content: { padding: 16, paddingBottom: 40 },

  playlistCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12,
  },
  playlistIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  playlistInfo: { flex: 1, gap: 2 },
  playlistLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  playlistName: { fontSize: 15, fontWeight: "700" },
  playlistMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  playlistMetaText: { fontSize: 12, fontWeight: "500" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  statCard: {
    flex: 1, alignItems: "center", gap: 4,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600" },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", letterSpacing: 1,
    marginTop: 20, marginBottom: 8, marginLeft: 4,
  },

  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },

  themeRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  segmented: { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 3, gap: 2 },
  segment: { paddingHorizontal: 10, paddingVertical: 5 },
  segmentText: { fontSize: 12, fontWeight: "700" },

  accentRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 },
  accentDot: { width: 16, height: 16, borderRadius: 8 },
  swatchesRow: { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  swatchWrap: { alignItems: "center", gap: 5 },
  swatch: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  swatchInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  swatchLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "capitalize",
  },

  divider: { height: 1, marginLeft: 58 },

  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconWrap: { width: 34, height: 34, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  rowContent: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowSublabel: { fontSize: 12, fontWeight: "500" },
  rowValue: { fontSize: 13, fontWeight: "600" },
  actionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  actionBadgeText: { fontSize: 12, fontWeight: "700" },
});
