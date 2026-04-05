import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import Navegacao from "@/components/Navegacao";

export default function Perfil() {
  const [isDark, setIsDark] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema no Perfil");
        }
      };
      carregarTema();
    }, [])
  );

  const handleLogout = async () => {
    // Opcional: Limpar o tema ao sair ou apenas deslogar
    // await AsyncStorage.removeItem('@vizzo_theme'); 
    router.replace("/");
  };

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#0f1111",
    subText: isDark ? "#8b8e98" : "#666666",
    border: isDark ? "#1a1d1d" : "#e0e0e0",
    card: isDark ? "#1a1d1d" : "#ffffff",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.avatarBorder, { borderColor: "#2d79f3" }]}>
            <Image source={{ uri: 'https://github.com/gustavosilva.png' }} style={styles.avatar} />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>Gustavo Silva</Text>
          <Text style={[styles.userInfo, { color: theme.subText }]}>Bloco A - Apto 52</Text>
        </View>

        <View style={styles.menu}>
          {[
            { icon: 'person-outline', label: 'Meus Dados' },
            { icon: 'notifications-outline', label: 'Notificações' },
            { icon: 'shield-checkmark-outline', label: 'Privacidade' },
            { icon: 'help-circle-outline', label: 'Ajuda e Suporte' },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuItem, { borderBottomColor: theme.border }]} 
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={22} color="#ff8c00" />
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#353838" : "#ccc"} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.logoutBtn} 
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Navegacao />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 150 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  avatarBorder: { padding: 4, borderRadius: 60, borderWidth: 2 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  userInfo: { fontSize: 14 },
  menu: { paddingHorizontal: 25 },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18, 
    borderBottomWidth: 1 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16 },
  logoutBtn: { marginTop: 40, alignItems: 'center', paddingBottom: 20 },
  logoutText: { color: '#f44336', fontWeight: 'bold', letterSpacing: 1 }
});