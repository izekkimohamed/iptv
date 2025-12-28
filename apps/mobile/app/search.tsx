import { trpc } from "@/lib/trpc";
import { cleanName } from "@/lib/utils";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Film,
  SearchX,
  Tv,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const { q } = useLocalSearchParams<{ q: string }>();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  // Fetch data
  const { data, isLoading } = trpc.home.globalSearch.useQuery({
    query: q || "",
    playlistId: selectPlaylist?.id ?? 0,
  });

  // Prepare sections
  const sections = [
    {
      title: "Live TV Channels",
      icon: <Tv size={18} color={theme.accentSuccess} />,
      data: data?.channels || [],
      type: "channel",
    },
    {
      title: "Movies",
      icon: <Film size={18} color={theme.primary} />,
      data: data?.movies || [],
      type: "movie",
    },
    {
      title: "TV Series",
      icon: <Clapperboard size={18} color='#ec4899' />, // specific pink or theme.secondary
      data: data?.series || [],
      type: "series",
    },
  ].filter((section) => section.data.length > 0);

  // --- Render Item Logic ---
  const renderItem = ({
    item,
    section,
    index,
  }: {
    item: any;
    section: any;
    index: number;
  }) => {
    const isChannel = section.type === "channel";
    const imageUrl = item.streamIcon || item.cover; // Handle varying API key names

    const handlePress = () => {
      if (section.type === "channel") {
        // Play Channel Directly
        router.push({
          pathname: "/player",
          params: {
            url: item.url,
            title: item.name,
          },
        });
      } else if (section.type === "movie") {
        // Go to Movie Details
        router.push({
          pathname: "/movies/[id]",
          params: {
            id: item.streamId, // or item.id depending on your API
            url: item.url,
            title: item.name,
          },
        });
      } else if (section.type === "series") {
        // Go to Series Details
        router.push({
          pathname: "/series/[id]",
          params: {
            id: item.seriesId, // or item.id
          },
        });
      }
    };

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <Pressable
          style={({ pressed }) => [
            styles.itemContainer,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
            pressed && { backgroundColor: theme.surfacePrimary },
          ]}
          onPress={handlePress}
        >
          {/* Image Thumbnail */}
          <View
            style={[
              styles.thumbContainer,
              {
                aspectRatio: isChannel ? 1 : 2 / 3, // Square for channels, Portrait for VOD
                width: isChannel ? 50 : 45,
              },
            ]}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              contentFit={isChannel ? "contain" : "cover"}
              transition={300}
            />
          </View>

          {/* Text Info */}
          <View style={styles.itemInfo}>
            <Text
              style={[styles.itemName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {cleanName(item.name || item.title)}
            </Text>

            <View style={styles.metaRow}>
              <View
                style={[styles.typeBadge, { backgroundColor: theme.border }]}
              >
                <Text style={[styles.typeText, { color: theme.textSecondary }]}>
                  {section.type.toUpperCase()}
                </Text>
              </View>
              {item.rating_5based && (
                <Text style={[styles.ratingText, { color: theme.primary }]}>
                  ★ {item.rating_5based}
                </Text>
              )}
            </View>
          </View>

          <View
            style={[styles.arrowBox, { backgroundColor: theme.glassLight }]}
          >
            <ChevronRight size={16} color={theme.textMuted} />
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceSecondary }]}
        >
          <ChevronLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Search Results
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {q}
          </Text>
        </View>
      </View>

      {/* Content */}
      {isLoading ?
        <View style={styles.center}>
          <View
            style={[
              styles.loadingBox,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <ActivityIndicator size='large' color={theme.primary} />
          </View>
        </View>
      : sections.length === 0 ?
        <View style={styles.center}>
          <View
            style={[
              styles.emptyCircle,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <SearchX size={48} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyText, { color: theme.textPrimary }]}>
            No results found
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Try searching for something else
          </Text>
        </View>
      : <SectionList
          sections={sections}
          keyExtractor={(item, index) =>
            `${item.streamId || item.seriesId}-${index}`
          }
          renderItem={renderItem}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section: { title, icon } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: theme.bg }]}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.surfaceSecondary },
                ]}
              >
                {icon}
              </View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                {title}
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          SectionSeparatorComponent={() => <View style={{ height: 24 }} />}
        />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 10,
    borderRadius: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSub: { fontSize: 14 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Item Card
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
  },
  thumbContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
    gap: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
  },
  arrowBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty States
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, marginTop: 4 },

  loadingBox: {
    padding: 24,
    borderRadius: 200,
    borderWidth: 1,
  },
});
