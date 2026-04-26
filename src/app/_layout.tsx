import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* O Index (Landing Page) é o primeiro a carregar */}
      <Stack.Screen name="index" />
      
      {/* Grupo de Autenticação (Login/Cadastro) */}
      <Stack.Screen name="(auth)" />
      
      {/* Grupo Principal (Tabs e Stack de serviços) */}
      <Stack.Screen name="(main)" />
    </Stack>
  );
}