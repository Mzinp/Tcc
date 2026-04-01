import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotaoVoltar from '@/components/ArrowVoltar';

export default function Reservas() {
  // SIMULAÇÃO DE PERFIL: Mude para 'user' para testar a visão do Morador
  const [userType, setUserType] = useState<'admin' | 'user'>('admin');

  // Estado das áreas (Simulando um banco de dados)
  const [areas, setAreas] = useState([
    { id: '1', nome: 'Salão de Festas', disponivel: true },
    { id: '2', nome: 'Churrasqueira 01', disponivel: false },
    { id: '3', nome: 'Espaço Gourmet', disponivel: true },
    { id: '4', nome: 'Academia', disponivel: true },
  ]);

  // Função exclusiva do Síndico para mudar o status
  const alternarStatus = (id: string) => {
    if (userType !== 'admin') return; // Segurança extra

    setAreas(prev => prev.map(area => 
      area.id === id ? { ...area, disponivel: !area.disponivel } : area
    ));
    
    Alert.alert("Sucesso", "Status da área atualizado para todos os moradores.");
  };

  return (
    <View style={styles.container}>
      <BotaoVoltar cor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Áreas de Lazer</Text>
        <Text style={styles.subtitle}>
          {userType === 'admin' ? "Painel de Controle do Síndico" : "Consulte a disponibilidade"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {areas.map((area) => (
          <View key={area.id} style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.areaName}>{area.nome}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: area.disponivel ? '#4caf50' : '#f44336' }]} />
                <Text style={[styles.status, { color: area.disponivel ? '#4caf50' : '#f44336' }]}>
                  {area.disponivel ? "Livre para Uso" : "Indisponível / Manutenção"}
                </Text>
              </View>
            </View>

            {/* BOTÃO QUE SÓ APARECE PARA O SÍNDICO */}
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
              /* Ícone apenas visual para o morador */
              <Ionicons 
                name={area.disponivel ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={area.disponivel ? "#4caf50" : "#f44336"} 
              />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Dica para você testar no Expo: Um botão flutuante para trocar de perfil rápido */}
      <TouchableOpacity 
        style={styles.floatingTest} 
        onPress={() => setUserType(userType === 'admin' ? 'user' : 'admin')}
      >
        <Text style={{fontSize: 10, color: 'white'}}>TROCAR PERFIL (TESTE)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1111' },
  header: { paddingHorizontal: 25, marginBottom: 10 },
  title: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  subtitle: { color: '#2d79f3', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  content: { padding: 25 },
  card: { 
    backgroundColor: '#1a1d1d', 
    padding: 20, 
    borderRadius: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#252828' 
  },
  info: { flex: 1 },
  areaName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  status: { fontSize: 12, fontWeight: '500' },
  adminBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10 },
  adminBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  floatingTest: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#333', padding: 10, borderRadius: 20, opacity: 0.5 }
});