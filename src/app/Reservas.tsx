import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import BotaoVoltar from '@/components/ArrowVoltar';

export default function Reservas() {
  const [isDark, setIsDark] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'user'>('admin');

  // Carrega a preferência de tema
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema em Reservas");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    text: isDark ? "#ffffff" : "#0f1111",
    subtitle: isDark ? "#2d79f3" : "#1e5bb8",
    border: isDark ? "#252828" : "#dddddd",
  };

  const [areas, setAreas] = useState([
    { id: '1', nome: 'Salão de Festas', disponivel: true },
    { id: '2', nome: 'Churrasqueira 01', disponivel: false },
    { id: '3', nome: 'Espaço Gourmet', disponivel: true },
    { id: '4', nome: 'Academia', disponivel: true },
  ]);

  const alternarStatus = (id: string) => {
    if (userType !== 'admin') return;
    setAreas(prev => prev.map(area => 
      area.id === id ? { ...area, disponivel: !area.disponivel } : area
    ));
    Alert.alert("Sucesso", "Status da área atualizado para todos os moradores.");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <BotaoVoltar cor={theme.text} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Áreas de Lazer</Text>
        <Text style={[styles.subtitle, { color: theme.subtitle }]}>
          {userType === 'admin' ? "Painel de Controle do Síndico" : "Consulte a disponibilidade"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {areas.map((area) => (
          <View key={area.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.info}>
              <Text style={[styles.areaName, { color: theme.text }]}>{area.nome}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: area.disponivel ? '#4caf50' : '#f44336' }]} />
                <Text style={[styles.status, { color: area.disponivel ? '#4caf50' : '#f44336' }]}>
                  {area.disponivel ? "Livre para Uso" : "Indisponível / Manutenção"}
                </Text>
              </View>
            </View>

            {userType === 'admin' ? (
              <TouchableOpacity 
                style={[styles.adminBtn, { backgroundColor: area.disponivel ? '#f44336' : '#4caf50' }]} 
                onPress={() => alternarStatus(area.id)}
              >
                <Text style={styles.adminBtnText}>
                  {area.disponivel ? "Bloquear" : "Liberar"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Ionicons 
                name={area.disponivel ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={area.disponivel ? "#4caf50" : "#f44336"} 
              />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Botão de teste ajustado para não poluir visualmente */}
      <TouchableOpacity 
        style={[styles.floatingTest, { backgroundColor: isDark ? '#333' : '#ddd' }]} 
        onPress={() => setUserType(userType === 'admin' ? 'user' : 'admin')}
      >
        <Text style={{ fontSize: 10, color: isDark ? 'white' : 'black', fontWeight: 'bold' }}>
          VER COMO {userType === 'admin' ? 'MORADOR' : 'SÍNDICO'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, marginTop: 10 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  content: { padding: 25, paddingBottom: 100 },
  card: { 
    padding: 20, 
    borderRadius: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  info: { flex: 1 },
  areaName: { fontSize: 16, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  status: { fontSize: 12, fontWeight: '600' },
  adminBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10 },
  adminBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  floatingTest: { 
    position: 'absolute', 
    bottom: 90, // Subi um pouco para não bater na Tab Bar
    right: 20, 
    padding: 12, 
    borderRadius: 25, 
    opacity: 0.8,
    borderWidth: 1,
    borderColor: '#2d79f3'
  }
});