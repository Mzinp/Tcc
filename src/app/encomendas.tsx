import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ArrowVoltar from '@/components/ArrowVoltar';

const ENCOMENDAS = [
  { id: '1', objeto: 'Pacote Amazon', data: '22/03/2026', status: 'Aguardando Retirada', cor: '#ff8c00' },
  { id: '2', objeto: 'Mercado Livre', data: '20/03/2026', status: 'Retirado', cor: '#8b8e98' },
];

export default function Encomendas() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ArrowVoltar />
        <Text style={styles.title}>Minhas Encomendas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>PACOTES NA PORTARIA</Text>
        
        {ENCOMENDAS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.statusBadge, { backgroundColor: item.cor }]} />
            <View style={styles.info}>
              <Text style={styles.objetoText}>{item.objeto}</Text>
              <Text style={styles.dataText}>Chegou em: {item.data}</Text>
              <Text style={[styles.statusText, { color: item.cor }]}>{item.status}</Text>
            </View>
            <Ionicons name="cube-outline" size={24} color="#353838" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1111' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 15 },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 25 },
  sectionTitle: { color: '#8b8e98', fontSize: 12, fontWeight: 'bold', marginBottom: 20, letterSpacing: 1 },
  card: { backgroundColor: '#1a1d1d', padding: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#252828' },
  statusBadge: { width: 4, height: '100%', borderRadius: 2, marginRight: 15 },
  info: { flex: 1 },
  objetoText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  dataText: { color: '#8b8e98', fontSize: 12, marginVertical: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold' }
});