import { usePlayerTheme } from "@/theme/playerTheme";
// Added Lucide icons for events
import {
  AlertCircle,
  MapPin,
  RectangleVertical,
  VolleyballIcon,
  X,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// New Component for Event Icons
const EventIcon = ({
  type,
  color,
  size = 14,
}: {
  type: string;
  color: string;
  size?: number;
}) => {
  if (type.includes("Goal"))
    return <VolleyballIcon size={size} color={color} fill={color} />;
  if (type.includes("Card"))
    return <RectangleVertical size={size} color={color} fill={color} />;
  return <AlertCircle size={size} color={color} />;
};

const MatchDetailsModal = ({
  gameId,
  visible,
  onClose,
}: {
  gameId: number | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const theme = usePlayerTheme();

  const { data: match, isLoading } = useSWR(
    gameId ?
      `${process.env.EXPO_PUBLIC_API_URL}/match-details?id=${gameId}`
    : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  if (!visible) return null;

  const getPlayerName = (playerId: number) => {
    if (!match?.members) return "Player";
    const member = match.members.find((m: any) => m.id === playerId);
    return member ? member.name : "Unknown Player";
  };

  const getFilteredEvents = () => {
    if (!match?.events) return [];
    return match.events.filter((e: any) => {
      const name = e.eventType?.name || "";
      return (
        name.includes("Goal") ||
        name.includes("Yellow Card") ||
        name.includes("Red Card")
      );
    });
  };

  const filteredEvents = getFilteredEvents();
  const startTime = match?.startTime ? new Date(match.startTime) : null;

  const formattedDate =
    startTime?.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) || "";

  const formattedTime =
    startTime?.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }) || "";

  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: "#0f0f0f" }]}>
          <View style={styles.modalHandle} />

          <Pressable onPress={onClose} style={styles.closeButton}>
            <X color='#fff' size={24} />
          </Pressable>

          {isLoading ?
            <View style={styles.modalLoading}>
              <ActivityIndicator size='large' color={theme.primary} />
            </View>
          : match ?
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.headerTop}>
                <Text
                  style={[
                    styles.competitionName,
                    { color: theme.textSecondary },
                  ]}
                >
                  {match.competitionDisplayName}
                </Text>
                <View style={styles.dateRow}>
                  <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                    {formattedDate} • {formattedTime}
                  </Text>
                </View>
              </View>

              <View style={styles.modalHeader}>
                {/* Home Team */}
                <View style={styles.modalTeam}>
                  <Image
                    source={{
                      uri: `https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.homeCompetitor.id}`,
                    }}
                    style={styles.modalLogo}
                  />
                  <Text
                    style={[styles.modalTeamName, { color: theme.textPrimary }]}
                    numberOfLines={2}
                  >
                    {match.homeCompetitor.name}
                  </Text>
                </View>

                {/* Score */}
                <View style={styles.modalScoreBox}>
                  <Text
                    style={[styles.modalScore, { color: theme.textPrimary }]}
                  >
                    {match.homeCompetitor.score} - {match.awayCompetitor.score}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text
                      style={[styles.modalStatus, { color: theme.primary }]}
                    >
                      {match.gameTimeDisplay || match.statusText}
                    </Text>
                  </View>
                </View>

                {/* Away Team */}
                <View style={styles.modalTeam}>
                  <Image
                    source={{
                      uri: `https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.awayCompetitor.id}`,
                    }}
                    style={styles.modalLogo}
                  />
                  <Text
                    style={[styles.modalTeamName, { color: theme.textPrimary }]}
                    numberOfLines={2}
                  >
                    {match.awayCompetitor.name}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                {match.venue && (
                  <View
                    style={[
                      styles.infoChip,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                  >
                    <MapPin size={14} color={theme.textSecondary} />
                    <Text
                      style={[styles.infoText, { color: theme.textSecondary }]}
                    >
                      {match.venue.name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Timeline Section */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                  KEY MOMENTS
                </Text>
                <View style={styles.timelineContainer}>
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: theme.border },
                    ]}
                  />

                  {filteredEvents.map((event: any, i: number) => {
                    const isHome =
                      event.competitorId === match.homeCompetitor.id;
                    const eventName = event.eventType?.name || "Event";

                    let eventColor = "#94a3b8";
                    if (eventName.includes("Goal")) eventColor = "#CCCC";
                    else if (eventName.includes("Yellow"))
                      eventColor = "#FDE047";
                    else if (eventName.includes("Red")) eventColor = "#EF4444";

                    return (
                      <View
                        key={i}
                        style={[
                          styles.eventRow,
                          { flexDirection: isHome ? "row" : "row-reverse" },
                        ]}
                      >
                        {/* Event Details */}
                        <View
                          style={[
                            styles.eventContent,
                            isHome ?
                              { alignItems: "flex-end", paddingRight: 40 }
                            : { alignItems: "flex-start", paddingLeft: 40 },
                          ]}
                        >
                          <View
                            style={{
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "space-between",
                              gap: 20,
                            }}
                          >
                            <Text
                              style={[
                                styles.eventPlayer,
                                { color: theme.textPrimary },
                              ]}
                            >
                              {getPlayerName(event.playerId)}
                            </Text>
                            <EventIcon type={eventName} color={eventColor} />
                          </View>
                        </View>

                        {/* Center Time Bubble */}
                        <View
                          style={[
                            styles.eventTimeBubble,
                            {
                              backgroundColor: theme.surfaceSecondary,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.eventTimeText,
                              { color: theme.textPrimary },
                            ]}
                          >
                            {event.gameTimeDisplay}
                          </Text>
                        </View>

                        {/* Empty Space for Balance */}
                        <View style={{ flex: 1 }} />
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          : null}
        </View>
      </View>
    </Modal>
  );
};

export default MatchDetailsModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "85%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginTop: 12,
    borderRadius: 2,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  modalLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTop: { alignItems: "center", marginTop: 20, marginBottom: 10 },
  competitionName: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dateRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  modalTeam: { alignItems: "center", width: 90, gap: 8 },
  modalLogo: { width: 55, height: 55, resizeMode: "contain" },
  modalTeamName: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  modalScoreBox: { alignItems: "center" },
  modalScore: { fontSize: 40, fontWeight: "900", letterSpacing: -2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginTop: 4,
  },
  modalStatus: { fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  infoText: { fontSize: 12, fontWeight: "500" },
  sectionContainer: { paddingHorizontal: 16, paddingBottom: 50 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 2,
  },
  timelineContainer: { position: "relative" },
  timelineLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    marginLeft: -0.5,
    opacity: 0.3,
  },
  eventRow: { alignItems: "center", marginBottom: 25, width: "100%" },
  eventTimeBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    zIndex: 10,
    position: "absolute",
    left: "50%",
    marginLeft: -18,
  },
  eventTimeText: { fontSize: 10, fontWeight: "bold" },
  eventContent: {
    flex: 1,
  },
  eventPlayer: { fontSize: 13, fontWeight: "700" },
  eventType: { fontSize: 11, fontWeight: "500" },
});
