import Navegacao from "@/components/Navegacao";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from "react-native";

export default function Home() {
  const [isDark, setIsDark] = useState(true); 
  const [menuVisible, setMenuVisible] = useState(false); 
  
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema na Home");
        }
      };
      carregarTema();
    }, [])
  );

  const toggleTheme = async () => {
    const novoTema = !isDark;
    setIsDark(novoTema);
    await AsyncStorage.setItem('@vizzo_theme', novoTema ? 'dark' : 'light');
    setMenuVisible(false);
  };

  const theme = {
    // Ajustado para branco puro (#ffffff) no modo claro
    bg: isDark ? "#0f1111" : "#ffffff", 
    card: isDark ? "#1a1d1d" : "#ffffff",
    text: isDark ? "#ffffff" : "#0f1111",
    subtitle: isDark ? "#b0b0b0" : "#666666",
    border: isDark ? "#252828" : "#f0f0f0" // Borda mais suave para o branco
  };

  const SERVICOS_RAPIDOS = [
    { name: "Reservas", icon: "calendar", color: "#ff8c00", route: "/Reservas" },
    { name: "Encomendas", icon: "cube", color: "#2d79f3", route: "/Encomendas" },
    { name: "Visitantes", icon: "people", color: "#4caf50", route: "/Visitantes" },
    { name: "Ocorrências", icon: "warning", color: "#f44336", route: "/Ocorrencias" }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Morador</Text>
          <Text style={[styles.subGreeting, { color: theme.subtitle }]}>O que vamos resolver hoje?</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.menuTrigger} 
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={isDark ? "#ffffff" : "#2d79f3"} />
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuPopUp, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={20} color="#2d79f3" />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </Text>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { setMenuVisible(false); router.push("/Perfil"); }}
            >
              <Ionicons name="person-outline" size={20} color="#2d79f3" />
              <Text style={[styles.menuItemText, { color: theme.text }]}>Configurações</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainCard, { backgroundColor: "#2d79f3" }]}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Assembleia Geral</Text>
            <Text style={styles.cardDesc}>Hoje às 19:00 no Salão de Festas</Text>
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.cardButton}
              onPress={() => router.push({
                pathname: "/Sucesso",
                params: { mensagem: "Presença confirmada na Assembleia!" }
              })}
            >
              <Text style={styles.cardButtonText}>Confirmar Presença</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="notifications" size={50} color="rgba(255,255,255,0.3)" />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Serviços Rápidos</Text>
        
        <View style={styles.grid}>
          {SERVICOS_RAPIDOS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              activeOpacity={0.8}
              onPress={() => router.push(item.route as any)}
              style={[
                styles.gridItem, 
                { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={[styles.gridText, { color: theme.text }]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Navegacao />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 25, 
    paddingTop: 60, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#2d79f3' },
  subGreeting: { fontSize: 14 },
  menuTrigger: { padding: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }, // Overlay mais suave
  menuPopUp: { 
    position: 'absolute', 
    top: 60, 
    right: 25, 
    width: 180, 
    borderRadius: 15, 
    padding: 10, 
    borderWidth: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 10 
  },
  menuItemText: { marginLeft: 12, fontSize: 14, fontWeight: '600' },
  menuDivider: { height: 1, width: '90%', alignSelf: 'center' },
  content: { padding: 25 },
  mainCard: { 
    padding: 20, 
    borderRadius: 25, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 35,
    elevation: 8,
  },
  cardInfo: { flex: 1 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cardDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginVertical: 10 },
  cardButton: { 
    backgroundColor: 'white', 
    paddingVertical: 10, 
    paddingHorizontal: 18, 
    borderRadius: 10, 
    alignSelf: 'flex-start',
    marginTop: 5
  },
  cardButtonText: { color: '#2d79f3', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, letterSpacing: 0.5 },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  gridItem: { 
    width: '47%', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginBottom: 18, 
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(139, 142, 152, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  gridText: { fontWeight: '700', fontSize: 14 }
});