import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Navegacao() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState<boolean | null>(null);

  // Sincroniza o tema com o que foi definido na Home
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          // Por padrão true para manter o fundo preto que você quer
          setIsDark(salvo === null ? true : salvo === 'dark');
        } catch (e) {
          setIsDark(true);
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    // Agora usando o #0f1111 para ficar igual à Home
    bg: isDark ? "#0f1111" : "#ffffff",
    border: isDark ? "#252828" : "#f0f0f0",
    inactive: isDark ? "#8b8e98" : "#999999",
    active: "#2d79f3" 
  };

  const menuItems = [
    { name: "Início", icon: "home", route: "/home" },
    { name: "Mercado", icon: "cart", route: "/marketplace" },
    { name: "Chat", icon: "chatbubbles", route: "/mensagens" }, 
    { name: "Perfil", icon: "person", route: "/perfil" }, 
  ];

  if (isDark === null) return null;

  return (
    <View style={[styles.navBar, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
      {menuItems.map((item) => {
        // Verifica se a rota atual é a do item para deixar o ícone aceso
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
    // Altura adaptada para não ficar cortado em Android/iOS
    height: Platform.OS === 'ios' ? 85 : 70, 
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    // Espaçamento extra no iOS por causa da barra de gestos
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tab: { alignItems: "center", justifyContent: "center", flex: 1 },
  label: { fontSize: 9, marginTop: 4, fontWeight: 'bold', letterSpacing: 0.5 }
});