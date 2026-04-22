import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Navegacao() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState<boolean | null>(null); // null evita o flash de cor errada

  // Sincroniza o tema da barra
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
    bg: isDark ? "#1a1d1d" : "#ffffff",
    border: isDark ? "#252828" : "#f0f0f0",
    inactive: isDark ? "#8b8e98" : "#999999",
    active: "#2d79f3" 
  };

  // Novo item "Chat" adicionado
  const menuItems = [
    { name: "Início", icon: "home", route: "/home" },
    { name: "Mercado", icon: "cart", route: "/Marketplace" },
    { name: "Chat", icon: "chatbubbles", route: "/Mensagens" }, // Nova Rota
    { name: "Perfil", icon: "person", route: "/Perfil" }, 
  ];

  // Se o tema ainda não carregou, não renderiza para não dar "lag" visual
  if (isDark === null) return null;

  return (
    <View style={[styles.navBar, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
      {menuItems.map((item) => {
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
    height: 70, // Reduzi um pouco para ficar mais elegante com 4 itens
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