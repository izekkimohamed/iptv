import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@repo/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Loader, Plus, Server, Trash2, User } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaylistsSelectScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();

  const { playlists, removePlaylist, selectPlaylist, selectedPlaylist } =
    usePlaylistStore();
  const utils = trpc.useUtils();
  const { mutate: deletePlaylist, isPending } =
    trpc.playlists.deletePlaylist.useMutation({
      onSuccess: async (data, variables) => {
        await utils.playlists.getPlaylists.invalidate();
        removePlaylist(variables.playlistId);
        if (playlists.length) {
          selectPlaylist(playlists[0]);
        }
      },
    });

  const handleDelete = (playlistId: number) => {
    Alert.alert(
      "Disconnect Server",
      "Are you sure you want to remove this playlist? content will be removed from your library.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            deletePlaylist({ playlistId });
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSelect = (playlist: any) => {
    selectPlaylist(playlist);
    router.replace("/(tabs)/channels");
  };

  // --- RENDER: LIST VIEW ---
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.listHeader, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Your Library
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {playlists.length} {playlists.length === 1 ? "Server" : "Servers"}{" "}
            Connected
          </Text>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/playlists")}
          disabled={isPending}
        >
          <Plus size={24} color='#000' />
        </Pressable>
      </View>

      {/* List */}
      <FlashList
        data={playlists}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isPending}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Server size={40} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Playlists Found
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Connect your first Xtream Codes server to start watching.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isSelected = item.id === selectedPlaylist?.id;
          return (
            <Animated.View
              entering={FadeInDown.delay(index * 100)}
              layout={Layout.springify()}
              style={[
                styles.card,
                {
                  backgroundColor:
                    isSelected ? `${theme.primary}08` : theme.surfaceSecondary,
                  borderColor: isSelected ? theme.primary : theme.border,
                  opacity: isPending ? 0.6 : 1,
                },
              ]}
            >
              <Pressable
                style={styles.cardContent}
                onPress={() => handleSelect(item)}
                disabled={isPending}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.cardIcon,
                    {
                      backgroundColor:
                        isSelected ? theme.primary : theme.surfacePrimary,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Server
                    size={20}
                    color={isSelected ? "#000" : theme.textMuted}
                  />
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <Text
                    style={[styles.cardTitle, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.baseUrl.replace(/^https?:\/\//, "")}
                  </Text>
                  <View style={styles.cardMeta}>
                    <User
                      size={12}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={[styles.cardUser, { color: theme.textSecondary }]}
                    >
                      {item.username}
                    </Text>
                  </View>
                </View>

                {/* Status Indicator */}
                {isSelected && (
                  <View
                    style={[
                      styles.activeBadge,
                      { backgroundColor: `${theme.accentSuccess}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeText,
                        { color: theme.accentSuccess },
                      ]}
                    >
                      Active
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Actions Divider */}
              <View
                style={[styles.cardDivider, { backgroundColor: theme.border }]}
              />

              {/* Footer Actions */}
              <View style={styles.cardFooter}>
                <Text style={[styles.lastActive, { color: theme.textMuted }]}>
                  ID: #{item.id}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteAction,
                    pressed && !isPending && { opacity: 0.7 },
                    isPending && { opacity: 0.5 },
                  ]}
                  onPress={() => handleDelete(item.id)}
                  disabled={isPending}
                >
                  <Trash2 size={16} color={theme.accentError} />
                  <Text
                    style={[styles.deleteText, { color: theme.accentError }]}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          );
        }}
      />

      {/* Loading Overlay */}
      {isPending && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.loadingOverlay, { backgroundColor: `${theme.bg}cc` }]}
        >
          <View
            style={[
              styles.loadingContent,
              { backgroundColor: theme.surfaceSecondary },
            ]}
          >
            <Animated.View style={styles.spinnerWrapper} entering={FadeIn}>
              <Loader size={48} color={theme.primary} />
            </Animated.View>
            <Text style={[styles.loadingTitle, { color: theme.textPrimary }]}>
              Disconnecting Server
            </Text>
            <Text
              style={[styles.loadingSubtitle, { color: theme.textSecondary }]}
            >
              Please wait while we remove your playlist...
            </Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // --- Form Styles ---
  formScroll: { padding: 24 },
  formHeader: { alignItems: "center", marginBottom: 32 },
  headerTopRow: { width: "100%", alignItems: "flex-end", marginBottom: 10 },
  closeBtn: { padding: 8, borderRadius: 20 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  formTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  formSubtitle: { fontSize: 14 },

  inputGroup: { gap: 16, marginBottom: 24 },
  inputContainer: { gap: 8 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: { flex: 1, fontSize: 15, height: "100%" },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  errorText: { fontSize: 13, flex: 1 },

  actionGroup: { gap: 12 },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },

  // --- List Styles ---
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 13, fontWeight: "500", marginTop: 4 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: { padding: 20, paddingBottom: 40 },

  // Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  cardUser: { fontSize: 12 },

  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },

  cardDivider: { height: 1, width: "100%" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lastActive: { fontSize: 11, fontVariant: ["tabular-nums"] },
  deleteAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  deleteText: { fontSize: 12, fontWeight: "600" },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },

  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 0,
  },
  loadingContent: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    borderRadius: 20,
  },
  spinnerWrapper: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
