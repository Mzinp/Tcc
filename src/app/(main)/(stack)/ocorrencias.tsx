import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';
import { supabase } from "@/lib/supabase";

export default function Ocorrencias() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  async function carregarDados() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Verifica se é Admin para filtrar a busca
      const { data: admin } = await supabase
        .from('tb_administrador')
        .select('id_condominio')
        .eq('id_administrador', user.id)
        .single();

      setIsAdmin(!!admin);

      // 2. Busca ocorrências com join na tabela de morador para exibir o nome
      let query = supabase.from('tb_ocorrencias').select(`
        *,
        tb_morador(nome, num_apartamento)
      `);

      if (admin) {
        query = query.eq('id_condominio', admin.id_condominio);
      } else {
        query = query.eq('id_morador', user.id);
      }

      const { data, error } = await query.order('data_criacao', { ascending: false });
      
      if (error) throw error;
      setOcorrencias(data || []);

    } catch (error) {
      console.log("Erro ao carregar ocorrências:", error);
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
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    border: isDark ? COLORS.dark.border : COLORS.light.border
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Ocorrências</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={[styles.title, { color: theme.text }]}>
            {isAdmin ? "Chamados do Prédio" : "Meus Relatos"}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            {isAdmin ? "Gerencie os incidentes reportados" : "Histórico de suas solicitações"}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.red} style={{ marginTop: 30 }} />
        ) : (
          <>
            {ocorrencias.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.subText }]}>Nenhuma ocorrência registrada.</Text>
            ) : (
              ocorrencias.map((item) => (
                <View key={item.id_ocorrencia} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Resolvido' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 68, 68, 0.1)' }]}>
                      <Text style={[styles.statusText, { color: item.status === 'Resolvido' ? COLORS.green : COLORS.red }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(item.data_criacao).toLocaleDateString('pt-BR')}</Text>
                  </View>

                  <Text style={[styles.itemTitle, { color: theme.text }]}>{item.titulo}</Text>
                  <Text style={[styles.itemDesc, { color: theme.subText }]}>{item.descricao}</Text>
                  
                  {isAdmin && (
                    <View style={styles.adminFooter}>
                      <Ionicons name="person-circle-outline" size={14} color={theme.subText} />
                      <Text style={styles.moradorInfo}>
                        {item.tb_morador?.nome} — Ap: {item.tb_morador?.num_apartamento}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão Flutuante para o Morador criar nova ocorrência */}
      {!isAdmin && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => router.push("/(main)/(stack)/cadastroocorrencias")}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 25 },
  infoBox: { marginBottom: 25 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 14 },
  card: { padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 15, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  dateText: { fontSize: 11, color: '#888' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  itemDesc: { fontSize: 13, lineHeight: 18 },
  adminFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(139, 142, 152, 0.2)' },
  moradorInfo: { fontSize: 12, color: '#888', marginLeft: 5 },
  fab: { position: 'absolute', right: 25, bottom: 30, width: 65, height: 65, borderRadius: 32.5, backgroundColor: COLORS.red, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: COLORS.red, shadowOpacity: 0.3, shadowRadius: 10 }
});