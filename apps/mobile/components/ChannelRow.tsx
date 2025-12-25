import { trpc } from "@/lib/trpc";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight, Clock, Tv } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ChannelRowProps {
  channel: any;
  playlist: {
    url: string;
    username: string;
    password: string;
  };
}

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

export const ChannelRow = ({ channel, playlist }: ChannelRowProps) => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Update time every second for live progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch EPG Data
  const { data: epgData } = trpc.channels.getShortEpg.useQuery(
    {
      channelId: channel.streamId,
      url: playlist.url,
      username: playlist.username,
      password: playlist.password,
    },
    {
      enabled: !!channel.streamId,
      refetchInterval: 1000 * 60 * 5, // Refresh every 5 mins
    }
  );

  // Calculate current program info and progress
  const programInfo = useMemo(() => {
    if (!epgData?.length) return null;

    // Find the program that's currently playing
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
    const progress = (elapsed / duration) * 100;

    // Format remaining time
    const remainingSeconds = stop - currentTime;
    const remainingMins = Math.ceil(remainingSeconds / 60);

    return {
      title: decodeBase64(current.title),
      progress: Math.max(0, Math.min(100, progress)),
      remainingMins,
      duration: Math.floor(duration / 60),
      elapsed: Math.floor(elapsed / 60),
    };
  }, [epgData, currentTime]);

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/player",
          params: { url: channel.url, title: channel.name, mediaType: "vod" },
        })
      }
    >
      {/* Channel Logo */}
      <View style={styles.logoWrapper}>
        {channel.streamIcon ?
          <Image
            source={{ uri: channel.streamIcon }}
            style={styles.logo}
            contentFit='contain'
          />
        : <Tv color='#6b7280' size={20} />}
      </View>

      {/* Program Info */}
      <View style={styles.details}>
        <Text style={styles.channelName} numberOfLines={1}>
          {channel.name}
        </Text>

        {programInfo ?
          <View style={styles.epgContainer}>
            <Text style={styles.programTitle} numberOfLines={1}>
              {programInfo.title}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${programInfo.progress}%` },
                  ]}
                />
              </View>

              {/* Time Info */}
              <View style={styles.timeInfo}>
                <Clock size={11} color='#9CA3AF' />
                <Text style={styles.timeText}>
                  {programInfo.elapsed}m / {programInfo.duration}m
                </Text>
              </View>
            </View>
          </View>
        : <Text style={styles.noEpg}>No program information</Text>}
      </View>

      <ChevronRight color='#4b5563' size={18} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    overflow: "hidden",
  },
  logoWrapper: {
    width: 56,
    height: 42,
    backgroundColor: "#111",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#222",
  },
  logo: {
    width: "90%",
    height: "90%",
  },
  details: {
    flex: 1,
    marginLeft: 14,
  },
  channelName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  epgContainer: {
    gap: 6,
  },
  programTitle: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "600",
  },
  progressContainer: {
    gap: 6,
  },
  progressBg: {
    height: 4,
    backgroundColor: "#222",
    borderRadius: 2,
    width: "85%",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "500",
  },
  noEpg: {
    color: "#6b7280",
    fontSize: 12,
    fontStyle: "italic",
  },
});
