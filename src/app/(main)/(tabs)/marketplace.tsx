import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navegacao from "@/components/Navegacao";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";

const SERVICOS = [
  { id: '1', nome: 'Manutenção Elétrica', prestador: 'Luigi (Apto 42)', preco: 'R$ 80,00', cor: COLORS.orange, status: 'Ativo' },
  { id: '2', nome: 'Aulas de Violão', prestador: 'Isabela (Apto 104)', preco: 'R$ 50/h', cor: COLORS.primary, status: 'Ativo' },
  { id: '3', nome: 'Dog Walker', prestador: 'Mateus (Apto 12)', preco: 'R$ 30,00', cor: COLORS.green, status: 'Ativo' },
];

export default function Marketplace() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('comprar');

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro no Marketplace");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? COLORS.dark.bg : "#f5f5f5",
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subtitle: isDark ? COLORS.dark.subText : "#666666",
    border: isDark ? COLORS.dark.border : "#dddddd",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Vizzo Marketplace</Text>
        
        <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={[styles.tab, abaAtiva === 'comprar' && styles.tabAtiva]} 
            onPress={() => setAbaAtiva('comprar')}
          >
            <Text style={[styles.tabText, { color: abaAtiva === 'comprar' ? COLORS.primary : theme.subtitle }]}>CONTRATAR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, abaAtiva === 'vender' && styles.tabAtiva]} 
            onPress={() => setAbaAtiva('vender')}
          >
            <Text style={[styles.tabText, { color: abaAtiva === 'vender' ? COLORS.primary : theme.subtitle }]}>MEUS SERVIÇOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {abaAtiva === 'comprar' ? (
        <FlatList
          data={SERVICOS}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 25, paddingBottom: 120 }} 
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDark ? 0 : 1 }]}>
              <View style={[styles.iconBox, { backgroundColor: item.cor }]}>
                <Ionicons name="construct" size={24} color="white" />
              </View>
              <View style={styles.info}>
                <Text style={[styles.serviceName, { color: theme.text }]}>{item.nome}</Text>
                <Text style={[styles.provider, { color: theme.subtitle }]}>{item.prestador}</Text>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.green} />
                  <Text style={styles.badgeText}>DISPONÍVEL</Text>
                </View>
                <Text style={styles.price}>{item.preco}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.hireBtn}
                onPress={() => router.push({ 
                  pathname: "/(main)/(modal)/sucesso", 
                  params: { mensagem: "O vizinho foi avisado! Ele entrará em contato pelo chat." } 
                })}
              >
                <Text style={styles.hireBtnText}>Pedir</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={80} color={theme.border} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Você ainda não oferece serviços</Text>
          <Text style={[styles.emptySub, { color: theme.subtitle }]}>Compartilhe seus talentos com o condomínio!</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => router.push("/(main)/(stack)/novo-servico")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Navegacao />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 60, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  tabBar: { flexDirection: 'row', borderRadius: 12, padding: 5, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabAtiva: { backgroundColor: 'rgba(45, 121, 243, 0.1)' },
  tabText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  card: { 
    padding: 18, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  serviceName: { fontWeight: 'bold', fontSize: 16 },
  provider: { fontSize: 12, marginBottom: 5 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginBottom: 5 },
  badgeText: { color: COLORS.green, fontSize: 9, fontWeight: 'bold', marginLeft: 4 },
  price: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
  hireBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  hireBtnText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  fab: { 
    position: 'absolute', 
    bottom: 100, 
    right: 25, 
    backgroundColor: COLORS.orange,
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 10 },
});