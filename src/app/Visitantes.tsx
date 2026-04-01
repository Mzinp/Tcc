import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import BotaoVoltar from '@/components/ArrowVoltar';

export default function Visitantes() {
  return (
    <View style={styles.container}>
      <BotaoVoltar cor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.title}>Liberar Visitante</Text>
        <Text style={styles.subtitle}>Avise a portaria sobre sua visita</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>NOME DO VISITANTE</Text>
        <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#555" />
        
        <Text style={styles.label}>DOCUMENTO (RG/CPF)</Text>
        <TextInput style={styles.input} placeholder="000.000.000-00" placeholderTextColor="#555" keyboardType="numeric" />

        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.buttonText}>AUTORIZAR ENTRADA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1111' },
  header: { paddingHorizontal: 25 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#8b8e98', fontSize: 14 },
  content: { padding: 25 },
  label: { color: '#ff8c00', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#1a1d1d', borderRadius: 12, padding: 15, color: 'white', marginBottom: 20, borderWidth: 1, borderColor: '#353838' },
  mainButton: { backgroundColor: '#2d79f3', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});