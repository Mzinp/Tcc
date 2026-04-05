import BotaoVoltar from '@/components/ArrowVoltar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Visitantes() {
  const [isDark, setIsDark] = useState(true);

  // Sincroniza o tema com o AsyncStorage
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema em Visitantes");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#0f1111",
    subtitle: isDark ? "#8b8e98" : "#666666",
    input: isDark ? "#1a1d1d" : "#ffffff",
    border: isDark ? "#353838" : "#dddddd",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <BotaoVoltar cor={theme.text} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Liberar Visitante</Text>
        <Text style={[styles.subtitle, { color: theme.subtitle }]}>Avise a portaria sobre sua visita</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>NOME DO VISITANTE</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]} 
          placeholder="Nome completo" 
          placeholderTextColor="#555" 
        />
        
        <Text style={styles.label}>DOCUMENTO (RG/CPF)</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]} 
          placeholder="000.000.000-00" 
          placeholderTextColor="#555" 
          keyboardType="numeric" 
        />

        <TouchableOpacity 
          style={styles.mainButton}
          activeOpacity={0.8}
          onPress={() => router.push({ 
            pathname: "/Sucesso", 
            params: { mensagem: "A portaria foi notificada e a entrada está autorizada!" } 
          })}
        >
          <Text style={styles.buttonText}>AUTORIZAR ENTRADA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  content: { padding: 25 },
  label: { color: '#ff8c00', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
  },
  mainButton: { 
    backgroundColor: '#2d79f3', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  buttonText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});