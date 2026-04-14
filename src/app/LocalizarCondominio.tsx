import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import BotaoVoltar from '@/components/ArrowVoltar';

export default function LocalizarCondominio() {
  const [isDark, setIsDark] = useState(true);
  const [busca, setBusca] = useState("");

  // Simulação de condomínios cadastrados no sistema
  const condominios = [
    { id: '1', nome: 'Residencial Sapopemba', endereco: 'Av. Sapopemba, 1200' },
    { id: '2', nome: 'Condomínio Vizzo Park', endereco: 'Rua das Flores, 450' },
    { id: '3', nome: 'Edifício Etec Center', endereco: 'Av. Paulista, 1000' },
    { id: '4', nome: 'Solar das Palmeiras', endereco: 'Rua Belém, 89' },
  ];

  // Filtra a lista conforme o usuário digita
  const listaFiltrada = condominios.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        const salvo = await AsyncStorage.getItem('@vizzo_theme');
        if (salvo !== null) setIsDark(salvo === 'dark');
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#0f1111",
    card: isDark ? "#1a1d1d" : "#ffffff",
    input: isDark ? "#1a1d1d" : "#ffffff",
    border: isDark ? "#353838" : "#dddddd",
    subtitle: isDark ? "#8b8e98" : "#666666",
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <BotaoVoltar cor={theme.text} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Encontrar Condomínio</Text>
        <Text style={[styles.subtitle, { color: theme.subtitle }]}>
          Digite o nome ou endereço do seu prédio
        </Text>
      </View>

      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#2d79f3" style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
          placeholder="Buscar condomínio..."
          placeholderTextColor="#555"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <FlatList
        data={listaFiltrada}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push({
                pathname: "/Cadastro", // Ou para a tela de login/vincular
                params: { condonome: item.nome }
            })}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={24} color="white" />
            </View>
            <View style={styles.info}>
              <Text style={[styles.condoName, { color: theme.text }]}>{item.nome}</Text>
              <Text style={[styles.condoAddress, { color: theme.subtitle }]}>{item.endereco}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2d79f3" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum condomínio encontrado.</Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, marginTop: 10 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 5 },
  searchSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    marginTop: 25 
  },
  searchIcon: { position: 'absolute', left: 40, zIndex: 1 },
  input: { 
    flex: 1, 
    height: 55, 
    borderRadius: 15, 
    paddingLeft: 45, 
    paddingRight: 15, 
    borderWidth: 1 
  },
  list: { padding: 25 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 18, 
    marginBottom: 12, 
    borderWidth: 1,
    elevation: 2 
  },
  iconCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: '#2d79f3', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  info: { flex: 1 },
  condoName: { fontSize: 16, fontWeight: 'bold' },
  condoAddress: { fontSize: 12, marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#8b8e98', marginTop: 20 }
});