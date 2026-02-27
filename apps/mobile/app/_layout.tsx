import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { trpc, trpcClient } from "../lib/trpc";
import { useThemeStore } from "../store/theme-store";

function ThemeStatusBar() {
  const { themeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme !== "light");

  return <StatusBar style={isDark ? "light" : "dark"} />;
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeStatusBar />
      <BottomSheetModalProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              {/* Main Stack Navigator */}
              <Stack screenOptions={{ headerShown: false }}>
                {/* The (tabs) group handles the main navigation */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* Modal for adding a new Playlist (from playlistsRouter) */}
                <Stack.Screen
                  name="playlists/manage"
                  options={{
                    presentation: "modal",
                    headerShown: false,
                  }}
                />

                {/* Fullscreen Video Player */}
                <Stack.Screen
                  name="player/index"
                  options={{
                    orientation: "landscape",
                    headerShown: false,
                  }}
                />

                {/* Settings Screen */}
                <Stack.Screen
                  name="settings"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            </SafeAreaProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
