import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Clapperboard, Film, Tv } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q: string }>();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  // Fetch data from your backend globalSearch
  const { data, isLoading } = trpc.home.globalSearch.useQuery({
    query: q || "",
    playlistId: selectPlaylist?.id ?? 0, // Replace with your active playlist state
  });

  // Prepare sections for SectionList
  const sections = [
    {
      title: "Channels",
      icon: <Tv size={18} color='#2563eb' />,
      data: data?.channels || [],
      type: "channel",
    },
    {
      title: "Movies",
      icon: <Film size={18} color='#eab308' />,
      data: data?.movies || [],
      type: "movie",
    },
    {
      title: "Series",
      icon: <Clapperboard size={18} color='#ec4899' />,
      data: data?.series || [],
      type: "series",
    },
  ].filter((section) => section.data.length > 0); // Only show sections with results

  const renderItem = ({ item, section }: { item: any; section: any }) => (
    <Pressable
      style={styles.itemContainer}
      onPress={() => {
        router.push({
          pathname: "/player",
          params: {
            url: item.url,
            mediaType: "live",
            title: item.name,
          },
        });
      }}
    >
      <Image
        source={{ uri: item.streamIcon || item.cover }}
        style={styles.thumbnail}
        contentFit='cover'
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name || item.title}
        </Text>
        {section.type === "channel" && (
          <Text style={styles.itemSubtext}>Live Stream</Text>
        )}
      </View>
      <ChevronRight size={20} color='#374151' />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Search Results for {q}</Text>

      {isLoading ?
        <View style={styles.center}>
          <ActivityIndicator size='large' color='#2563eb' />
        </View>
      : sections.length === 0 ?
        <View style={styles.center}>
          <Text style={styles.emptyText}>{JSON.stringify(sections)}</Text>
        </View>
      : <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title, icon } }) => (
            <View style={styles.sectionHeader}>
              {icon}
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#9CA3AF", fontSize: 16 },
  listContent: { paddingBottom: 40 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 12,
    marginTop: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  thumbnail: {
    width: 50,
    height: 75,
    borderRadius: 6,
    backgroundColor: "#222",
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { color: "white", fontSize: 16, fontWeight: "600" },
  itemSubtext: { color: "#6b7280", fontSize: 12, marginTop: 4 },
});
