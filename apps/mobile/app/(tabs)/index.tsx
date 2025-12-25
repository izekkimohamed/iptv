import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Database, Play, Search, User } from "lucide-react-native"; // Added Database icon
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Access the selected playlist from Zustand
  const {
    selectedPlaylist,
    selectPlaylist,
    addPlaylist,
    playlists: storePlaylists,
  } = usePlaylistStore();

  // Fetching popular content
  const { data: homeData, isLoading } = trpc.home.getHome.useQuery(undefined, {
    enabled: !!selectedPlaylist, // Only fetch if a playlist is active
  });

  const { data: playlists } = trpc.playlists.getPlaylists.useQuery();

  useEffect(() => {
    if (storePlaylists.length === 0 && playlists) {
      playlists.forEach((playlist) => {
        addPlaylist(playlist);
      });
      selectPlaylist(playlists[0]);
    }
  }, [addPlaylist, playlists, selectPlaylist, storePlaylists.length]);

  const renderPoster = ({
    item,
    type,
  }: {
    item: any;
    type: "movie" | "series";
  }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: type === "movie" ? `/(tabs)/movies/tmdb` : `/series`,
          params: {
            movieId: item.id,
            playlistId: 26,
          },
        })
      }
      style={styles.card}
    >
      <Image
        source={{ uri: item.posterUrl }}
        style={styles.poster}
        contentFit='cover'
        transition={200}
      />
      <Text numberOfLines={1} style={styles.cardTitle}>
        {item.title || item.name}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Playlist Access */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={20} color='#9CA3AF' />
          <TextInput
            placeholder='Search movies, series, channels...'
            placeholderTextColor='#9CA3AF'
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => router.push(`/search?q=${searchQuery}`)}
          />
        </View>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.push("/playlists")}
            style={styles.playlistButton}
          >
            <User size={20} color={selectedPlaylist ? "#2563eb" : "#ef4444"} />
          </Pressable>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {!selectedPlaylist ?
          /* Empty State if no playlist is connected */
          <View style={styles.noPlaylistContainer}>
            <Database size={60} color='#1f1f1f' />
            <Text style={styles.noPlaylistText}>No active playlist found.</Text>
            <Pressable
              style={styles.connectButton}
              onPress={() => router.push("/playlists/manage")}
            >
              <Text style={styles.connectButtonText}>Manage Playlists</Text>
            </Pressable>
          </View>
        : isLoading ?
          <ActivityIndicator
            size='large'
            color='#2563eb'
            style={{ marginTop: 50 }}
          />
        : <>
            {/* Featured Backdrop */}
            {homeData?.movies?.[0] && (
              <View style={styles.featuredContainer}>
                <Image
                  source={{ uri: homeData.movies[0].backdropUrl || "" }}
                  style={styles.featuredImage}
                />
                <View style={styles.featuredOverlay}>
                  <Text style={styles.featuredTitle}>
                    {homeData.movies[0].title}
                  </Text>
                  <Pressable
                    style={styles.playButton}
                    onPress={() =>
                      router.push(`/movies/${homeData.movies[0].id}`)
                    }
                  >
                    <Play size={16} color='white' fill='white' />
                    <Text style={styles.playButtonText}>Watch Now</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Popular Movies Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Movies</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={homeData?.movies}
                renderItem={(info) =>
                  renderPoster({ item: info.item, type: "movie" })
                }
                keyExtractor={(item) => `movie-${item.id}`}
                contentContainerStyle={styles.listContent}
              />
            </View>

            {/* Popular Series Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Series</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={homeData?.series}
                renderItem={(info) =>
                  renderPoster({ item: info.item, type: "series" })
                }
                keyExtractor={(item) => `series-${item.id}`}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    padding: 10,
    justifyContent: "center",
    gap: 10,
    flexDirection: "row",
    alignContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  playlistButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 200,
    gap: 6,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  playlistText: { color: "#9ca3af", fontSize: 12, fontWeight: "bold" },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: { flex: 1, color: "#fff", marginLeft: 10, fontSize: 16 },
  featuredContainer: {
    height: 220,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 30,
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    padding: 15,
  },
  featuredTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  playButtonText: { color: "white", fontWeight: "bold", marginLeft: 5 },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 20,
    marginBottom: 15,
  },
  listContent: { paddingLeft: 20 },
  card: { width: 130, marginRight: 15 },
  poster: {
    width: 130,
    height: 190,
    borderRadius: 10,
    backgroundColor: "#1f1f1f",
  },
  cardTitle: {
    color: "#e5e7eb",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  noPlaylistContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    padding: 40,
  },
  noPlaylistText: {
    color: "#4b5563",
    fontSize: 16,
    marginTop: 15,
    textAlign: "center",
  },
  connectButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
  },
  connectButtonText: { color: "white", fontWeight: "bold" },
});
