import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Globe,
  Lock,
  PlayCircle,
  Plus,
  Server,
  Trash2,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaylistsSelectScreen() {
  const router = useRouter();

  const {
    playlists,
    addPlaylist,
    removePlaylist,
    selectPlaylist,
    selectedPlaylist,
    isCreatingPlaylist,
    startPlaylistCreation,
    finishPlaylistCreation,
  } = usePlaylistStore();

  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const createPlaylistMutation = trpc.playlists.createPlaylist.useMutation({
    onSuccess: (newPlaylist) => {
      addPlaylist(newPlaylist);
      resetForm();
      finishPlaylistCreation();
      Alert.alert("Success", "Playlist added successfully!");
    },
    onError: (error) => {
      Alert.alert(
        "Connection Failed",
        error.message || "Could not connect to the IPTV server."
      );
    },
  });

  const handleAddPlaylist = async () => {
    if (!baseUrl || !username || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    createPlaylistMutation.mutate({
      url: baseUrl,
      username,
      password,
    });
  };

  const resetForm = () => {
    setBaseUrl("");
    setUsername("");
    setPassword("");
  };

  const handleSelect = (playlist: any) => {
    selectPlaylist(playlist);
    router.replace("/(tabs)/channels");
  };

  const handleDelete = (playlistId: number) => {
    Alert.alert(
      "Remove Playlist",
      "Are you sure you want to delete this server? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            removePlaylist(playlistId);
            Alert.alert("Removed", "Playlist deleted successfully");
          },
          style: "destructive",
        },
      ]
    );
  };

  if (isCreatingPlaylist) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.formHeader}>
            <Pressable onPress={() => finishPlaylistCreation()}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
            <View style={styles.formHeaderContent}>
              <Server size={32} color='#2563eb' />
              <Text style={styles.formTitle}>Add Playlist</Text>
              <Text style={styles.formSubtitle}>
                Connect your Xtream Codes service
              </Text>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.formInputs}>
            {/* URL Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Globe size={16} color='#2563eb' />
                <Text style={styles.inputLabelText}>Server URL</Text>
              </View>
              <TextInput
                placeholder='e.g., http://line.com:80'
                placeholderTextColor='#6b7280'
                style={styles.input}
                value={baseUrl}
                onChangeText={setBaseUrl}
                autoCapitalize='none'
                keyboardType='url'
                editable={!createPlaylistMutation.isPending}
              />
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <User size={16} color='#2563eb' />
                <Text style={styles.inputLabelText}>Username</Text>
              </View>
              <TextInput
                placeholder='Enter your username'
                placeholderTextColor='#6b7280'
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize='none'
                editable={!createPlaylistMutation.isPending}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Lock size={16} color='#2563eb' />
                <Text style={styles.inputLabelText}>Password</Text>
              </View>
              <TextInput
                placeholder='Enter your password'
                placeholderTextColor='#6b7280'
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!createPlaylistMutation.isPending}
              />
            </View>

            {/* Error Message */}
            {createPlaylistMutation.isError && (
              <View style={styles.errorBox}>
                <AlertCircle size={18} color='#ef4444' />
                <Text style={styles.errorText}>
                  {createPlaylistMutation.error?.message ||
                    "Failed to connect to server"}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.formActions}>
            <Pressable
              style={[
                styles.btn,
                styles.btnPrimary,
                createPlaylistMutation.isPending && styles.btnDisabled,
              ]}
              onPress={handleAddPlaylist}
              disabled={createPlaylistMutation.isPending}
            >
              {createPlaylistMutation.isPending ?
                <>
                  <ActivityIndicator color='white' size='small' />
                  <Text style={styles.btnText}>Connecting...</Text>
                </>
              : <>
                  <Plus size={20} color='white' />
                  <Text style={styles.btnText}>Add Playlist</Text>
                </>
              }
            </Pressable>

            <Pressable
              style={styles.btnSecondary}
              onPress={() => {
                resetForm();
                finishPlaylistCreation();
              }}
              disabled={createPlaylistMutation.isPending}
            >
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Playlists</Text>
          <Text style={styles.countText}>
            {playlists.length} {playlists.length === 1 ? "server" : "servers"}
          </Text>
        </View>
        <Pressable style={styles.addButton} onPress={startPlaylistCreation}>
          <Plus color='white' size={24} />
        </Pressable>
      </View>

      {/* Playlists List */}
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PlayCircle size={64} color='#374151' />
            <Text style={styles.emptyTitle}>No Playlists Added</Text>
            <Text style={styles.emptyText}>
              Add your first Xtream Codes server to get started
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={startPlaylistCreation}
            >
              <Plus size={20} color='white' />
              <Text style={styles.emptyButtonText}>Add Playlist</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = item.id === selectedPlaylist?.id;
          return (
            <View
              style={[
                styles.playlistCard,
                isSelected && styles.selectedPlaylistCard, // Apply highlight style
              ]}
            >
              <Pressable
                style={styles.playlistContent}
                onPress={() => handleSelect(item)}
              >
                <View
                  style={[
                    styles.playlistIcon,
                    isSelected && { backgroundColor: "#dbeafe" }, // Lighter blue background if selected
                  ]}
                >
                  <Server
                    color={isSelected ? "#2563eb" : "#64748b"}
                    size={20}
                  />
                </View>

                <View style={styles.playlistInfo}>
                  <Text
                    style={[
                      styles.playlistUrl,
                      isSelected && styles.selectedText, // Bold or change color if selected
                    ]}
                    numberOfLines={1}
                  >
                    {item.baseUrl}
                  </Text>
                  <View style={styles.playlistMeta}>
                    <User
                      size={13}
                      color={isSelected ? "#3b82f6" : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.playlistUser,
                        isSelected && { color: "#3b82f6" },
                      ]}
                    >
                      {item.username}
                    </Text>
                  </View>
                </View>

                <View style={styles.playlistStatus}>
                  {/* Show CheckCircle only if selected, or change its look */}
                  <CheckCircle
                    size={20}
                    color={isSelected ? "#10b981" : "#e5e7eb"}
                  />
                </View>

                <ChevronRight
                  color={isSelected ? "#2563eb" : "#6b7280"}
                  size={20}
                />
              </Pressable>

              <Pressable
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Trash2 color='#ef4444' size={18} />
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },

  // ============================================================================
  // FORM STYLES
  // ============================================================================

  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  formHeader: {
    marginBottom: 40,
  },
  closeButton: {
    fontSize: 28,
    color: "#6b7280",
    marginBottom: 20,
  },
  formHeaderContent: {
    alignItems: "center",
    gap: 12,
  },
  formTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 12,
  },
  formSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  formInputs: {
    marginBottom: 32,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputLabelText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  formActions: {
    gap: 12,
    paddingBottom: 20,
  },
  btn: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
  },
  btnSecondary: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
  },
  btnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  btnSecondaryText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.6,
  },

  // ============================================================================
  // LIST STYLES
  // ============================================================================

  selectedPlaylistCard: {
    borderColor: "#2563eb", // Blue border for selection
    backgroundColor: "#f8faff", // Very faint blue background
  },

  selectedText: {
    color: "#2563eb",
    fontWeight: "700",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  countText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#2563eb",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  playlistCard: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#222",
  },
  playlistContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  playlistIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  playlistInfo: {
    flex: 1,
  },
  playlistUrl: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  playlistMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  playlistUser: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
  },
  playlistStatus: {
    marginRight: 8,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
});
