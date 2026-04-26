import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';
import { supabase } from "@/lib/supabase"; // Importando o banco

export default function Encomendas() {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [encomendas, setEncomendas] = useState<any[]>([]);

  // Função para carregar as encomendas do Supabase
  async function carregarEncomendas() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Primeiro, descobrimos se o usuário é admin ou morador
      const { data: admin } = await supabase
        .from('tb_administrador')
        .select('id_condominio')
        .eq('id_administrador', user.id)
        .single();

      let query = supabase.from('tb_encomendas').select('*');

      if (admin) {
        // Se for ADM, vê todas do condomínio dele
        query = query.eq('id_condominio', admin.id_condominio);
      } else {
        // Se for morador, busca o ID dele na tb_morador e filtra as encomendas
        const { data: morador } = await supabase
          .from('tb_morador')
          .select('id_morador')
          .eq('id_morador', user.id)
          .single();
        
        if (morador) {
          query = query.eq('id_morador', morador.id_morador);
        }
      }

      const { data, error } = await query.order('data_recebimento', { ascending: false });

      if (error) throw error;
      setEncomendas(data || []);

    } catch (error) {
      console.log("Erro ao carregar encomendas:", error);
      Alert.alert("Erro", "Não foi possível carregar as encomendas.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarEncomendas();
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
            <Text style={[styles.subtitle, { color: theme.subText }]}>Gerencie os pacotes do condomínio</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />
        ) : (
          <>
            {encomendas.some(e => e.status === 'Pendente') && (
                <View style={styles.alertCard}>
                    <Ionicons name="notifications" size={20} color="white" />
                    <Text style={styles.alertText}>Existem pacotes aguardando retirada.</Text>
                </View>
            )}

            <Text style={[styles.sectionTitle, { color: theme.subText }]}>HISTÓRICO RECENTE</Text>
            
            {encomendas.length === 0 ? (
              <Text style={{ textAlign: 'center', color: theme.subText, marginTop: 20 }}>Nenhuma encomenda encontrada.</Text>
            ) : (
              encomendas.map((item) => (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  key={item.id_encomenda} 
                  style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.status === 'Retirado' ? theme.border : 'rgba(45, 121, 243, 0.1)' }]}>
                    <Ionicons 
                      name={item.status === 'Retirado' ? "mail-open-outline" : "cube"} 
                      size={24} 
                      color={item.status === 'Retirado' ? theme.subText : theme.accent} 
                    />
                  </View>

                  <View style={styles.info}>
                    <View style={styles.row}>
                      <Text style={[styles.objetoText, { color: theme.text }]}>{item.descricao}</Text>
                      <Text style={[styles.codeText, { color: theme.accent }]}>{item.codigo_rastreio || 'SEM CÓDIGO'}</Text>
                    </View>

                    <View style={styles.detailsRow}>
                        <Ionicons name="time-outline" size={12} color={theme.subText} />
                        <Text style={[styles.detailText, { color: theme.subText }]}>
                          {new Date(item.data_recebimento).toLocaleDateString('pt-BR')}
                        </Text>
                    </View>

                    <View style={[
                        styles.statusBadge, 
                        { backgroundColor: item.status === 'Retirado' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 140, 0, 0.1)' }
                      ]}>
                        <View style={[styles.statusDot, { backgroundColor: item.status === 'Retirado' ? COLORS.green : COLORS.orange }]} />
                        <Text style={[styles.statusText, { color: item.status === 'Retirado' ? COLORS.green : COLORS.orange }]}>
                          {item.status === 'Retirado' ? 'Retirado' : 'Aguardando Retirada'}
                        </Text>
                    </View>
                  </View>

                  {item.status !== 'Retirado' && (
                      <View style={styles.arrowIcon}>
                          <Ionicons name="chevron-forward" size={20} color={theme.accent} />
                      </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <TouchableOpacity style={[styles.qrButton, { borderColor: theme.accent }]}>
            <Ionicons name="qr-code-outline" size={20} color={theme.accent} />
            <Text style={[styles.qrButtonText, { color: theme.accent }]}>MOSTRAR QR CODE DE RETIRADA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// OS ESTILOS PERMANECEM EXATAMENTE OS MESMOS
const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingTop: 60, paddingHorizontal: 15 },
  headerInfo: { paddingHorizontal: 25, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 5 },
  content: { paddingBottom: 50 },
  alertCard: { marginHorizontal: 25, backgroundColor: COLORS.primary, padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  alertText: { color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 10 },
  sectionTitle: { fontSize: 10, fontWeight: '900', marginBottom: 15, letterSpacing: 2, paddingHorizontal: 25 },
  card: { marginHorizontal: 20, padding: 15, borderRadius: 22, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  iconBox: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  objetoText: { fontSize: 16, fontWeight: 'bold' },
  codeText: { fontSize: 10, fontWeight: '800' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  detailText: { fontSize: 12, marginLeft: 4 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#888', marginHorizontal: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  arrowIcon: { marginLeft: 10 },
  qrButton: { margin: 25, marginTop: 10, borderWidth: 2, borderRadius: 15, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
  qrButtonText: { fontWeight: 'bold', fontSize: 13, marginLeft: 10 }
});