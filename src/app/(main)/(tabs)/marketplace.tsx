import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAppTheme } from "@/context/ThemeContext";

export default function Marketplace() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [abaAtiva, setAbaAtiva] = useState('comprar');
  const [servicos, setServicos] = useState<any[]>([]);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregarServicos() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMeuId(user.id);

      // Adicionado certificado_url na busca
      const { data } = await supabase.from("tb_servico").select(`
          id_servico, nome_servico, valor_estimado, descricao_servico, id_morador, certificado_url,
          tb_morador ( nome, num_apartamento, telefone )
        `);

      if (data) {
        const formatados = data.map((s: any) => ({
          id: s.id_servico?.toString() || Math.random().toString(),
          nome: s.nome_servico,
          prestador: s.tb_morador ? `${s.tb_morador.nome.split(" ")[0]} (Apto ${s.tb_morador.num_apartamento})` : "Vizinho",
          preco: `R$ ${s.valor_estimado}`,
          id_morador: s.id_morador,
          descricao: s.descricao_servico,
          telefone: s.tb_morador?.telefone,
          certificado_url: s.certificado_url // Passando o campo para verificar o selo
        }));
        setServicos(formatados);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  }

  useFocusEffect(useCallback(() => { carregarServicos(); }, []));

  const dadosAtuais = abaAtiva === 'comprar' ? servicos : servicos.filter(s => s.id_morador === meuId);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Marketplace</Text>
        <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={[styles.tab, abaAtiva === 'comprar' && { backgroundColor: theme.border }]} onPress={() => setAbaAtiva('comprar')}>
            <Text style={{ color: abaAtiva === 'comprar' ? theme.primary : theme.subText, fontWeight: '900' }}>CONTRATAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, abaAtiva === 'vender' && { backgroundColor: theme.border }]} onPress={() => setAbaAtiva('vender')}>
            <Text style={{ color: abaAtiva === 'vender' ? theme.primary : theme.subText, fontWeight: '900' }}>MEUS ANÚNCIOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color={theme.primary} /> : (
        <FlatList
          data={dadosAtuais}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 25 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: "/(main)/(stack)/detalhe-servico", params: { ...item } })}
            >
              <View style={styles.info}>
                <Text style={[styles.serviceName, { color: theme.text }]}>{item.nome}</Text>
                
                {/* Exibição do Selo de Licenciamento */}
                {item.certificado_url && (
                  <View style={styles.badge}>
                    <Ionicons name="shield-checkmark" size={12} color="#28B446" />
                    <Text style={styles.badgeText}>LICENCIADO</Text>
                  </View>
                )}

                <Text style={{ color: theme.subText }}>{item.prestador}</Text>
                <Text style={[styles.price, { color: theme.primary }]}>{item.preco}</Text>
              </View>
              <View style={[styles.hireBtn, { backgroundColor: theme.primary }]}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{abaAtiva === 'comprar' ? 'Pedir' : 'Ver'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => router.push("/(main)/(stack)/novo-servico")}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 65, paddingBottom: 15 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 25 },
  tabBar: { flexDirection: 'row', borderRadius: 18, padding: 5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14 },
  card: { padding: 18, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1 },
  info: { flex: 1, marginLeft: 15 },
  serviceName: { fontWeight: 'bold', fontSize: 17 },
  price: { fontWeight: '800', marginTop: 5 },
  hireBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  fab: { position: 'absolute', bottom: 35, right: 25, width: 65, height: 65, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start', marginTop: 4 },
  badgeText: { fontSize: 9, fontWeight: 'bold', color: '#28B446', marginLeft: 3 }
});