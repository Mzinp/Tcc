import Navegacao from "@/components/Navegacao";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const [isDark, setIsDark] = useState(true); 
  
  // Carrega a preferência de tema do armazenamento local
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

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    text: isDark ? "#ffffff" : "#0f1111",
    subtitle: isDark ? "#b0b0b0" : "#666666",
    border: isDark ? "#252828" : "#e0e0e0"
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
        <Image 
          source={require("../assets/img/logo.png")} 
          style={{ width: 40, height: 40 }} 
          resizeMode="contain" 
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card de Destaque atualizado para usar a tela de Sucesso */}
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
  content: { padding: 25 },
  mainCard: { 
    padding: 20, 
    borderRadius: 25, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 35,
    elevation: 8,
    shadowColor: "#2d79f3",
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(139, 142, 152, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  gridText: { fontWeight: '700', fontSize: 14 }
});