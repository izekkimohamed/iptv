import { usePlaylistStore } from "@/store";
import { useSearchHistoryStore } from "@/store/search-history-store";
import { usePlayerTheme } from "@/theme/playerTheme";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Clock, Search, Settings, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  const router = useRouter();
  const theme = usePlayerTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const selectedPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const { searches, removeSearch, clearSearches } = useSearchHistoryStore();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
      setShowSearchHistory(false);
    }
  };

  const handleSelectHistory = (query: string) => {
    setSearchQuery(query);
    router.push(`/search?q=${query}`);
    setShowSearchHistory(false);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: theme.bg }]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Search size={18} color={theme.textMuted} />
          <TextInput
            placeholder="Search channels, movies, series..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSearchHistory(text.length === 0 && searches.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length === 0 && searches.length > 0) {
                setShowSearchHistory(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={16} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/settings");
          }}
          style={[
            styles.profileButton,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.primary,
            },
          ]}
        >
          <Settings
            size={20}
            color={selectedPlaylist ? theme.primary : theme.textMuted}
          />
        </Pressable>
      </View>

      {/* Search History Modal */}
      <Modal
        visible={showSearchHistory}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchHistory(false)}
      >
        <Pressable
          style={styles.historyBackdrop}
          onPress={() => setShowSearchHistory(false)}
        >
          <View
            style={[
              styles.historyContainer,
              {
                backgroundColor: theme.surfacePrimary,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: theme.textPrimary }]}>
                Recent Searches
              </Text>
              <Pressable onPress={clearSearches}>
                <Text style={[styles.clearText, { color: theme.primary }]}>
                  Clear all
                </Text>
              </Pressable>
            </View>
            <ScrollView>
              {searches.map((item) => (
                <Pressable
                  key={item.timestamp}
                  style={[
                    styles.historyItem,
                    { borderBottomColor: theme.border },
                  ]}
                  onPress={() => handleSelectHistory(item.query)}
                >
                  <Clock size={16} color={theme.textMuted} />
                  <Text
                    style={[styles.historyText, { color: theme.textPrimary }]}
                  >
                    {item.query}
                  </Text>
                  <Pressable
                    onPress={() => removeSearch(item.query)}
                    hitSlop={8}
                  >
                    <X size={14} color={theme.textMuted} />
                  </Pressable>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  safeArea: {},
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "500" },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },

  // Search History
  historyBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
  },
  historyContainer: {
    margin: 16,
    marginTop: 80,
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: 300,
    overflow: "hidden",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  historyText: {
    flex: 1,
    fontSize: 15,
  },
});
