import Navegacao from "@/components/Navegacao";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

export default function TabsLayout() {
  const { theme } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
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