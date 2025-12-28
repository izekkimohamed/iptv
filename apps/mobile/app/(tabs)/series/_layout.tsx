// app/(tabs)/movies/_layout.tsx
import Header from "@/components/Header";
import { Stack } from "expo-router";

export default function MoviesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => <Header />, // Hide header for all screens in movies
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen
        name='[id]'
        options={{
          headerShown: false, // Explicitly hide for [id] screen
        }}
      />
    </Stack>
  );
}
