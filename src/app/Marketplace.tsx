import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navegacao from "@/components/Navegacao";

const SERVICOS = [
  { id: '1', nome: 'Manutenção Elétrica', prestador: 'Luigi (Apto 42)', preco: 'R$ 80,00', cor: '#ff8c00' },
  { id: '2', nome: 'Aulas de Violão', prestador: 'Isabela (Apto 104)', preco: 'R$ 50/h', cor: '#2d79f3' },
  { id: '3', nome: 'Dog Walker', prestador: 'Mateus (Apto 12)', preco: 'R$ 30,00', cor: '#4caf50' },
];

export default function Marketplace() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  // Carrega a preferência de tema toda vez que a tela entra em foco
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema no Marketplace");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    text: isDark ? "#ffffff" : "#0f1111",
    subtitle: isDark ? "#8b8e98" : "#666666",
    border: isDark ? "#252828" : "#dddddd",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Vizzo Marketplace</Text>
        <Text style={[styles.subtitle, { color: theme.subtitle }]}>Serviços prestados por seus vizinhos</Text>
      </View>

      <FlatList
        data={SERVICOS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 25, paddingBottom: 120 }} 
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDark ? 0 : 1 }]}>
            <View style={[styles.iconBox, { backgroundColor: item.cor }]}>
              <Text style={styles.iconText}>{item.nome[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.serviceName, { color: theme.text }]}>{item.nome}</Text>
              <Text style={[styles.provider, { color: theme.subtitle }]}>{item.prestador}</Text>
              <Text style={styles.price}>{item.preco}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.hireBtn}
              activeOpacity={0.7}
              onPress={() => router.push({ 
                pathname: "/Sucesso", 
                params: { mensagem: "O prestador foi notificado e entrará em contato!" } 
              })}
            >
              <Text style={styles.hireBtnText}>Contratar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Navegação fixa no rodapé */}
      <Navegacao />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  card: { 
    padding: 15, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconText: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  info: { flex: 1, marginLeft: 15 },
  serviceName: { fontWeight: 'bold', fontSize: 16 },
  provider: { fontSize: 12 },
  price: { color: '#ff8c00', fontWeight: 'bold', marginTop: 4 },
  hireBtn: { 
    backgroundColor: '#2d79f3', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 10 
  },
  hireBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});