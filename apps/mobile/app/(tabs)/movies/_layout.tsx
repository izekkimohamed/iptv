// app/(tabs)/movies/_layout.tsx
import Header from "@/components/Header";
import { Stack } from "expo-router";

export default function MoviesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => <Header />,
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen
        name='[id]'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='tmdb'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
