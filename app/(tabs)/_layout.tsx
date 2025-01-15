import { useFonts } from "expo-font";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useSession } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const session = useSession();
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    ComicSans: require("../../assets/fonts/ComicSans.ttf"),
  });

  if (session.loading) {
    return null;
  }
  if (!session.user) {
    return <Redirect href="/login" />;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bird.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
