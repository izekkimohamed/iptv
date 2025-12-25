import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Play, Tv } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useStreamingUrls } from "../movies/[id]";

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const [selectedSeason, setSelectedSeason] = useState(1);

  const { data: seriesInfo, isLoading } = trpc.series.getSerie.useQuery({
    serieId: Number(id),
    url: selectPlaylist?.baseUrl ?? "",
    username: selectPlaylist?.username ?? "",
    password: selectPlaylist?.password ?? "",
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    );
  }

  if (!seriesInfo) {
    return (
      <View style={styles.centered}>
        <Tv size={48} color='#666' />
        <Text style={styles.errorText}>Series not found</Text>
      </View>
    );
  }

  const seasons = Object.keys(seriesInfo?.episodes || {}).map(Number);
  const currentEpisodes = seriesInfo?.episodes[selectedSeason] || [];

  return (
    <>
      <ScrollView
        style={styles.detailContainer}
        contentContainerStyle={styles.detailContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Backdrop */}
        <View style={styles.detailHeader}>
          <Image
            source={{ uri: seriesInfo?.info.cover }}
            style={styles.backdrop}
            contentFit='fill'
          />
          <View style={styles.gradientOverlay} />
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft color='#fff' size={24} />
          </Pressable>
        </View>

        {/* Series Info */}
        <View style={styles.infoSection}>
          <Text style={styles.detailTitle}>{seriesInfo?.info.name}</Text>
          <Text style={styles.detailPlot}>{seriesInfo?.info.plot}</Text>
        </View>

        {/* Seasons Tab Bar */}
        <View style={styles.seasonTabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.seasonTabsContent}
          >
            {seasons.map((s) => (
              <Pressable
                key={s}
                onPress={() => setSelectedSeason(s)}
                style={[
                  styles.seasonTab,
                  selectedSeason === s && styles.seasonTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.seasonTabText,
                    selectedSeason === s && styles.seasonTabTextActive,
                  ]}
                >
                  Season {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Episode List */}
        <View style={styles.episodeListContainer}>
          {currentEpisodes.length > 0 ?
            currentEpisodes.map((ep: any) => {
              return (
                <EpisodeItem
                  key={ep.id}
                  episode={ep}
                  seriesName={seriesInfo?.info.name}
                  seasonNumber={selectedSeason}
                  seriesCover={seriesInfo?.info.cover}
                />
              );
            })
          : <View style={styles.noEpisodes}>
              <Text style={styles.noEpisodesText}>No episodes available</Text>
            </View>
          }
        </View>
      </ScrollView>
    </>
  );
}

interface EpisodeItemProps {
  episode: any;
  seriesName: string;
  seasonNumber: number;
  seriesCover: string;
}

function EpisodeItem({
  episode,
  seriesName,
  seasonNumber,
  seriesCover,
}: EpisodeItemProps) {
  const router = useRouter();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const { getEpisodeSrcUrl } = useStreamingUrls(
    selectPlaylist?.baseUrl ?? "",
    selectPlaylist?.username ?? "",
    selectPlaylist?.password ?? "",
    episode.stream_id,
    episode.container_extension
  );
  return (
    <Pressable
      style={({ pressed }) => [
        styles.episodeRow,
        pressed && styles.episodeRowPressed,
      ]}
      onPress={() => {
        router.push({
          pathname: "/player",
          params: {
            url: getEpisodeSrcUrl(episode),
            mediaType: "vod",
            title: episode.name,
          },
        });
      }}
    >
      <View style={styles.episodeImageContainer}>
        <Image
          source={{
            uri: episode.info?.movie_image || seriesCover,
          }}
          style={styles.episodeImage}
          contentFit='cover'
        />
        <View style={styles.episodePlayOverlay}>
          <Play size={20} color='#fff' fill='#fff' />
        </View>
      </View>

      <View style={styles.episodeDetails}>
        <Text style={styles.episodeNumber}>
          S{seasonNumber}E{episode.episode_num}
        </Text>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {episode.title || `Episode ${episode.episode_num}`}
        </Text>
        <Text style={styles.episodeDuration} numberOfLines={1}>
          {episode.info?.duration || "N/A"}
        </Text>
      </View>

      <View style={styles.episodeChevron}>
        <ChevronLeft
          size={20}
          color='#6b7280'
          style={{ transform: [{ rotate: "180deg" }] }}
        />
      </View>
    </Pressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Common
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  errorText: {
    color: "#6b7280",
    fontSize: 16,
    marginTop: 12,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  detailContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  detailHeader: {
    height: 280,
    position: "relative",
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  infoSection: {
    marginTop: -40,
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  detailTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  detailPlot: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 24,
  },
  seasonTabsContainer: {
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  seasonTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  seasonTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  seasonTabActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  seasonTabText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "700",
  },
  seasonTabTextActive: {
    color: "#fff",
  },
  episodeListContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    gap: 12,
  },
  episodeRowPressed: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
  },
  episodeImageContainer: {
    width: 100,
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  episodeImage: {
    width: "100%",
    height: "100%",
  },
  episodePlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  episodeDetails: {
    flex: 1,
  },
  episodeNumber: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  episodeTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  episodeDuration: {
    color: "#6b7280",
    fontSize: 12,
  },
  episodeChevron: {
    padding: 8,
  },
  noEpisodes: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  noEpisodesText: {
    color: "#6b7280",
    fontSize: 14,
  },
});
