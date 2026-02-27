import { usePlayerTheme } from "@/theme/playerTheme";
import {
  ChevronRight,
  Globe,
  Heart,
  Info,
  LogOut,
  Moon,
  Palette,
  Sun,
  Trash2,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePlaylistStore } from "@/store";
import { useThemeStore } from "@/store/theme-store";
import {
  useWatchedMoviesStore,
  useWatchedSeriesStore,
} from "@/store/watched-store";

export default function SettingsScreen() {
  const theme = usePlayerTheme();
  const router = useRouter();
  const { selectedPlaylist, clearPlaylists } = usePlaylistStore();
  const watchedMoviesStore = useWatchedMoviesStore();
  const watchedSeriesStore = useWatchedSeriesStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const [showThemeModal, setShowThemeModal] = useState(false);

  const themeLabels = {
    dark: "Dark",
    light: "Light",
    system: "System",
  };

  const handleClearWatchHistory = () => {
    Alert.alert(
      "Clear Watch History",
      "Are you sure you want to clear all your watch history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            watchedMoviesStore.clearHistory();
            watchedSeriesStore.clearHistory();
          },
        },
      ],
    );
  };

  const handleClearPlaylists = () => {
    Alert.alert(
      "Clear Playlists",
      "Are you sure you want to remove all playlists?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearPlaylists();
          },
        },
      ],
    );
  };

  const SettingItem = ({
    icon,
    label,
    onPress,
    danger = false,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        pressed && { backgroundColor: theme.surfaceSecondary },
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          { backgroundColor: theme.surfaceSecondary },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[
          styles.settingLabel,
          { color: danger ? theme.accentError : theme.textPrimary },
        ]}
      >
        {label}
      </Text>
      {onPress && <ChevronRight size={18} color={theme.textMuted} />}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
      {title}
    </Text>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="GENERAL" />
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.surfacePrimary,
              borderColor: theme.border,
            },
          ]}
        >
          <SettingItem
            icon={<User size={20} color={theme.primary} />}
            label="Current Playlist"
            onPress={() => router.push("/playlists/manage")}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingItem
            icon={<Globe size={20} color={theme.primary} />}
            label="Language"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="CONTENT" />
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.surfacePrimary,
              borderColor: theme.border,
            },
          ]}
        >
          <SettingItem
            icon={<Heart size={20} color="#ec4899" />}
            label="Manage Favorites"
            onPress={() => router.push("/playlists")}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingItem
            icon={<Trash2 size={20} color={theme.accentError} />}
            label="Clear Watch History"
            onPress={handleClearWatchHistory}
          />
        </View>

        <SectionHeader title="APPEARANCE" />
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.surfacePrimary,
              borderColor: theme.border,
            },
          ]}
        >
          <SettingItem
            icon={<Palette size={20} color={theme.primary} />}
            label={`Theme: ${themeLabels[themeMode]}`}
            onPress={() => setShowThemeModal(true)}
          />
        </View>

        <SectionHeader title="DATA" />
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.surfacePrimary,
              borderColor: theme.border,
            },
          ]}
        >
          <SettingItem
            icon={<LogOut size={20} color={theme.accentError} />}
            label="Clear All Playlists"
            onPress={handleClearPlaylists}
            danger
          />
        </View>

        <SectionHeader title="ABOUT" />
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.surfacePrimary,
              borderColor: theme.border,
            },
          ]}
        >
          <SettingItem
            icon={<Info size={20} color={theme.textMuted} />}
            label="App Version"
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            IPTV Mobile App
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.textMuted }]}>
            Made with Expo
          </Text>
        </View>

        {/* Theme Modal */}
        <Modal
          visible={showThemeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowThemeModal(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowThemeModal(false)}
          >
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.surfacePrimary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Choose Theme
              </Text>
              {(["dark", "light", "system"] as const).map((mode) => (
                <Pressable
                  key={mode}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor:
                        themeMode === mode
                          ? theme.primary
                          : theme.surfaceSecondary,
                      borderColor:
                        themeMode === mode ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setThemeMode(mode);
                    setShowThemeModal(false);
                  }}
                >
                  {mode === "dark" && (
                    <Moon
                      size={20}
                      color={
                        themeMode === mode
                          ? theme.primaryForeground
                          : theme.textPrimary
                      }
                    />
                  )}
                  {mode === "light" && (
                    <Sun
                      size={20}
                      color={
                        themeMode === mode
                          ? theme.primaryForeground
                          : theme.textPrimary
                      }
                    />
                  )}
                  {mode === "system" && (
                    <Palette
                      size={20}
                      color={
                        themeMode === mode
                          ? theme.primaryForeground
                          : theme.textPrimary
                      }
                    />
                  )}
                  <Text
                    style={[
                      styles.themeOptionText,
                      {
                        color:
                          themeMode === mode
                            ? theme.primaryForeground
                            : theme.textPrimary,
                      },
                    ]}
                  >
                    {themeLabels[mode]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginLeft: 66,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
