import { usePlayerTheme } from "@/theme/playerTheme";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { Game } from "./LiveScores";
import TeamRow from "./TeamRow";

const MatchCard = ({
  game,
  onPress,
}: {
  game: Game;
  onPress: (id: number) => void;
}) => {
  const theme = usePlayerTheme();
  const [showGoalPopup, setShowGoalPopup] = useState(false);

  const isLive = game.statusGroup === 3;
  const isFinished = game.statusGroup === 4;
  const isScheduled = game.statusGroup === 2;

  const currentTotalScore =
    game.homeCompetitor.score + game.awayCompetitor.score;
  const prevScoreRef = useRef(currentTotalScore);

  // Goal Detection Logic
  useEffect(() => {
    if (isLive && currentTotalScore > prevScoreRef.current) {
      setShowGoalPopup(true);
      const timer = setTimeout(() => setShowGoalPopup(false), 5000);
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = currentTotalScore;
  }, [currentTotalScore, isLive]);

  const progressPercent = Math.min((game.gameTime / 90) * 100, 100);

  return (
    <Pressable
      onPress={() => onPress(game.id)}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          borderColor: showGoalPopup ? "#FACC15" : theme.border,
          backgroundColor:
            isLive ? "rgba(255,255,255,0.03)" : theme.surfaceSecondary,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Goal Popup Overlay */}
      {showGoalPopup && (
        <Animated.View
          entering={ZoomIn}
          exiting={ZoomOut}
          style={styles.goalPopup}
        >
          <View style={styles.goalBadge}>
            <Text style={styles.goalText}>GOAL!</Text>
          </View>
          <View style={styles.goalScoreRow}>
            <Image
              source={{
                uri: `https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.homeCompetitor.id}`,
              }}
              style={styles.goalLogo}
            />
            <Text style={styles.goalScore}>
              {game.homeCompetitor.score} - {game.awayCompetitor.score}
            </Text>
            <Image
              source={{
                uri: `https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.awayCompetitor.id}`,
              }}
              style={styles.goalLogo}
            />
          </View>
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.statusRow}>
            {isLive ?
              <View style={styles.liveBadge}>
                <LivePulse />
                <Text style={styles.liveText}>{game.gameTime}</Text>
              </View>
            : <Text style={[styles.statusText, { color: theme.textMuted }]}>
                {isFinished ?
                  "FT"
                : new Date(game.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                }
              </Text>
            }
            <Text
              style={[styles.compName, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {game.competitionDisplayName}
            </Text>
          </View>
        </View>

        {/* Teams & Scores */}
        <View style={styles.teamsContainer}>
          <TeamRow
            competitor={game.homeCompetitor}
            opponentScore={game.awayCompetitor.score}
            isLive={isLive}
            isFinished={isFinished}
            isScheduled={isScheduled}
            theme={theme}
          />
          <TeamRow
            competitor={game.awayCompetitor}
            opponentScore={game.homeCompetitor.score}
            isLive={isLive}
            isFinished={isFinished}
            isScheduled={isScheduled}
            theme={theme}
          />
        </View>
      </View>

      {/* Progress Bar (Only live or finished) */}
      {!isScheduled && (
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: isLive ? theme.accentSuccess : theme.textMuted,
              },
            ]}
          />
        </View>
      )}
    </Pressable>
  );
};

const LivePulse = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.pulseContainer}>
      <Animated.View style={[styles.pulseDot, style]} />
      <View style={styles.pulseInner} />
    </View>
  );
};

export default MatchCard;

const styles = StyleSheet.create({
  // Match Card Container
  cardContainer: {
    width: 300,
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },
  cardContent: {
    padding: 16,
    flex: 1,
  },

  // Card Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4ade80",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  compName: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    opacity: 0.7,
    flex: 1,
    textAlign: "right",
  },

  // Teams Container
  teamsContainer: { gap: 12 },

  // Progress Bar
  progressBarTrack: {
    height: 4,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  progressBarFill: { height: "100%" },

  // Goal Popup
  goalPopup: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  goalBadge: {
    backgroundColor: "#FACC15",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  goalText: {
    color: "black",
    fontWeight: "900",
    fontSize: 12,
  },
  goalScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  goalLogo: {
    width: 32,
    height: 32,
  },
  goalScore: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },

  // Live Pulse Animation
  pulseContainer: {
    width: 10,
    height: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ade80",
  },
  pulseInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
});
