import { Tabs } from "expo-router";
import Navegacao from "@/components/Navegacao";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Navegacao />
    </View>
  );
}