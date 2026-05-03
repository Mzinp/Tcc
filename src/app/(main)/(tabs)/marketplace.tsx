import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

const THEME_COLORS = {
  primary: "#2d79f3",
  darkBg: "#0f1111",
  darkCard: "#1a1d1d",
  darkBorder: "#252828"
};

export default function Marketplace() {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState('comprar');
  
  const [servicos, setServicos] = useState<any[]>([]);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const theme = {
    bg: THEME_COLORS.darkBg,
    card: THEME_COLORS.darkCard,
    text: "#ffffff",
    subtitle: "#8b8e98",
    border: THEME_COLORS.darkBorder,
    accent: THEME_COLORS.primary
  };

  async function carregarServicos() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      setMeuId(user.id);

      // BUSCA ATUALIZADA: Agora pegamos descrição e telefone para o WhatsApp funcionar
      const { data, error } = await supabase
        .from("tb_servico")
        .select(`
          id_servico,
          nome_servico,
          valor_estimado,
          descricao_servico,
          id_morador,
          tb_morador (
            nome,
            num_apartamento,
            telefone
          )
        `);

      if (data) {
        const formatados = data.map((s: any) => ({
          id: s.id_servico?.toString() || Math.random().toString(),
          nome: s.nome_servico || "Serviço",
          prestador: s.tb_morador 
            ? `${s.tb_morador.nome.split(" ")[0]} (Apto ${s.tb_morador.num_apartamento || 'N/A'})` 
            : "Vizinho",
          preco: `R$ ${s.valor_estimado || '0,00'}`,
          icon: "construct-outline",
          id_morador: s.id_morador,
          descricao: s.descricao_servico, // Passando a descrição para a próxima tela
          telefone: s.tb_morador?.telefone // Passando o telefone para o WhatsApp
        }));
        
        setServicos(formatados);
      } else if (error) {
        console.log("Erro ao buscar serviços:", error);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarServicos();
    }, [])
  );

  const servicosParaComprar = servicos; 
  const meusAnuncios = servicos.filter(s => s.id_morador === meuId);
  const dadosAtuais = abaAtiva === 'comprar' ? servicosParaComprar : meusAnuncios;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Marketplace</Text>
        
        <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={[styles.tab, abaAtiva === 'comprar' && { backgroundColor: theme.border }]} 
            onPress={() => setAbaAtiva('comprar')}
          >
            <Text style={[styles.tabText, { color: abaAtiva === 'comprar' ? theme.accent : theme.subtitle }]}>CONTRATAR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, abaAtiva === 'vender' && { backgroundColor: theme.border }]} 
            onPress={() => setAbaAtiva('vender')}
          >
            <Text style={[styles.tabText, { color: abaAtiva === 'vender' ? theme.accent : theme.subtitle }]}>MEUS ANÚNCIOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : dadosAtuais.length > 0 ? (
        <FlatList
          data={dadosAtuais}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 25, paddingBottom: 150 }} 
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              // FUNÇÃO DE CLIQUE NO CARD ADICIONADA AQUI
              onPress={() => router.push({
                pathname: "/(main)/(stack)/detalhe-servico",
                params: {
                  id: item.id,
                  nome: item.nome,
                  prestador: item.prestador,
                  preco: item.preco,
                  descricao: item.descricao,
                  telefone: item.telefone,
                  id_morador: item.id_morador
                }
              })}
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
                <Ionicons name={item.icon as any} size={24} color={theme.accent} />
              </View>
              
              <View style={styles.info}>
                <Text style={[styles.serviceName, { color: theme.text }]}>{item.nome}</Text>
                <Text style={[styles.provider, { color: theme.subtitle }]}>{item.prestador}</Text>
                <Text style={[styles.price, { color: theme.accent }]}>{item.preco}</Text>
              </View>
              
              <View style={[styles.hireBtn, { backgroundColor: theme.accent }]}>
                <Text style={styles.hireBtnText}>{abaAtiva === 'comprar' ? 'Pedir' : 'Ver'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.card }]}>
            <Ionicons name="briefcase-outline" size={50} color={theme.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sua vitrine está vazia</Text>
          <Text style={[styles.emptySub, { color: theme.subtitle }]}>Ajude a economia do Vizzo compartilhando seus talentos!</Text>
          
          <TouchableOpacity 
            style={[styles.btnAnunciar, { borderColor: theme.border }]}
            onPress={() => router.push("/(main)/(stack)/novo-servico")}
          >
            <Text style={[styles.btnAnunciarText, { color: theme.accent }]}>ANUNCIAR MEU TRABALHO</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.accent }]}
        activeOpacity={0.9}
        onPress={() => router.push("/(main)/(stack)/novo-servico")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 65, paddingBottom: 15 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 25 },
  tabBar: { flexDirection: 'row', borderRadius: 18, padding: 5, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14 },
  tabText: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  card: { 
    padding: 18, 
    borderRadius: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    borderWidth: 1
  },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  serviceName: { fontWeight: 'bold', fontSize: 17, marginBottom: 2 },
  provider: { fontSize: 13, marginBottom: 6 },
  price: { fontWeight: '800', fontSize: 15 },
  hireBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  hireBtnText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  fab: { 
    position: 'absolute', 
    bottom: 35, 
    right: 25, 
    width: 65, 
    height: 65, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold' },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  btnAnunciar: { marginTop: 35, paddingVertical: 16, paddingHorizontal: 25, borderRadius: 18, borderWidth: 1 },
  btnAnunciarText: { fontWeight: 'bold', letterSpacing: 1, fontSize: 12 }
});