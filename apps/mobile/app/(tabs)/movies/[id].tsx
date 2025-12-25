import { trpc } from "@/lib/trpc";
import { cleanName } from "@/lib/utils";
import { usePlaylistStore } from "@/store/appStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Film,
  Play,
  Share2,
  Star,
  Users,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

export const useStreamingUrls = (
  baseUrl: string,
  username: string,
  password: string,
  stream_id: string,
  container_extension?: string
) => {
  const srcUrl = useMemo<string>(
    () =>
      `${baseUrl}/movie/${username}/${password}/${stream_id}.${
        container_extension || "mp4"
      }`,
    [baseUrl, username, password, stream_id, container_extension]
  );

  const getEpisodeSrcUrl = useCallback<(episode: any) => string>(
    (episode: any) =>
      `${baseUrl}/series/${username}/${password}/${episode.id}.${episode.container_extension}`,
    [baseUrl, password, username]
  );

  return { srcUrl, getEpisodeSrcUrl };
};

export default function MovieDetailsScreen() {
  const router = useRouter();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const { id, url } = useLocalSearchParams<{
    id: string;
    url: string;
  }>();

  const { data: movie, isLoading } = trpc.movies.getMovie.useQuery({
    movieId: +id,
    url: selectPlaylist?.baseUrl ?? "",
    username: selectPlaylist?.username ?? "",
    password: selectPlaylist?.password ?? "",
  });

  if (isLoading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    );

  if (!movie)
    return (
      <View style={styles.centered}>
        <Film size={48} color='#666' />
        <Text style={styles.errorText}>Movie not found</Text>
      </View>
    );

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out ${movie.name} on our IPTV app! ${movie.info?.description || ""}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const backdropUrl = movie.tmdb?.backdrop || movie.info?.cover_big;
  const rating = parseFloat(movie.tmdb?.rating || movie.info?.rating || "0");
  const releaseYear =
    movie.tmdb?.releaseDate?.split("-")[0] ||
    movie.info?.releasedate?.split("-")[0];
  const duration =
    movie.tmdb?.runtime || Math.floor((movie.info?.duration_secs || 0) / 60);
  const genres =
    movie.tmdb?.genres?.map((g: any) => g.name).join(", ") || movie.info?.genre;
  const director = movie.tmdb?.director || movie.info?.director;
  const cast =
    movie.tmdb?.cast || movie.info?.cast?.split(", ").slice(0, 5) || [];

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Backdrop Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: backdropUrl }}
            style={styles.backdrop}
            contentFit='cover'
            placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23222'/%3E%3C/svg%3E"
          />
          <View style={styles.gradientOverlay} />

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color='white' size={28} />
          </Pressable>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{cleanName(movie.movie_data.name)}</Text>

          {/* Meta Info Row */}
          <View style={styles.metaRow}>
            {rating > 0 && (
              <View style={styles.badge}>
                <Star size={14} color='#fbbf24' fill='#fbbf24' />
                <Text style={styles.badgeText}>{rating.toFixed(1)}</Text>
              </View>
            )}
            {releaseYear && (
              <View style={styles.badge}>
                <Calendar size={14} color='#9CA3AF' />
                <Text style={styles.badgeText}>{releaseYear}</Text>
              </View>
            )}
            {duration > 0 && (
              <View style={styles.badge}>
                <Clock size={14} color='#9CA3AF' />
                <Text style={styles.badgeText}>
                  {Math.floor(duration / 60)}h {duration % 60}m
                </Text>
              </View>
            )}
          </View>

          {/* Genre */}
          {genres && (
            <View style={styles.genreContainer}>
              <Text style={styles.genreText}>{genres}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={styles.playButton}
              onPress={() =>
                router.push({
                  pathname: "/player",
                  params: { url: url, title: movie.name, mediaType: "vod" },
                })
              }
            >
              <Play size={20} color='white' fill='white' />
              <Text style={styles.playButtonText}>Watch Now</Text>
            </Pressable>

            <Pressable style={styles.iconButton} onPress={onShare}>
              <Share2 size={22} color='white' />
            </Pressable>
          </View>

          {/* Overview Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>
              {movie.info?.description ||
                movie.tmdb?.overview ||
                "No description available."}
            </Text>
          </View>

          {/* Director Info */}
          {director && (
            <View style={styles.infoSection}>
              <Zap size={16} color='#2563eb' />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Director</Text>
                <Text style={styles.infoValue}>{director}</Text>
              </View>
            </View>
          )}

          {/* Cast Section */}
          {Array.isArray(cast) && cast.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Users size={18} color='#2563eb' />
                <Text style={styles.sectionTitle}>Cast</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castScroll}
              >
                {cast.slice(0, 8).map((member: any, idx: number) => (
                  <View key={idx} style={styles.castCard}>
                    {member.profilePath && (
                      <Image
                        source={{ uri: member.profilePath }}
                        style={styles.castImage}
                      />
                    )}
                    <Text style={styles.castName} numberOfLines={2}>
                      {typeof member === "string" ? member : member.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Stream Quality Info */}
          <View style={styles.qualityBox}>
            <View style={styles.qualityDot} />
            <View style={styles.qualityContent}>
              <Text style={styles.qualityLabel}>High Quality Stream</Text>
              <Text style={styles.qualitySubtext}>
                {movie.movie_data?.container_extension?.toUpperCase() || "MKV"}{" "}
                • 1080p
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  errorText: { color: "#999", fontSize: 16, marginTop: 12 },
  header: { height: height * 0.45, width: "100%", position: "relative" },
  backdrop: { width: "100%", height: "100%" },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundImage:
      "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(10,10,10,0.8) 80%)",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
  },
  content: {
    marginTop: -40,
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: { color: "white", fontSize: 28, fontWeight: "800", marginBottom: 16 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  badgeText: { color: "white", fontSize: 13, fontWeight: "600" },
  genreContainer: { marginBottom: 24 },
  genreText: { color: "#9CA3AF", fontSize: 14, fontWeight: "500" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  playButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  playButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
  iconButton: {
    backgroundColor: "#1a1a1a",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  overview: { color: "#CCCCCC", fontSize: 15, lineHeight: 24 },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#222",
  },
  infoContent: { flex: 1 },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: { color: "white", fontSize: 14, fontWeight: "600" },
  castScroll: { gap: 12, paddingRight: 20 },
  castCard: { alignItems: "center", width: 90 },
  castImage: { width: 80, height: 120, borderRadius: 12, marginBottom: 8 },
  castName: {
    color: "#CCCCCC",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  qualityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.3)",
  },
  qualityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563eb",
  },
  qualityContent: { flex: 1 },
  qualityLabel: { color: "#60a5fa", fontSize: 14, fontWeight: "700" },
  qualitySubtext: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },
});
