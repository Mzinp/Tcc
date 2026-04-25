import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "@/consts/colors";

export default function Navegacao() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          setIsDark(salvo === null ? true : salvo === 'dark');
        } catch (e) {
          setIsDark(true);
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? COLORS.dark.card : "#ffffff",
    border: isDark ? COLORS.dark.border : "#f0f0f0",
    inactive: isDark ? COLORS.dark.subText : "#999999",
    active: COLORS.primary 
  };

  const menuItems = [
    { name: "Início", icon: "home", route: "/(main)/(tabs)/home" },
    { name: "Mercado", icon: "cart", route: "/(main)/(tabs)/marketplace" },
    { name: "Chat", icon: "chatbubbles", route: "/(main)/(tabs)/mensagens" },
    { name: "Perfil", icon: "person", route: "/(main)/(tabs)/perfil" }, 
  ];

  if (isDark === null) return null;

  return (
    <View style={[styles.navBar, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
      {menuItems.map((item) => {
        const isActive = pathname.includes(item.route.split('/').pop() || '');
        
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
              color={isActive ? theme.active : theme.inactive} 
            />
            <Text style={[styles.label, { color: isActive ? theme.active : theme.inactive }]}>
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
    height: 70,
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: 10,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tab: { alignItems: "center", justifyContent: "center", flex: 1 },
  label: { fontSize: 9, marginTop: 4, fontWeight: 'bold', letterSpacing: 0.5 }
});