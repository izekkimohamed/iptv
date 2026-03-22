import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import {
  CheckCircle2,
  ChevronLeft,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function formatExpiry(expDate: string): { label: string; urgent: boolean } {
  if (!expDate || expDate === "Unlimited") return { label: "Unlimited", urgent: false };
  const ts = Number(expDate);
  const date = isNaN(ts) ? new Date(expDate) : new Date(ts * 1000);
  if (isNaN(date.getTime())) return { label: expDate, urgent: false };
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Expired", urgent: true };
  if (days === 0) return { label: "Expires today", urgent: true };
  if (days <= 7) return { label: `${days}d left`, urgent: true };
  if (days <= 30) return { label: `${days}d left`, urgent: false };
  return {
    label: date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
    urgent: false,
  };
}

function formatUpdatedAt(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function PlaylistsManageScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const { playlists, removePlaylist, selectPlaylist, selectedPlaylist, updatePlaylist } = usePlaylistStore();
  const utils = trpc.useUtils();

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { mutate: deletePlaylist, isPending: isDeleting } =
    trpc.playlists.deletePlaylist.useMutation({
      onSuccess: (_, variables) => {
        removePlaylist(variables.playlistId);
        if (selectedPlaylist?.id === variables.playlistId && playlists.length > 1) {
          const next = playlists.find((p) => p.id !== variables.playlistId);
          if (next) selectPlaylist(next);
        }
        utils.playlists.getPlaylists.invalidate();
      },
    });

  const { mutate: syncPlaylist } = trpc.playlists.updatePlaylists.useMutation({
    onSuccess: (data, variables) => {
      updatePlaylist(variables.playlistId, { updatedAt: new Date().toISOString() });
      setUpdatingId(null);
    },
    onError: () => setUpdatingId(null),
  });

  const handleDelete = (playlistId: number) => {
    Alert.alert(
      "Remove Playlist",
      "This will remove the playlist and all its content from your library.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => deletePlaylist({ playlistId }) },
      ],
    );
  };

  const handleSync = (playlistId: number) => {
    setUpdatingId(playlistId);
    syncPlaylist({ playlistId });
  };

  const handleSelect = (playlist: any) => {
    selectPlaylist(playlist);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Playlists</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {playlists.length} {playlists.length === 1 ? "server" : "servers"} connected
          </Text>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/playlists")}
        >
          <Plus size={20} color={theme.primaryForeground} strokeWidth={2.5} />
        </Pressable>
      </View>

      <FlashList
        data={playlists}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={140}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceSecondary }]}>
              <Server size={36} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No playlists yet</Text>
            <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
              Add your first Xtream Codes server to get started.
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push("/playlists")}
            >
              <Plus size={16} color={theme.primaryForeground} />
              <Text style={[styles.emptyBtnText, { color: theme.primaryForeground }]}>Add Playlist</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => {
          const isActive = item.id === selectedPlaylist?.id;
          const isSyncing = updatingId === item.id;
          const expiry = item.expDate ? formatExpiry(item.expDate) : null;
          const updatedAt = item.updatedAt ? formatUpdatedAt(item.updatedAt) : null;

          return (
            <Animated.View
              entering={FadeInDown.delay(index * 60).springify()}
              layout={Layout.springify()}
              style={[
                styles.card,
                {
                  backgroundColor: isActive ? `${theme.primary}0D` : theme.surfacePrimary,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
            >
              {/* Main row — tap to select */}
              <Pressable
                style={({ pressed }) => [styles.cardMain, pressed && { opacity: 0.8 }]}
                onPress={() => handleSelect(item)}
              >
                <View style={[styles.serverIcon, {
                  backgroundColor: isActive ? theme.primary : theme.surfaceSecondary,
                }]}>
                  <Server size={18} color={isActive ? theme.primaryForeground : theme.textMuted} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={[styles.cardUrl, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.baseUrl.replace(/^https?:\/\//, "")}
                  </Text>
                  <View style={styles.cardMeta}>
                    <User size={11} color={theme.textMuted} />
                    <Text style={[styles.cardMetaText, { color: theme.textMuted }]}>{item.username}</Text>
                    {expiry && (
                      <>
                        <Text style={[styles.cardMetaText, { color: theme.border }]}>·</Text>
                        <Text style={[styles.cardMetaText, {
                          color: expiry.urgent ? theme.accentError : theme.textMuted,
                          fontWeight: expiry.urgent ? "700" : "500",
                        }]}>
                          {expiry.label}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {isActive && (
                  <CheckCircle2 size={20} color={theme.primary} fill={`${theme.primary}20`} />
                )}
              </Pressable>

              {/* Footer actions */}
              <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                {updatedAt && (
                  <Text style={[styles.syncedAt, { color: theme.textMuted }]}>
                    Synced {updatedAt}
                  </Text>
                )}
                <View style={styles.footerActions}>
                  {/* Sync */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.footerBtn,
                      { backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}30` },
                      pressed && { opacity: 0.7 },
                      isSyncing && { opacity: 0.5 },
                    ]}
                    onPress={() => handleSync(item.id)}
                    disabled={isSyncing || isDeleting}
                  >
                    {isSyncing ? (
                      <ActivityIndicator size={13} color={theme.primary} />
                    ) : (
                      <RefreshCw size={13} color={theme.primary} />
                    )}
                    <Text style={[styles.footerBtnText, { color: theme.primary }]}>
                      {isSyncing ? "Syncing…" : "Sync"}
                    </Text>
                  </Pressable>

                  {/* Delete */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.footerBtn,
                      { backgroundColor: `${theme.accentError}12`, borderColor: `${theme.accentError}25` },
                      pressed && { opacity: 0.7 },
                      isDeleting && { opacity: 0.5 },
                    ]}
                    onPress={() => handleDelete(item.id)}
                    disabled={isSyncing || isDeleting}
                  >
                    <Trash2 size={13} color={theme.accentError} />
                    <Text style={[styles.footerBtnText, { color: theme.accentError }]}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 12, fontWeight: "500", marginTop: 1 },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: "center", alignItems: "center",
  },

  listContent: { padding: 16, paddingBottom: 40 },

  card: {
    borderRadius: 16, borderWidth: 1,
    marginBottom: 12, overflow: "hidden",
  },
  cardMain: {
    flexDirection: "row", alignItems: "center",
    padding: 14, gap: 12,
  },
  serverIcon: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  cardInfo: { flex: 1 },
  cardUrl: { fontSize: 14, fontWeight: "700" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  cardMetaText: { fontSize: 12, fontWeight: "500" },

  cardFooter: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1,
  },
  syncedAt: { fontSize: 11, fontWeight: "500" },
  footerActions: { flexDirection: "row", gap: 8, marginLeft: "auto" },
  footerBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1,
  },
  footerBtnText: { fontSize: 12, fontWeight: "700" },

  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40, gap: 10 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: "center", alignItems: "center", marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyBody: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "700" },
});
