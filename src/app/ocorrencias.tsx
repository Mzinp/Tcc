import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import BotaoVoltar from '@/components/ArrowVoltar';

export default function Ocorrencias() {
  return (
    <View style={styles.container}>
      <BotaoVoltar cor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.title}>Registrar Ocorrência</Text>
        <Text style={styles.subtitle}>Relate problemas no condomínio</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>ASSUNTO</Text>
        <TextInput style={styles.input} placeholder="Ex: Barulho, Limpeza, etc." placeholderTextColor="#555" />

        <Text style={styles.label}>DESCRIÇÃO</Text>
        <TextInput 
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
          multiline 
          placeholder="Descreva o ocorrido em detalhes..." 
          placeholderTextColor="#555" 
        />

        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.buttonText}>ENVIAR AO SÍNDICO</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1111' },
  header: { paddingHorizontal: 25 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#8b8e98', fontSize: 14 },
  content: { padding: 25 },
  label: { color: '#f44336', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#1a1d1d', borderRadius: 12, padding: 15, color: 'white', marginBottom: 20, borderWidth: 1, borderColor: '#353838' },
  mainButton: { backgroundColor: '#f44336', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});