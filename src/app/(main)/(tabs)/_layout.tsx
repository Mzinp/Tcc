import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Aqui o Expo vai carregar automaticamente index.tsx, marketplace.tsx, etc. */}
    </Tabs>
  );
}