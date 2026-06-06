import { Tabs } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";

export default function TabsLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Mantemos oculto porque você usa seu próprio componente
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="mensagens" />
      <Tabs.Screen name="perfil" />
      <Tabs.Screen name="marketplace" />
    </Tabs>
  );
}