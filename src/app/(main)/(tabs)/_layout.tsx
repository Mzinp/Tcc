import Navegacao from "@/components/Navegacao"; // Verifique se o @ está configurado, senão use "../../../components/Navegacao"
import { Tabs } from "expo-router";
import type { ComponentType } from "react";
import { View } from "react-native";
import { useAppTheme } from "@/context/ThemeContext"; // Importando o hook do tema global

const NavegacaoTyped = Navegacao as ComponentType<{ title: string }>;

export default function TabsLayout() {
  const { theme } = useAppTheme(); // Injetando o cérebro do tema reativo global

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Isso mantém a barra nativa oculta
        }}
      />
      {/* Aqui passamos o título que o componente espera.
        Como o botão do Chat sumiu daqui de dentro, o erro com certeza está no arquivo do próprio componente 
        de navegação personalizada ("@/components/Navegacao").
      */}
      <NavegacaoTyped title="VIZZO" />
    </View>
  );
}