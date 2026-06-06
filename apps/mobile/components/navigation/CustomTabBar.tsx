import { usePlayerTheme } from "@/theme/playerTheme";
import * as Haptics from "expo-haptics";
import { Film, Home, PlaySquare, Tv, Volleyball } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const MARGIN = 16;
const TAB_BAR_WIDTH = width - MARGIN * 2;
const PADDING_HORIZONTAL = 12;

export function CustomTabBar({ state, navigation }: any) {
  const { bottom } = useSafeAreaInsets();
  const theme = usePlayerTheme();

  const availableWidth = TAB_BAR_WIDTH - PADDING_HORIZONTAL * 2;
  const tabWidth = availableWidth / state.routes.length;

  const translateX = useSharedValue(0);
  const scaleX = useSharedValue(1);

  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, {
      stiffness: 300,
      damping: 28,
      mass: 0.6,
    });
    scaleX.value = withSpring(1.05, { stiffness: 400, damping: 15 }, () => {
      scaleX.value = withSpring(1, { stiffness: 400, damping: 15 });
    });
  }, [scaleX, state.index, tabWidth, translateX]);

  const activePillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scaleX: scaleX.value }],
  }));

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, 12) }]}>
      <View
        style={[
          styles.barWrapper,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                width: tabWidth,
                backgroundColor: theme.primary,
              },
              activePillStyle,
            ]}
          />

          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
              });
              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                onPress={onPress}
                theme={theme}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const TabItem = ({ routeName, isFocused, onPress, theme }: any) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.15 : 1, { stiffness: 300 });
  }, [scale, isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: withTiming(isFocused ? 1 : 0.5, { duration: 150 }),
  }));

  const getIcon = () => {
    const props = { size: 22, strokeWidth: 2.2 };

    switch (routeName) {
      case "index":
        return (
          <Home
            {...props}
            color={isFocused ? theme.primaryForeground : theme.textMuted}
          />
        );
      case "movies":
        return (
          <PlaySquare
            {...props}
            color={isFocused ? theme.primaryForeground : theme.textMuted}
          />
        );
      case "series":
        return (
          <Film
            {...props}
            color={isFocused ? theme.primaryForeground : theme.textMuted}
          />
        );
      case "channels":
        return (
          <Tv
            {...props}
            color={isFocused ? theme.primaryForeground : theme.textMuted}
          />
        );
      case "365":
        return (
          <Volleyball
            {...props}
            color={isFocused ? theme.primaryForeground : theme.textMuted}
          />
        );
      default:
        return (
          <Home
            {...props}
            color={isFocused ? theme.primaryForeground : theme.textMuted}
          />
        );
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.tabItem}>
      <Animated.View style={animatedStyle}>{getIcon()}</Animated.View>
      <Animated.Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? theme.primaryForeground : theme.textMuted,
            opacity: isFocused ? 1 : 0.55,
            fontWeight: isFocused ? "700" : "500",
          },
        ]}
      >
        {getLabel(routeName)}
      </Animated.Text>
    </Pressable>
  );
};

const getLabel = (route: string) => {
  const labels: Record<string, string> = {
    index: "Home",
    movies: "Movies",
    series: "Series",
    channels: "Live TV",
    "365": "Sports",
  };
  return labels[route] || route;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
  barWrapper: {
    width: TAB_BAR_WIDTH,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activeIndicator: {
    position: "absolute",
    left: PADDING_HORIZONTAL,
    height: 44,
    borderRadius: 14,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
