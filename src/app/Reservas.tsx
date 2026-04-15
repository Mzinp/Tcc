import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import BotaoVoltar from '@/components/ArrowVoltar';

export default function Reservas() {
  const [isDark, setIsDark] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'user'>('admin');

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
    bg: isDark ? "#0f1111" : "#ffffff", // Branco Puro corrigido
    card: isDark ? "#1a1d1d" : "#f9f9f9",
    text: isDark ? "#ffffff" : "#0f1111",
    subtitle: isDark ? "#2d79f3" : "#1e5bb8",
    subText: isDark ? "#a0a0a0" : "#666666",
    border: isDark ? "#252828" : "#eeeeee",
  };

  const [areas, setAreas] = useState([
    { id: '1', nome: 'Salão de Festas', disponivel: true, icon: 'wine' },
    { id: '2', nome: 'Churrasqueira 01', disponivel: false, icon: 'flame' },
    { id: '3', nome: 'Espaço Gourmet', disponivel: true, icon: 'restaurant' },
    { id: '4', nome: 'Academia', disponivel: true, icon: 'barbell' },
  ]);

  const alternarStatus = (id: string) => {
    if (userType !== 'admin') return;
    setAreas(prev => prev.map(area => 
      area.id === id ? { ...area, disponivel: !area.disponivel } : area
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topHeader}>
        <BotaoVoltar cor={theme.text} />
      </View>
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Áreas de Lazer</Text>
        <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: userType === 'admin' ? "#2d79f3" : "#4caf50" }]}>
                <Text style={styles.roleText}>{userType === 'admin' ? "SÍNDICO" : "MORADOR"}</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.subtitle }]}>
              {userType === 'admin' ? "Gestão de Espaços" : "Disponibilidade em tempo real"}
            </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {areas.map((area) => (
          <View key={area.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.iconArea}>
                 <Ionicons name={area.icon as any} size={24} color={area.disponivel ? "#2d79f3" : theme.subText} />
            </View>

            <View style={styles.info}>
              <Text style={[styles.areaName, { color: theme.text }]}>{area.nome}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: area.disponivel ? '#4caf50' : '#f44336' }]} />
                <Text style={[styles.status, { color: area.disponivel ? '#4caf50' : '#f44336' }]}>
                  {area.disponivel ? "Livre para Uso" : "Indisponível"}
                </Text>
              </View>
            </View>

            {userType === 'admin' ? (
              <TouchableOpacity 
                style={[styles.adminBtn, { backgroundColor: area.disponivel ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)' }]} 
                onPress={() => alternarStatus(area.id)}
              >
                <Text style={[styles.adminBtnText, { color: area.disponivel ? '#f44336' : '#4caf50' }]}>
                  {area.disponivel ? "Bloquear" : "Liberar"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                disabled={!area.disponivel}
                style={[styles.reservaBtn, { opacity: area.disponivel ? 1 : 0.3 }]}
              >
                <Text style={styles.reservaBtnText}>RESERVAR</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Seletor de Teste (Switch) */}
      <View style={styles.testSwitcher}>
          <TouchableOpacity 
            style={[styles.floatingTest, { backgroundColor: isDark ? '#1a1d1d' : '#f0f0f0' }]} 
            onPress={() => setUserType(userType === 'admin' ? 'user' : 'admin')}
          >
            <Ionicons name="swap-horizontal" size={16} color="#2d79f3" />
            <Text style={{ fontSize: 10, color: theme.text, fontWeight: 'bold', marginLeft: 8 }}>
               MODO: {userType === 'admin' ? 'SÍNDICO' : 'MORADOR'}
            </Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingTop: 60, paddingHorizontal: 15 },
  header: { paddingHorizontal: 25, marginTop: 15, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  roleText: { color: 'white', fontSize: 10, fontWeight: '900' },
  subtitle: { fontSize: 12, fontWeight: '500' },
  content: { padding: 25, paddingBottom: 120 },
  card: { 
    padding: 15, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  iconArea: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(45, 121, 243, 0.1)', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  areaName: { fontSize: 16, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  status: { fontSize: 11, fontWeight: '700' },
  adminBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  adminBtnText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  reservaBtn: { backgroundColor: '#2d79f3', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  reservaBtnText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  testSwitcher: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  floatingTest: { 
    flexDirection: 'row',
    padding: 15, 
    borderRadius: 30, 
    borderWidth: 1,
    borderColor: '#2d79f3',
    elevation: 5
  }
});