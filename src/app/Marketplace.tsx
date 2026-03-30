import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";

const SERVICOS = [
  { id: '1', nome: 'Manutenção Elétrica', prestador: 'Luigi (Apto 42)', preco: 'R$ 80,00', cor: '#ff8c00' },
  { id: '2', nome: 'Aulas de Violão', prestador: 'Isabela (Apto 104)', preco: 'R$ 50/h', cor: '#2d79f3' },
  { id: '3', nome: 'Dog Walker', prestador: 'Mateus (Apto 12)', preco: 'R$ 30,00', cor: '#4caf50' },
];

export default function Marketplace() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vizzo Marketplace</Text>
        <Text style={styles.subtitle}>Serviços prestados por seus vizinhos</Text>
      </View>

      <FlatList
        data={SERVICOS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 25 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: item.cor }]}>
              <Text style={styles.iconText}>{item.nome[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.serviceName}>{item.nome}</Text>
              <Text style={styles.provider}>{item.prestador}</Text>
              <Text style={styles.price}>{item.preco}</Text>
            </View>
            <TouchableOpacity style={styles.hireBtn}>
              <Text style={styles.hireBtnText}>Contratar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1111' },
  header: { padding: 25, paddingTop: 60 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#8b8e98', fontSize: 14 },
  card: { backgroundColor: '#1a1d1d', padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconText: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  info: { flex: 1, marginLeft: 15 },
  serviceName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  provider: { color: '#8b8e98', fontSize: 12 },
  price: { color: '#ff8c00', fontWeight: 'bold', marginTop: 4 },
  hireBtn: { backgroundColor: '#2d79f3', padding: 10, borderRadius: 8 },
  hireBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});