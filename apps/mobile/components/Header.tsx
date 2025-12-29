import { usePlaylistStore } from "@repo/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { useRouter } from "expo-router";
import { Search, User } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  const router = useRouter();
  const theme = usePlayerTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const selectedPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: theme.bg }]} // Use theme.bg instead of accentSuccess
    >
      <View style={styles.header}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.surfaceSecondary },
          ]}
        >
          <Search size={18} color={theme.textMuted} />
          <TextInput
            placeholder='Search channels, movies, series...'
            placeholderTextColor={theme.textDisabled}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => router.push(`/search?q=${searchQuery}`)}
            returnKeyType='search'
          />
        </View>
        <Pressable
          onPress={() => router.push("/playlists/manage")}
          style={[
            styles.profileButton,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <User
            size={20}
            color={selectedPlaylist ? theme.primary : theme.accentError}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  // Header
  safeArea: {
    // Optional: add a subtle border
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 5, // Proper padding
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 13 },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});
