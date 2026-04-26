import { Tabs } from "expo-router";
import Navegacao from "@/components/Navegacao"; // Verifique se o @ está configurado, senão use "../../../components/Navegacao"
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0f1111" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Isso esconde a barra de ícones de baixo
        }}
      />
      {/* Aqui passamos o título que o componente espera */}
      <Navegacao title="VIZZO" />
    </View>
  );
}