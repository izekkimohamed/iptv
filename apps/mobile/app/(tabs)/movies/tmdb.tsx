import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  Film,
  Play,
  User,
  Youtube,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MovieDetailsScreen() {
  const router = useRouter();
  const { movieId } = useLocalSearchParams<{
    movieId: string;
  }>();
  const playlistId = usePlaylistStore((state) => state.selectedPlaylist?.id);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data, isLoading, error } = trpc.movies.getTmdbMovieDetails.useQuery(
    {
      tmdbId: Number(movieId),
      playlistId: Number(playlistId),
    },
    { enabled: !!movieId && !!playlistId }
  );

  const movie = data?.[0];

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' />
        <Text style={styles.muted}>Loading movie details…</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.centered}>
        <Film size={48} color='#ef4444' />
        <Text style={styles.error}>Failed to load movie</Text>
      </View>
    );
  }

  const handlePlay = (item: any) => {
    router.push({
      pathname: "/player",
      params: {
        url: item.url,
        title: item.name,
        mediaType: "vod",
        overview: item.info?.description || "No description available.",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BACKDROP */}
      <Image
        source={{ uri: movie.tmdb.backdrop || "" }}
        style={styles.backdrop}
        blurRadius={2}
      />
      <View style={styles.backdropOverlay} />

      {/* HEADER */}
      <Pressable style={styles.backBtn} onPress={router.back}>
        <ChevronLeft color='white' size={24} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        {/* POSTER */}
        <Image
          source={{
            uri: movie.tmdb.poster || "https://via.placeholder.com/300x450",
          }}
          style={styles.poster}
        />

        {/* TITLE */}
        <Text style={styles.title}>{movie.tmdb.title}</Text>

        {/* META */}
        <View style={styles.metaRow}>
          <MetaItem
            icon={<Calendar size={16} color='#d1d5db' />}
            text={new Date(movie.tmdb.releaseDate!).toDateString()}
          />
          <MetaItem
            icon={<Clock size={16} color='#d1d5db' />}
            text={`${Math.floor(movie.tmdb.runtime! / 60)}h ${
              movie.tmdb.runtime! % 60
            }m`}
          />
        </View>

        {/* OVERVIEW */}
        <Text style={styles.sectionTitle}>Synopsis</Text>
        <Text style={styles.overview}>{movie.tmdb.overview}</Text>

        {/* PLAY */}
        {movie.dbMovies.length > 0 ?
          <>
            <Pressable
              style={styles.playBtn}
              onPress={() => handlePlay(movie.dbMovies[0])}
            >
              <Play size={20} color='white' fill='white' />
              <Text style={styles.playText}>Watch Now</Text>
            </Pressable>

            {movie.dbMovies.length > 1 && (
              <>
                <Pressable
                  style={styles.sourceBtn}
                  onPress={() => setDropdownOpen((v) => !v)}
                >
                  <Text style={styles.sourceText}>
                    Source: {movie.dbMovies[0]?.name}
                  </Text>
                  <ChevronDown color='white' size={16} />
                </Pressable>

                {dropdownOpen &&
                  movie.dbMovies.map((m) => (
                    <Pressable
                      key={m.id}
                      style={styles.sourceItem}
                      onPress={() => handlePlay(m)}
                    >
                      <Text style={styles.sourceItemText}>{m.name}</Text>
                    </Pressable>
                  ))}
              </>
            )}
          </>
        : <Text style={styles.muted}>No video sources available</Text>}

        {/* CAST */}
        {movie.tmdb.cast?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cast</Text>
            <FlatList
              horizontal
              data={movie.tmdb.cast.slice(0, 12)}
              keyExtractor={(i, idx) => idx.toString()}
              renderItem={({ item }) => (
                <View style={styles.castItem}>
                  {item.profilePath ?
                    <Image
                      source={{ uri: item.profilePath }}
                      style={styles.castImage}
                    />
                  : <User size={32} color='#9ca3af' />}
                  <Text style={styles.castName}>{item.name}</Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </>
        )}

        {/* TRAILERS */}
        {movie.tmdb.videos?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              <Youtube size={20} color='red' /> Videos & Trailers
            </Text>
            {movie.tmdb.videos
              .filter((v) => v.site === "YouTube")
              .map((v) => (
                <Pressable
                  key={v.id}
                  style={styles.trailerItem}
                  // onPress={() => setSelectedTrailer(v.key)}
                >
                  <Text style={styles.trailerText}>{v.name}</Text>
                </Pressable>
              ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- HELPERS ---------- */

function MetaItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.metaItem}>
      {icon}
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },

  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  backText: { color: "white", marginLeft: 6 },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  poster: {
    width: 180,
    height: 270,
    alignSelf: "center",
    borderRadius: 12,
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 12,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: { color: "#d1d5db", fontSize: 12 },

  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
  },

  overview: { color: "#d1d5db", lineHeight: 20 },

  playBtn: {
    flexDirection: "row",
    backgroundColor: "#f59e0b",
    padding: 14,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },

  playText: { color: "white", fontWeight: "700" },

  sourceBtn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sourceText: { color: "white" },

  sourceItem: {
    padding: 12,
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },

  sourceItemText: { color: "white" },

  castItem: {
    width: 90,
    alignItems: "center",
    marginRight: 12,
  },

  castImage: {
    width: 70,
    height: 100,
    borderRadius: 8,
  },

  castName: {
    color: "#e5e7eb",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },

  trailerItem: {
    padding: 12,
    backgroundColor: "#111",
    borderRadius: 8,
    marginTop: 8,
  },

  trailerText: { color: "white" },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  muted: { color: "#9ca3af", marginTop: 8 },

  error: { color: "#ef4444", marginTop: 8 },

  modalClose: {
    padding: 16,
    backgroundColor: "#000",
  },

  modalCloseText: { color: "white", fontWeight: "600" },
});
