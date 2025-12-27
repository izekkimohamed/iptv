import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface TeamRowProps {
  competitor: {
    id: number;
    name: string;
    score: number;
  };
  opponentScore: number;
  isLive: boolean;
  isFinished: boolean;
  isScheduled: boolean;
  theme: any;
}

const TeamRow = ({
  competitor,
  opponentScore,
  isLive,
  isFinished,
  isScheduled,
  theme,
}: TeamRowProps) => {
  const isWinner = isFinished && competitor.score > opponentScore;

  return (
    <View style={styles.teamRow}>
      <View style={styles.teamInfo}>
        <Image
          source={{
            uri: `https://imagecache.365scores.com/image/upload/f_auto,w_48/competitors/${competitor.id}`,
          }}
          style={styles.teamLogo}
        />
        <Text
          style={[
            styles.teamName,
            {
              color:
                isWinner || isLive ? theme.textPrimary : theme.textSecondary,
              fontWeight: isWinner ? "800" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {competitor.name}
        </Text>
      </View>
      {!isScheduled && (
        <Text
          style={[
            styles.scoreText,
            {
              color: isWinner || isLive ? theme.textPrimary : theme.textMuted,
              fontWeight: isWinner ? "800" : "600",
            },
          ]}
        >
          {competitor.score}
        </Text>
      )}
    </View>
  );
};

export default TeamRow;

const styles = StyleSheet.create({
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  teamLogo: {
    width: 24,
    height: 24,
  },
  teamName: {
    fontSize: 15,
    flex: 1,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "800",
    minWidth: 24,
    textAlign: "right",
  },
});
