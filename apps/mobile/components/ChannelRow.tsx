import { trpc } from "@/lib/trpc";
import { usePlayerTheme } from "@/theme/playerTheme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Tv } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface ChannelRowProps {
  channel: any;
  playlist: {
    url: string;
    username: string;
    password: string;
  };
}

// --- Helper: Decode Base64 EPG Titles ---
export const decodeBase64 = (str: string): string => {
  try {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    str = String(str).replace(/=+$/, "");
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4) ?
        (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return decodeURIComponent(escape(output));
  } catch {
    return str;
  }
};

// --- Component: Pulsing Live Dot ---
const LivePulse = ({ color }: { color: string }) => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.liveDotOuter, animatedStyle, { borderColor: color }]}
    >
      <View style={[styles.liveDotInner, { backgroundColor: color }]} />
    </Animated.View>
  );
};

export const ChannelRow = ({ channel, playlist }: ChannelRowProps) => {
  const router = useRouter();
  const theme = usePlayerTheme();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    // Update every 30 seconds is usually enough for EPG progress to save CPU
    const timer = setInterval(
      () => setCurrentTime(Math.floor(Date.now() / 1000)),
      30000
    );
    return () => clearInterval(timer);
  }, []);

  // Fetch EPG (Only enable if visible/mounted)
  const { data: epgData } = trpc.channels.getShortEpg.useQuery(
    {
      channelId: channel.streamId,
      url: playlist.url,
      username: playlist.username,
      password: playlist.password,
    },
    {
      enabled: !!channel.streamId,
      staleTime: 1000 * 60 * 5, // Cache for 5 mins
    }
  );

  const programInfo = useMemo(() => {
    if (!epgData?.length) return null;
    const current = epgData.find(
      (prog: any) =>
        currentTime >= Number(prog.start_timestamp) &&
        currentTime <= Number(prog.stop_timestamp)
    );
    if (!current) return null;

    const start = Number(current.start_timestamp);
    const stop = Number(current.stop_timestamp);
    const duration = stop - start;
    const elapsed = currentTime - start;
    const progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));

    return {
      title: decodeBase64(current.title),
      progress,
      remainingMins: Math.ceil((stop - currentTime) / 60),
      startStr: new Date(start * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      stopStr: new Date(stop * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, [epgData, currentTime]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.rowContainer,
        { borderColor: theme.border },
        pressed && { backgroundColor: theme.surfaceSecondary },
      ]}
      onPress={() =>
        router.push({
          pathname: "/player",
          params: { url: channel.url, title: channel.name, mediaType: "vod" },
        })
      }
    >
      {/* 1. Channel Logo */}
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
        : <Tv size={24} color={theme.primary} />}
      </View>

      {/* 2. Info Section */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.channelName, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {channel.name}
          </Text>
          {/* Live Indicator if EPG exists */}
        </View>

        {programInfo ?
          <View style={styles.programWrapper}>
            <Text
              style={[styles.programTitle, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {programInfo.title}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressRow}>
              <View style={[styles.track, { backgroundColor: theme.trackBg }]}>
                <LinearGradient
                  colors={[theme.primary, theme.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fill, { width: `${programInfo.progress}%` }]}
                />
              </View>
              <Text style={[styles.timeText, { color: theme.textMuted }]}>
                {programInfo.startStr} - {programInfo.stopStr}
              </Text>
            </View>
          </View>
        : <View style={styles.noEpgRow}>
            <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
            <Text style={[styles.noEpgText, { color: theme.textMuted }]}>
              No information available
            </Text>
          </View>
        }
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 5,
  },

  // Logo
  logoContainer: {
    width: 60,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  logo: {
    width: "85%",
    height: "85%",
  },

  // Info
  infoContainer: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  channelName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
    flex: 1,
    marginRight: 8,
  },

  // EPG Section
  programWrapper: {
    gap: 6,
  },
  programTitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  track: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  timeText: {
    fontSize: 10,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },

  // No EPG
  noEpgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  noEpgText: {
    fontSize: 12,
    fontStyle: "italic",
  },

  // Live Pulse
  liveDotOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  arrowContainer: {
    marginLeft: 8,
  },
});
