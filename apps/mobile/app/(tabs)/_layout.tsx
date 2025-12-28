import { CustomTabBar } from "@/components/navigation/CustomTabBar"; // Adjust path
import { Tabs, useRouter } from "expo-router";

export default function TabsLayout() {
  const router = useRouter();
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // The CustomTabBar handles the background, so we make this transparent
        tabBarHideOnKeyboard: true,
      }}
      backBehavior='history'
    >
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name='movies'
        options={{
          title: "Movies",
        }}
        listeners={{
          tabPress: () => {
            router.push("/movies");
          },
        }}
      />
      <Tabs.Screen
        name='series'
        options={{
          title: "Series",
        }}
        listeners={{
          tabPress: () => {
            router.push("/series");
          },
        }}
      />
      <Tabs.Screen
        name='channels'
        options={{
          title: "Live TV",
        }}
        listeners={{
          tabPress: () => {
            router.push("/channels");
          },
        }}
      />
      <Tabs.Screen
        name='365'
        options={{
          title: "365",
        }}
        listeners={{
          tabPress: () => {
            router.push("/365");
          },
        }}
      />
    </Tabs>
  );
}
