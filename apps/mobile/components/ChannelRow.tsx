import { trpc } from "@/lib/trpc";
import { usePlayerTheme } from "@/theme/playerTheme";
import { usePlaylistStore } from "@repo/store";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, Tv } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

interface ChannelRowProps {
  channel: any;
}

export const ChannelRow = ({ channel }: ChannelRowProps) => {
  const router = useRouter();
  const theme = usePlayerTheme();
  const utils = trpc.useUtils();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Fix: useSharedValue should only be accessed via useAnimatedStyle
  const heartScale = useSharedValue(1);
  const playlist = usePlaylistStore((state) => state.selectedPlaylist);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime(Math.floor(Date.now() / 1000)),
      30000
    );
    return () => clearInterval(timer);
  }, []);

  const { data: epgData } = trpc.channels.getShortEpg.useQuery(
    {
      channelId: channel.streamId,
      url: playlist?.baseUrl ?? "",
      username: playlist?.username ?? "",
      password: playlist?.password ?? "",
    },
    { enabled: !!channel.streamId, staleTime: 1000 * 60 * 5 }
  );

  const { mutate: toggleFavorite } = trpc.channels.toggleFavorite.useMutation({
    onSuccess: () => utils.channels.getChannels.invalidate(),
  });

  const programInfo = useMemo(() => {
    if (!epgData?.length) return null;
    const current = epgData.find(
      (p: any) =>
        currentTime >= Number(p.start_timestamp) &&
        currentTime <= Number(p.stop_timestamp)
    );
    if (!current) return null;

    const start = Number(current.start_timestamp);
    const stop = Number(current.stop_timestamp);
    const progress = Math.min(
      100,
      Math.max(0, ((currentTime - start) / (stop - start)) * 100)
    );

    const formatTime = (ts: number) =>
      new Date(ts * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    return {
      title: current.title,
      progress,
      startTime: formatTime(start),
      stopTime: formatTime(stop),
    };
  }, [epgData, currentTime]);

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.value = withSequence(withSpring(1.3), withSpring(1));
    toggleFavorite({
      channelsId: Number(channel.id),
      isFavorite: !channel.isFavorite,
    });
  };

  // Fix for the Reanimated Warning:
  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? `${theme.primary}10` : "transparent" },
      ]}
      onPress={() =>
        router.push({
          pathname: "/player",
          params: { url: channel.url, title: channel.name },
        })
      }
    >
      <View
        style={[
          styles.logoContainer,
          {
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
          },
        ]}
      >
        {channel.streamIcon ?
          <Image
            source={{ uri: channel.streamIcon }}
            style={styles.logo}
            contentFit='contain'
          />
        : <Tv size={20} color={theme.textMuted} />}
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[styles.channelName, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {channel.name}
        </Text>

        {programInfo ?
          <View style={styles.epgWrapper}>
            <Text
              style={[styles.programTitle, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {programInfo.title}
            </Text>
            <View style={styles.progressRow}>
              <Text style={[styles.timeText, { color: theme.textMuted }]}>
                {programInfo.startTime}
              </Text>
              <View style={[styles.track, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${programInfo.progress}%`,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.timeText,
                  { color: theme.textMuted, textAlign: "right" },
                ]}
              >
                {programInfo.stopTime}
              </Text>
            </View>
          </View>
        : <Text style={[styles.noEpg, { color: theme.textMuted }]}>
            No Information Available
          </Text>
        }
      </View>

      <Pressable
        onPress={handleFavorite}
        hitSlop={15}
        style={styles.favoriteTouch}
      >
        <Animated.View style={animatedHeartStyle}>
          <Heart
            size={22}
            color={channel.isFavorite ? theme.primary : theme.textMuted}
            fill={channel.isFavorite ? theme.primary : "transparent"}
          />
        </Animated.View>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  logoContainer: {
    width: 64,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logo: { width: "80%", height: "80%" },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    gap: 2,
  },
  channelName: {
    fontSize: 15,
    fontWeight: "700",
  },
  epgWrapper: {
    marginTop: 2,
  },
  programTitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  track: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  timeText: {
    fontSize: 10,
    fontWeight: "600",
    minWidth: 40,
  },
  noEpg: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  favoriteTouch: {
    padding: 8,
    marginLeft: 4,
  },
});
