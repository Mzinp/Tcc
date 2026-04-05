import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import BotaoVoltar from '@/components/ArrowVoltar'; // Ajustado para o nome padrão do seu componente

const ENCOMENDAS = [
  { id: '1', objeto: 'Pacote Amazon', data: '22/03/2026', status: 'Aguardando Retirada', cor: '#ff8c00' },
  { id: '2', objeto: 'Mercado Livre', data: '20/03/2026', status: 'Retirado', cor: '#8b8e98' },
];

export default function Encomendas() {
  const [isDark, setIsDark] = useState(true);

  // Carrega a preferência salva no Cadastro sempre que a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) {
            setIsDark(salvo === 'dark');
          }
        } catch (e) {
          console.log("Erro ao carregar tema");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    text: isDark ? "#ffffff" : "#0f1111",
    subText: isDark ? "#8b8e98" : "#666666",
    border: isDark ? "#252828" : "#dddddd",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        {/* O botão voltar agora recebe a cor dinâmica baseada no tema */}
        <BotaoVoltar cor={theme.text} />
        <Text style={[styles.title, { color: theme.text }]}>Minhas Encomendas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.subText }]}>PACOTES NA PORTARIA</Text>
        
        {ENCOMENDAS.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statusBadge, { backgroundColor: item.cor }]} />
            <View style={styles.info}>
              <Text style={[styles.objetoText, { color: theme.text }]}>{item.objeto}</Text>
              <Text style={[styles.dataText, { color: theme.subText }]}>Chegou em: {item.data}</Text>
              <Text style={[styles.statusText, { color: item.cor }]}>{item.status}</Text>
            </View>
            <Ionicons name="cube-outline" size={24} color={isDark ? "#353838" : "#ccc"} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 25 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 20, letterSpacing: 1 },
  card: { 
    padding: 20, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 1 
  },
  statusBadge: { width: 4, height: '100%', borderRadius: 2, marginRight: 15 },
  info: { flex: 1 },
  objetoText: { fontSize: 16, fontWeight: 'bold' },
  dataText: { fontSize: 12, marginVertical: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold' }
});