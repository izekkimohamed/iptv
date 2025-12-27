import { Tabs, useRouter } from "expo-router";
import { Home, Library, PlaySquare, Tv, Volleyball } from "lucide-react-native";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#2563eb", // Modern Blue
        tabBarInactiveTintColor: "#9CA3AF", // Gray
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name='movies'
        options={{
          title: "Movies",
          tabBarIcon: ({ color, size }) => (
            <PlaySquare size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            router.push("/movies");
          },
        }}
      />
      <Tabs.Screen
        name='series'
        options={{
          title: "Series",
          tabBarIcon: ({ color, size }) => (
            <Library size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            router.push("/series");
          },
        }}
      />
      <Tabs.Screen
        name='channels'
        options={{
          title: "Live TV",
          tabBarIcon: ({ color, size }) => <Tv size={size} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            router.push("/channels");
          },
        }}
      />
      <Tabs.Screen
        name='365'
        options={{
          title: "365",
          tabBarIcon: ({ color, size }) => (
            <Volleyball size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            router.push("/365");
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#1f1f1f",
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
