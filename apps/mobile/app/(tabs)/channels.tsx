import { ChannelRow } from "@/components/ChannelRow";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  Heart,
  Search,
  SlidersHorizontal,
  Tv,
  X,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChannelsScreen() {
  const theme = usePlayerTheme();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const categorySheetRef = useRef<BottomSheet>(null);
  const sortSheetRef = useRef<BottomSheet>(null);
  const categorySnapPoints = useMemo(() => ["60%", "85%"], []);
  const sortSnapPoints = useMemo(() => ["40%"], []);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "default" | "az" | "za" | "favorites" | "recent"
  >("default");

  const openCategorySheet = () => categorySheetRef.current?.expand();
  const openSortSheet = () => sortSheetRef.current?.expand();
  const closeCategorySheet = () => categorySheetRef.current?.close();
  const closeSortSheet = () => sortSheetRef.current?.close();

  type SortOption = {
    id: "default" | "az" | "za" | "favorites" | "recent";
    label: string;
    icon: React.ReactNode;
  };

  const sortOptions: SortOption[] = [
    {
      id: "default",
      label: "Default",
      icon: <Tv size={18} color={theme.textMuted} />,
    },
    {
      id: "az",
      label: "A-Z",
      icon: <ArrowDownAZ size={18} color={theme.textMuted} />,
    },
    {
      id: "za",
      label: "Z-A",
      icon: <ArrowUpAZ size={18} color={theme.textMuted} />,
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart size={18} color={theme.textMuted} />,
    },
    {
      id: "recent",
      label: "Recently Watched",
      icon: <Clock size={18} color={theme.textMuted} />,
    },
  ];

  const { data: categories, isLoading: loadingCats } =
    trpc.channels.getCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  const { data: channels, isLoading: loadingChannels } =
    trpc.channels.getChannels.useQuery(
      {
        playlistId: selectPlaylist?.id ?? 0,
        categoryId: selectedCatId ?? 0,
      },
      { enabled: !!selectedCatId && !!selectPlaylist },
    );

  useEffect(() => {
    if (categories?.length && !selectedCatId) {
      const timeoutId = setTimeout(() => {
        setSelectedCatId(categories[0].categoryId);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [categories, selectedCatId]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat) =>
      cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [categories, searchQuery]);

  const selectedCategory = categories?.find(
    (c) => c.categoryId === selectedCatId,
  );

  const sortedChannels = useMemo(() => {
    if (!channels) return [];
    let sorted = [...channels];

    switch (sortBy) {
      case "az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "favorites":
        sorted.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
        break;
    }
    return sorted;
  }, [channels, sortBy]);

  const renderChannelItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index * 10, 200))}>
        <ChannelRow channel={item} />
      </Animated.View>
    ),
    [],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top", "bottom"]}
    >
      {/* Search & Filter Header */}
      <View style={[styles.headerStack, { backgroundColor: theme.bg }]}>
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Search size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search channels..."
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
        <Pressable
          onPress={openSortSheet}
          style={[
            styles.filterButton,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <SlidersHorizontal size={18} color={theme.textPrimary} />
        </Pressable>
        <Pressable
          onPress={openCategorySheet}
          style={[
            styles.filterButton,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Tv size={18} color={theme.textPrimary} />
        </Pressable>
      </View>

      {/* Selected Category Chip */}
      <View
        style={[
          styles.selectedCategoryBar,
          { borderBottomColor: theme.border },
        ]}
      >
        <View style={[styles.categoryChip, { backgroundColor: theme.primary }]}>
          <Text
            style={[
              styles.categoryChipText,
              { color: theme.primaryForeground },
            ]}
          >
            {selectedCategory?.categoryName || "All Channels"}
          </Text>
        </View>
        <Text style={[styles.channelCount, { color: theme.textMuted }]}>
          {sortedChannels.length || 0} channels
        </Text>
      </View>

      <SafeAreaView style={styles.listContainer} edges={["bottom"]}>
        {loadingChannels ? (
          <FlashList
            data={Array(10).fill(null)}
            renderItem={() => <SkeletonRow />}
            keyExtractor={(_, i) => `skel-${i}`}
            contentContainerStyle={styles.listContent}

          />
        ) : (
          <FlashList
            data={sortedChannels}
            renderItem={renderChannelItem}
            keyExtractor={(item) => item.streamId.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                <Tv size={64} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No Channels Found
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Try adjusting your search or category
                </Text>
              </Animated.View>
            }
          />
        )}
      </SafeAreaView>

      {/* Category Bottom Sheet */}
      <BottomSheet
        ref={categorySheetRef}
        index={-1}
        snapPoints={categorySnapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.surfacePrimary }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Categories</Text>
          <Text style={[styles.sheetSubtitle, { color: theme.textMuted }]}>{categories?.length ?? 0} categories</Text>
        </View>
        <View style={[styles.sheetSearch, { backgroundColor: theme.surfaceSecondary }]}>
          <Search size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.sheetSearchInput, { color: theme.textPrimary }]}
            placeholder="Search categories..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <BottomSheetScrollView contentContainerStyle={styles.sheetList}>
          {filteredCategories.map((category) => (
            <Pressable
              key={category.categoryId}
              onPress={() => { setSelectedCatId(category.categoryId); closeCategorySheet(); setSearchQuery(""); }}
              style={[styles.sheetItem, {
                backgroundColor: selectedCatId === category.categoryId ? theme.primary : theme.surfaceSecondary,
                borderColor: selectedCatId === category.categoryId ? theme.primary : theme.border,
              }]}
            >
              <Text style={[styles.sheetItemText, {
                color: selectedCatId === category.categoryId ? theme.primaryForeground : theme.textPrimary,
                fontWeight: selectedCatId === category.categoryId ? "700" : "500",
              }]}>
                {category.categoryName}
              </Text>
            </Pressable>
          ))}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Sort Bottom Sheet */}
      <BottomSheet
        ref={sortSheetRef}
        index={-1}
        snapPoints={sortSnapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.surfacePrimary }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Sort Channels</Text>
        </View>
        <BottomSheetScrollView contentContainerStyle={styles.sheetList}>
          {sortOptions.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => { setSortBy(option.id); closeSortSheet(); }}
              style={[styles.sheetItem, {
                backgroundColor: sortBy === option.id ? theme.primary : theme.surfaceSecondary,
                borderColor: sortBy === option.id ? theme.primary : theme.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }]}
            >
              {option.icon}
              <Text style={[styles.sheetItemText, {
                color: sortBy === option.id ? theme.primaryForeground : theme.textPrimary,
                fontWeight: sortBy === option.id ? "700" : "500",
              }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
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

  simpleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  headerStack: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
    alignItems: "center",
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 14,
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
  searchInput: { flex: 1, fontSize: 15, fontWeight: "500" },
  listContainer: { flex: 1, paddingBottom: 20 },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  selectedCategoryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  channelCount: {
    fontSize: 12,
    fontWeight: "600",
  },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 50,
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

  // Sheet styles
  sheetHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: "800" },
  sheetSubtitle: { fontSize: 13 },
  sheetSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  sheetSearchInput: { flex: 1, fontSize: 14 },
  sheetList: { paddingHorizontal: 16, paddingBottom: 40, gap: 8 },
  sheetItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  sheetItemText: { fontSize: 15 },
});
