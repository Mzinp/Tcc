import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { COLORS } from "@/consts/colors";

export default function Navegacao() {
  const pathname = usePathname();
  const { theme } = useAppTheme();

  // === AGORA SIM: ROTAS EXATAS DA SUA FOTO ===
  const menuItems = [
    { name: "Início", icon: "home", route: "/(main)/(tabs)/home" },
    { name: "Mercado", icon: "cart", route: "/(main)/(tabs)/marketplace" },
    { name: "Chat", icon: "chatbubbles", route: "/(main)/chat" }, 
    { name: "Perfil", icon: "person", route: "/(main)/(tabs)/perfil" },
  ];

  return (
    <View style={[styles.navBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
      {menuItems.map((item) => {
        const isActive = pathname.includes(item.route);
        
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
              color={isActive ? (theme.primary || COLORS.primary) : theme.subText} 
            />
            <Text style={[styles.label, { color: isActive ? (theme.primary || COLORS.primary) : theme.subText }]}>
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
    height: Platform.OS === 'ios' ? 85 : 70, 
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tab: { alignItems: "center", justifyContent: "center", flex: 1 },
  label: { fontSize: 9, marginTop: 4, fontWeight: 'bold', letterSpacing: 0.5 }
});