import { ChannelRow } from "@/components/ChannelRow";
import Header from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { Search, Tv, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChannelsScreen() {
  const theme = usePlayerTheme();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const categoryListRef = useRef<FlashListRef<any>>(null);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch Categories
  const { data: categories, isLoading: loadingCats } =
    trpc.channels.getCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  // 2. Fetch Channels
  const { data: channels, isLoading: loadingChannels } =
    trpc.channels.getChannels.useQuery(
      {
        playlistId: selectPlaylist?.id ?? 0,
        categoryId: selectedCatId ?? 0,
      },
      { enabled: !!selectedCatId },
    );

  useEffect(() => {
    if (categories?.length && !selectedCatId) {
      setSelectedCatId(categories[0].categoryId);
    }
  }, [categories, selectedCatId]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat) =>
      cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [categories, searchQuery]);

  const scrollToCategory = (index: number) => {
    categoryListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5, // Centers the pill
    });
  };

  const renderChannelItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 20, 300))}>
      <ChannelRow channel={item} />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header />

      {/* 1. Integrated Search & Stats Header */}
      <View style={styles.headerStack}>
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Search size={18} color={theme.primary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder='Search channels...'
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={16} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={[styles.catWrapper, { borderBottomColor: theme.border }]}>
        {loadingCats ?
          <ActivityIndicator
            size='small'
            color={theme.primary}
            style={styles.loader}
          />
        : <FlashList
            ref={categoryListRef}
            horizontal
            data={filteredCategories}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catContent}
            renderItem={({ item, index }) => {
              const isActive = selectedCatId === item.categoryId;
              return (
                <CategoryPill
                  item={item}
                  isActive={isActive}
                  onPress={() => {
                    setSelectedCatId(item.categoryId);
                    scrollToCategory(index);
                  }}
                />
              );
            }}
          />
        }
      </View>

      <SafeAreaView style={styles.listContainer} edges={["bottom"]}>
        {loadingChannels ?
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Loading Streams...
            </Text>
          </View>
        : <FlashList
            data={channels}
            renderItem={renderChannelItem}
            keyExtractor={(item) => item.streamId.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                <Tv size={64} color={theme.border} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No Channels Found
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Try adjusting your search or category
                </Text>
              </Animated.View>
            }
          />
        }
      </SafeAreaView>
    </View>
  );
}

// Sub-component for the Pill to handle its own animation state
const CategoryPill = ({ item, isActive, onPress, count }: any) => {
  const theme = usePlayerTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
    >
      <Animated.View
        style={[
          styles.pill,
          animatedStyle,
          {
            backgroundColor: isActive ? theme.primary : theme.surfaceSecondary,
            borderColor: isActive ? theme.primary : theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            {
              color: isActive ? "#000" : theme.textSecondary,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
        >
          {item.categoryName}
        </Text>

        {/* Add count badge */}
        {count && (
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor:
                  isActive ? "rgba(0,0,0,0.2)" : theme.glassLight,
              },
            ]}
          >
            <Text
              style={[
                styles.countText,
                { color: isActive ? "#000" : theme.textMuted },
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 12,
  },

  catWrapper: {
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  catContent: {
    paddingHorizontal: 16,
  },
  catPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1,
  },
  catText: {
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  loader: {
    paddingVertical: 10,
    marginLeft: 20,
  },

  headerStack: {
    padding: 12,
    gap: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: "500" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  catContainer: {
    paddingVertical: 14,
    marginTop: 4,
  },
  catScroll: { paddingHorizontal: 16 },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  pillText: { fontSize: 14 },
  listContainer: { flex: 1 },
  listPadding: { paddingHorizontal: 16, paddingBottom: 30 },
  loadingState: { flex: 1, justifyContent: "center" },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: { fontSize: 14, fontWeight: "500" },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
    minWidth: 20,
    alignItems: "center",
  },
  countText: {
    fontSize: 10,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
