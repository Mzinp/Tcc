import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';

const ENCOMENDAS = [
  { 
    id: '1', 
    objeto: 'Pacote Amazon', 
    data: '14/04/2026', 
    status: 'Aguardando Retirada', 
    entregue: false, 
    codigo: 'VIZ-9928',
    local: 'Armário A-12'
  },
  { 
    id: '2', 
    objeto: 'Mercado Livre', 
    data: '10/04/2026', 
    status: 'Retirado', 
    entregue: true, 
    codigo: 'VIZ-8850',
    local: 'Portaria Central'
  },
];

export default function Encomendas() {
  const [isDark, setIsDark] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    border: isDark ? COLORS.dark.border : COLORS.light.border,
    accent: COLORS.primary
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topHeader}>
        <ArrowBack cor={theme.text} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: theme.text }]}>Encomendas</Text>
            <Text style={[styles.subtitle, { color: theme.subText }]}>Gerencie seus pacotes recebidos</Text>
        </View>

        {!ENCOMENDAS.every(e => e.entregue) && (
            <View style={styles.alertCard}>
                <Ionicons name="notifications" size={20} color="white" />
                <Text style={styles.alertText}>Você tem pacotes pendentes na portaria.</Text>
            </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.subText }]}>HISTÓRICO RECENTE</Text>
        
        {ENCOMENDAS.map((item) => (
          <TouchableOpacity 
            activeOpacity={0.8}
            key={item.id} 
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.iconBox, { backgroundColor: item.entregue ? theme.border : 'rgba(45, 121, 243, 0.1)' }]}>
              <Ionicons 
                name={item.entregue ? "mail-open-outline" : "cube"} 
                size={24} 
                color={item.entregue ? theme.subText : theme.accent} 
              />
            </View>

            <View style={styles.info}>
              <View style={styles.row}>
                <Text style={[styles.objetoText, { color: theme.text }]}>{item.objeto}</Text>
                <Text style={[styles.codeText, { color: theme.accent }]}>{item.codigo}</Text>
              </View>

              <View style={styles.detailsRow}>
                 <Ionicons name="location-outline" size={12} color={theme.subText} />
                 <Text style={[styles.detailText, { color: theme.subText }]}>{item.local}</Text>
                 <View style={styles.dot} />
                 <Text style={[styles.detailText, { color: theme.subText }]}>{item.data}</Text>
              </View>

              <View style={[
                  styles.statusBadge, 
                  { backgroundColor: item.entregue ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 140, 0, 0.1)' }
                ]}>
                  <View style={[styles.statusDot, { backgroundColor: item.entregue ? COLORS.green : COLORS.orange }]} />
                  <Text style={[styles.statusText, { color: item.entregue ? COLORS.green : COLORS.orange }]}>
                    {item.status}
                  </Text>
              </View>
            </View>

            {!item.entregue && (
                <View style={styles.arrowIcon}>
                    <Ionicons name="chevron-forward" size={20} color={theme.accent} />
                </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.qrButton, { borderColor: theme.accent }]}>
            <Ionicons name="qr-code-outline" size={20} color={theme.accent} />
            <Text style={[styles.qrButtonText, { color: theme.accent }]}>MOSTRAR QR CODE DE RETIRADA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingTop: 60, paddingHorizontal: 15 },
  headerInfo: { paddingHorizontal: 25, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 5 },
  content: { paddingBottom: 50 },
  
  alertCard: { 
    marginHorizontal: 25, 
    backgroundColor: COLORS.primary, 
    padding: 15, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 25
  },
  alertText: { color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 10 },

  sectionTitle: { fontSize: 10, fontWeight: '900', marginBottom: 15, letterSpacing: 2, paddingHorizontal: 25 },
  
  card: { 
    marginHorizontal: 20,
    padding: 15, 
    borderRadius: 22, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconBox: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  objetoText: { fontSize: 16, fontWeight: 'bold' },
  codeText: { fontSize: 10, fontWeight: '800' },
  
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  detailText: { fontSize: 12, marginLeft: 4 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#888', marginHorizontal: 8 },

  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    marginTop: 2
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  
  arrowIcon: { marginLeft: 10 },

  qrButton: { 
    margin: 25, 
    marginTop: 10,
    borderWidth: 2, 
    borderRadius: 15, 
    padding: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderStyle: 'dashed'
  },
  qrButtonText: { fontWeight: 'bold', fontSize: 13, marginLeft: 10 }
});