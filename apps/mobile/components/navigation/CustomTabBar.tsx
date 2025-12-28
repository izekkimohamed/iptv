import { usePlayerTheme } from "@/theme/playerTheme";
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const MARGIN = 20;
const TAB_BAR_WIDTH = width - MARGIN * 2;
const PADDING_HORIZONTAL = 8; // Internal padding of the bar

export function CustomTabBar({ state, navigation }: any) {
  const { bottom } = useSafeAreaInsets();
  const theme = usePlayerTheme();

  // Calculate the width of each individual tab section
  const availableWidth = TAB_BAR_WIDTH - PADDING_HORIZONTAL * 2;
  const tabWidth = availableWidth / state.routes.length;

  const translateX = useSharedValue(0);
  const scaleX = useSharedValue(1);

  useEffect(() => {
    // Precise calculation to ensure centering
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
            backgroundColor: `${theme.bg}F2`,
            borderColor: `${theme.border}33`,
          },
        ]}
      >
        <View style={styles.content}>
          {/* Precise Sliding Pill */}
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                width: tabWidth, // Pill takes full tab width for perfect centering
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
  const iconScale = useSharedValue(1);

  useEffect(() => {
    iconScale.value = withSpring(isFocused ? 1.1 : 1, { stiffness: 300 });
  }, [iconScale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: withTiming(isFocused ? 1 : 0.6, { duration: 150 }),
  }));

  const getIcon = () => {
    const iconColor = isFocused ? "#FFF" : theme.textMuted;
    const props = { size: 22, color: iconColor, strokeWidth: 2.2 };

    switch (routeName) {
      case "index":
        return <Home {...props} />;
      case "movies":
        return <PlaySquare {...props} />;
      case "series":
        return <Film {...props} />;
      case "channels":
        return <Tv {...props} />;
      case "365":
        return <Volleyball {...props} />;
      default:
        return <Home {...props} />;
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <Animated.View style={animatedIconStyle}>{getIcon()}</Animated.View>
    </Pressable>
  );
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
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
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
    zIndex: 2, // Keeps icons above the pill
  },
  activeIndicator: {
    position: "absolute",
    left: PADDING_HORIZONTAL, // Start at the padding offset
    height: 44,
    borderRadius: 22,
    zIndex: 1,
  },
});
