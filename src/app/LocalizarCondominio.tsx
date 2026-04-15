import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BotaoVoltar from "@/components/ArrowVoltar";

// Dados simulados para o seu TCC
const CONDOMINIOS = [
  { id: '1', nome: 'Residencial Solar das Flores', cidade: 'São Paulo, SP', endereco: 'Rua das Palmeiras, 120', imagem: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=100&q=80' },
  { id: '2', nome: 'Edifício Horizonte Azul', cidade: 'Santo André, SP', endereco: 'Av. Portugal, 450', imagem: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=100&q=80' },
  { id: '3', nome: 'Vila Real Premium', cidade: 'São Bernardo, SP', endereco: 'Rua Jurubatuba, 88', imagem: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=100&q=80' },
  { id: '4', nome: 'Condomínio Parque das Águas', cidade: 'São Caetano, SP', endereco: 'Rua Goiás, 300', imagem: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80' },
];

export default function LocalizarCondominio() {
  const [isDark, setIsDark] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Filtra a lista conforme o usuário digita
  const listaFiltrada = CONDOMINIOS.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.cidade.toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {
    const carregarTema = async () => {
      const salvo = await AsyncStorage.getItem('@vizzo_theme');
      if (salvo !== null) setIsDark(salvo === 'dark');
    };
    carregarTema();
  }, []);

  const theme = {
    bg: isDark ? "#0f1111" : "#ffffff",
    card: isDark ? "#1a1d1d" : "#f9f9f9",
    text: isDark ? "#ffffff" : "#0f1111",
    subText: isDark ? "#8b8e98" : "#666666",
    input: isDark ? "#252828" : "#f0f0f0",
    border: isDark ? "#252828" : "#eeeeee"
  };

const selecionarCondominio = (nome: string) => {
  router.push({
    pathname: "/Cadastro",
    params: { condonome: nome }
  });
};

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <BotaoVoltar cor={theme.text} />
        <Text style={[styles.title, { color: theme.text }]}>Localizar Condomínio</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.input }]}>
          <Ionicons name="search" size={20} color={theme.subText} />
          <TextInput 
            style={[styles.input, { color: theme.text }]}
            placeholder="Nome ou cidade do condomínio..."
            placeholderTextColor={theme.subText}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      <FlatList
        data={listaFiltrada}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.condoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => selecionarCondominio(item.nome)}
          >
            <Image source={{ uri: item.imagem }} style={styles.condoImage} />
            <View style={styles.condoInfo}>
              <Text style={[styles.condoName, { color: theme.text }]}>{item.nome}</Text>
              <Text style={[styles.condoCity, { color: "#2d79f3" }]}>{item.cidade}</Text>
              <Text style={[styles.condoAddr, { color: theme.subText }]}>{item.endereco}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={60} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.subText }]}>Nenhum condomínio encontrado.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  searchContainer: { padding: 25 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    borderRadius: 15, 
    height: 55 
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  list: { paddingHorizontal: 25, paddingBottom: 50 },
  condoCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 15, 
    borderWidth: 1 
  },
  condoImage: { width: 60, height: 60, borderRadius: 12 },
  condoInfo: { flex: 1, marginLeft: 15 },
  condoName: { fontSize: 16, fontWeight: 'bold' },
  condoCity: { fontSize: 12, fontWeight: 'bold', marginVertical: 2 },
  condoAddr: { fontSize: 11 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 15, fontSize: 14 }
});