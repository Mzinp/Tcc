import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';
import { supabase } from "@/lib/supabase";

export default function Reservas() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'user'>('user');
  const [areas, setAreas] = useState<any[]>([]);

  // Carrega as áreas reais do banco de dados
  async function carregarDados() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Verifica perfil (Admin ou Morador)
      const { data: admin } = await supabase
        .from('tb_administrador')
        .select('id_administrador')
        .eq('id_administrador', user.id)
        .single();

      setUserType(admin ? 'admin' : 'user');

      // 2. Busca áreas cadastradas na tb_area_comum
      const { data, error } = await supabase
        .from('tb_area_comum')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      setAreas(data || []);

    } catch (error) {
      console.log("Erro ao carregar áreas:", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarDados();
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) { console.log("Erro no tema"); }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subtitle: isDark ? COLORS.primary : "#1e5bb8",
    subText: isDark ? "#a0a0a0" : "#666666",
    border: isDark ? COLORS.dark.border : COLORS.light.border,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topHeader}>
        <ArrowBack cor={theme.text} />
      </View>
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Áreas de Lazer</Text>
        <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: userType === 'admin' ? COLORS.primary : COLORS.green }]}>
                <Text style={styles.roleText}>{userType === 'admin' ? "SÍNDICO" : "MORADOR"}</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.subtitle }]}>
              {userType === 'admin' ? "Gestão de Espaços" : "Disponibilidade em tempo real"}
            </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {areas.length === 0 && (
            <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 20 }}>
              Nenhuma área cadastrada pelo síndico.
            </Text>
          )}

          {areas.map((area) => (
            <View key={area.id_area} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.iconArea}>
                   <Ionicons name={(area.icone || 'wine') as any} size={24} color={COLORS.primary} />
              </View>

              <View style={styles.info}>
                <Text style={[styles.areaName, { color: theme.text }]}>{area.nome}</Text>
                <View style={styles.statusRow}>
                  <Text style={[styles.priceText, { color: theme.subText }]}>
                    Taxa: <Text style={{ color: COLORS.green, fontWeight: 'bold' }}>R$ {area.valor_reserva?.toFixed(2)}</Text>
                  </Text>
                </View>
              </View>

              {userType === 'admin' ? (
                <TouchableOpacity 
                  style={[styles.adminBtn, { backgroundColor: 'rgba(45, 121, 243, 0.1)' }]} 
                  onPress={() => router.push({
                    pathname: "/(main)/(stack)/gestaoarea",
                    params: { 
                      idArea: area.id_area, 
                      nomeArea: area.nome, 
                      valorAtual: area.valor_reserva.toString() 
                    }
                  })}
                >
                  <Text style={[styles.adminBtnText, { color: COLORS.primary }]}>
                    AJUSTAR
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.reservaBtn}
                  onPress={() => router.push({
                    pathname: "/(main)/(stack)/cadastroreserva",
                    params: { areaNome: area.nome, areaId: area.id_area }
                  })}
                >
                  <Text style={styles.reservaBtnText}>RESERVAR</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Botão para Admin Adicionar Nova Área (Opcional para o TCC) */}
      {userType === 'admin' && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => router.push("/(main)/(stack)/gestaoarea")}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}

      <View style={styles.testSwitcher}>
          <TouchableOpacity 
            style={[styles.floatingTest, { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.input }]} 
            onPress={() => setUserType(userType === 'admin' ? 'user' : 'admin')}
          >
            <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
            <Text style={{ fontSize: 10, color: theme.text, fontWeight: 'bold', marginLeft: 8 }}>
                MODO TESTE: {userType === 'admin' ? 'SÍNDICO' : 'MORADOR'}
            </Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingTop: 60, paddingHorizontal: 15 },
  header: { paddingHorizontal: 25, marginTop: 15, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  roleText: { color: 'white', fontSize: 10, fontWeight: '900' },
  subtitle: { fontSize: 12, fontWeight: '500' },
  content: { padding: 25, paddingBottom: 150 },
  card: { padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  iconArea: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(45, 121, 243, 0.1)', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  areaName: { fontSize: 16, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  priceText: { fontSize: 12 },
  adminBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  adminBtnText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  reservaBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  reservaBtnText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 25, bottom: 100, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  testSwitcher: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  floatingTest: { flexDirection: 'row', padding: 15, borderRadius: 30, borderWidth: 1, borderColor: COLORS.primary, elevation: 5 }
});