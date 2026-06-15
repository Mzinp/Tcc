import Navegacao from "@/components/Navegacao";
import { useAppTheme } from "@/context/ThemeContext";
import { Slot, usePathname } from "expo-router";
import { View } from "react-native";

export default function MainLayout() {
  const { theme } = useAppTheme();
  const pathname = usePathname();

  // Vamos garantir que qualquer rota contendo 'login', 'Cadastro' ou 'CriarCondominio' oculte a barra
  const ocultarNavegacao = 
    pathname.toLowerCase().includes("cadastro") || 
    pathname.toLowerCase().includes("login") || 
    pathname.toLowerCase().includes("criarcondominio");

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Slot />
      {!ocultarNavegacao && <Navegacao title="VIZZO" />}
    </View>
  );
}