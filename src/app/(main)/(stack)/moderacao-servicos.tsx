import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAppTheme } from "@/context/ThemeContext";
import ArrowBack from "@/components/ArrowVoltar";

export default function ModeracaoServicos() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarPendentes() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: admin } = await supabase
        .from("tb_administrador")
        .select("id_condominio")
        .eq("id_administrador", user.id)
        .single();

      if (!admin?.id_condominio) return;

      const { data } = await supabase
        .from("tb_servico")
        .select(`
          id_servico, nome_servico, valor_estimado, descricao_servico, id_morador, certificado_url, categoria, status_verificacao,
          tb_morador ( nome, num_apartamento, telefone )
        `)
        .eq("id_condominio", admin.id_condominio)
        .eq("status_verificacao", "pendente");

      if (data) {
        const formatados = data.map((s: any) => ({
          id: s.id_servico,
          nome: s.nome_servico,
          valor: s.valor_estimado,
          descricao: s.descricao_servico,
          categoria: s.categoria,
          certificado_url: s.certificado_url,
          morador: s.tb_morador,
          id_morador: s.id_morador
        }));
        setServicos(formatados);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { carregarPendentes(); }, []));

  async function handleAprovar(id_servico: string) {
    const { error } = await supabase
      .from("tb_servico")
      .update({ status_verificacao: "aprovado", status_servico: "Ativo" })
      .eq("id_servico", id_servico);

    if (error) {
      Alert.alert("Erro", "Falha ao aprovar serviço.");
    } else {
      setServicos(prev => prev.filter(s => s.id !== id_servico));
    }
  }

  async function handleRejeitar(id_servico: string) {
    const { error } = await supabase
      .from("tb_servico")
      .update({ status_verificacao: "rejeitado" })
      .eq("id_servico", id_servico);

    if (error) {
      Alert.alert("Erro", "Falha ao rejeitar serviço.");
    } else {
      setServicos(prev => prev.filter(s => s.id !== id_servico));
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.bg === '#000' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.title, { color: theme.text }]}>Moderar Serviços</Text>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={styles.badgeText}>{servicos.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : servicos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="shield-checkmark" size={64} color={theme.subText} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhuma pendência</Text>
          <Text style={[styles.emptyDesc, { color: theme.subText }]}>Todos os serviços foram analisados.</Text>
        </View>
      ) : (
        <FlatList
          data={servicos}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 25 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{item.nome}</Text>
                  {item.certificado_url && (
                    <View style={styles.licenseBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#28B446" />
                      <Text style={styles.licenseText}>LICENCIADO</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.price, { color: theme.primary }]}>R$ {item.valor}</Text>
              </View>
              <Text style={[styles.category, { color: theme.subText }]}>{item.categoria}</Text>
              <Text style={[styles.description, { color: theme.text }]} numberOfLines={2}>{item.descricao}</Text>
              <View style={styles.moradorRow}>
                <Ionicons name="person-outline" size={16} color={theme.subText} />
                <Text style={[styles.moradorText, { color: theme.subText }]}>
                  {item.morador?.nome?.split(" ")[0] || "Vizinho"} (Apto {item.morador?.num_apartamento || "—"})
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btnRejeitar, { borderColor: '#ef4444' }]}
                  onPress={() => handleRejeitar(item.id)}
                >
                  <Ionicons name="close" size={18} color="#ef4444" />
                  <Text style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: 5 }}>Rejeitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnAprovar, { backgroundColor: '#22c55e' }]}
                  onPress={() => handleAprovar(item.id)}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 5 }}>Aprovar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 15,
    gap: 10,
  },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  emptyDesc: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  card: {
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardInfo: { flex: 1, marginRight: 10 },
  serviceName: { fontWeight: 'bold', fontSize: 17 },
  price: { fontWeight: '800', fontSize: 15, marginTop: 2 },
  category: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  moradorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  moradorText: { fontSize: 13 },
  licenseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 3,
  },
  licenseText: { fontSize: 9, fontWeight: 'bold', color: '#28B446' },
  actions: { flexDirection: 'row', gap: 12 },
  btnRejeitar: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  btnAprovar: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
