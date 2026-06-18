import { COLORS } from "@/consts/colors";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavegacaoProps {
  title?: string;
}

export default function Navegacao({ title }: NavegacaoProps) {
  const pathname = usePathname();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets(); // ← pega as margens seguras do dispositivo
  

  const menuItems = [
    { name: "Início", icon: "home", route: "/(main)/home" },
    { name: "Mercado", icon: "cart", route: "/(main)/marketplace" },
    { name: "Chat", icon: "chatbubbles", route: "/(main)/chat" }, 
    { name: "Perfil", icon: "person", route: "/(main)/perfil" },
  ];

  return (
    <View
      style={[
        styles.navBar,
        {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // ← usa o inset real
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
        },
      ]}
    >
      {menuItems.map((item) => {
        // Usamos === para marcar apenas o item exato como ativo
        const isActive = pathname === item.route;

        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => router.push(item.route as any)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? (item.icon as any) : `${item.icon}-outline`}
              size={22}
              color={isActive ? theme.primary || COLORS.primary : theme.subText}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.primary || COLORS.primary : theme.subText },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tab: { alignItems: "center", justifyContent: "center", flex: 1 },
  label: { fontSize: 9, marginTop: 4, fontWeight: "bold", letterSpacing: 0.5 },
});