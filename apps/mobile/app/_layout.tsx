import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { trpc, trpcClient } from "../lib/trpc";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              {/* Main Stack Navigator */}
              <Stack screenOptions={{ headerShown: false }}>
                {/* The (tabs) group handles the main navigation */}
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />

                {/* Modal for adding a new Playlist (from playlistsRouter) */}
                <Stack.Screen
                  name='playlists/manage'
                  options={{
                    presentation: "modal",
                    headerShown: false,
                  }}
                />

                {/* Fullscreen Video Player */}
                <Stack.Screen
                  name='player/index'
                  options={{
                    orientation: "landscape",
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
