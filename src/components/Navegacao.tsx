import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Navegacao() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);

  // Sincroniza o tema da barra com a preferência do usuário
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema na Navegação");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? "#1a1d1d" : "#ffffff",
    border: isDark ? "#252828" : "#e0e0e0",
    inactive: isDark ? "#8b8e98" : "#999999",
    active: "#2d79f3" // Azul padrão do Vizzo
  };

  const menuItems = [
    { name: "Início", icon: "home", route: "/home" },
    { name: "Mercado", icon: "cart", route: "/Marketplace" },
    { name: "Perfil", icon: "perfil" as any, route: "/Perfil" }, 
  ];

  return (
    <View style={[styles.navBar, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
      {menuItems.map((item) => {
        // Correção para o ícone de perfil que no Ionicons é 'person'
        const iconName = item.name === "Perfil" ? "person" : item.icon;
        const isActive = pathname === item.route;
        
        return (
          <TouchableOpacity 
            key={item.route} 
            onPress={() => router.push(item.route as any)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isActive ? (iconName as any) : `${iconName}-outline`} 
              size={24} 
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
    height: 75,
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: 15, // Espaço extra para o "respiro" do design
    elevation: 15, // Sombra no Android
    shadowColor: "#000", // Sombra no iOS
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tab: { alignItems: "center", justifyContent: "center", flex: 1 },
  label: { fontSize: 10, marginTop: 4, fontWeight: 'bold' }
});