import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navegacao from "@/components/Navegacao";
export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    text: isDark ? "#ffffff" : "#0f1111",
    subtitle: isDark ? "#b0b0b0" : "#666666"
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header Estilo App Educacional */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Gustavo Silva</Text>
          <Text style={styles.subGreeting}>O que vamos resolver hoje?</Text>
        </View>
        <TouchableOpacity onPress={() => setIsDark(!isDark)}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={28} color="#ff8c00" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card de Destaque: Mural de Avisos */}
        <View style={[styles.mainCard, { backgroundColor: "#2d79f3" }]}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Assembleia Geral</Text>
            <Text style={styles.cardDesc}>Hoje às 19:00 no Salão de Festas</Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Confirmar Presença</Text>
            </TouchableOpacity>
          </View>
          <Image source={require("../assets/img/logo.png")} style={styles.miniLogo} resizeMode="contain" />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Serviços Rápidos</Text>
        
        {/* Grid de Ações */}
        <View style={styles.grid}>
          {[
            { name: "Reservas", icon: "calendar", color: "#ff8c00" },
            { name: "Encomendas", icon: "cube", color: "#2d79f3" },
            { name: "Visitantes", icon: "people", color: "#4caf50" },
            { name: "Ocorrências", icon: "warning", color: "#f44336" }
          ].map((item, index) => (
            <TouchableOpacity key={index} style={[styles.gridItem, { backgroundColor: theme.card }]}>
              <Ionicons name={item.icon as any} size={30} color={item.color} />
              <Text style={[styles.gridText, { color: theme.text }]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
          <Navegacao/>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#2d79f3' },
  subGreeting: { fontSize: 14, color: '#8b8e98' },
  content: { padding: 25 },
  mainCard: { padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  cardInfo: { flex: 1 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cardDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginVertical: 8 },
  cardButton: { backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, alignSelf: 'flex-start' },
  cardButtonText: { color: '#2d79f3', fontWeight: 'bold', fontSize: 12 },
  miniLogo: { width: 60, height: 60, opacity: 0.5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '47%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15, elevation: 3 },
  gridText: { marginTop: 10, fontWeight: '600', fontSize: 14 }
});