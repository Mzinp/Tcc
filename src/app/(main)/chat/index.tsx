import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/context/ThemeContext';

export default function ChatIndex() {
  const [conversas, setConversas] = useState<any[]>([]);
  // Começamos na aba Andamento como padrão
  const [aba, setAba] = useState<'recebidas' | 'enviadas' | 'andamento'>('andamento'); 
  const [loading, setLoading] = useState(true);
  
  const { theme } = useAppTheme();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      carregarConversas();
    }, [aba])
  );

  const carregarConversas = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase.from('tb_conversas').select('*');

      // 1. Filtra o banco de dados dependendo da aba que você clicou
      if (aba === 'recebidas') {
        // Alguém pediu o SEU serviço (Você é o prestador e está pendente)
        query = query.eq('id_prestador', user.id).eq('status_conversa', 'pendente');
      } else if (aba === 'enviadas') {
        // VOCÊ pediu o serviço de alguém (Você é o solicitante e está pendente)
        query = query.eq('id_solicitante', user.id).eq('status_conversa', 'pendente');
      } else {
        // Conversas que já foram aceitas (Ativas)
        query = query.eq('status_conversa', 'ativa').or(`id_solicitante.eq.${user.id},id_prestador.eq.${user.id}`);
      }

      const { data, error } = await query.order('data_criacao', { ascending: false });
      
      if (data) {
        // 2. Busca o nome e a foto do vizinho para mostrar na lista
        const listaComDetalhes = await Promise.all(data.map(async (conv) => {
          const idOutro = conv.id_solicitante === user.id ? conv.id_prestador : conv.id_solicitante;
          const { data: morador } = await supabase.from('tb_morador').select('nome, foto_url').eq('id_morador', idOutro).maybeSingle(); 
          return { 
            ...conv, 
            nome_outro: morador?.nome || 'Vizinho', 
            foto_outro: morador?.foto_url 
          };
        }));
        setConversas(listaComDetalhes);
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Função para o Prestador Aceitar ou Recusar direto pela aba "Recebidas"
  const responderSolicitacao = async (idConversa: string, acao: 'aceitar' | 'recusar') => {
    try {
      setLoading(true);
      if (acao === 'aceitar') {
        // Muda a sala para ativa
        await supabase.from('tb_conversas').update({ status_conversa: 'ativa' }).eq('id_conversa', idConversa);
        // Joga o usuário direto pra dentro do chat!
        router.push(`/chat/${idConversa}`);
      } else {
        // Muda a sala para recusada e ela some da lista
        await supabase.from('tb_conversas').update({ status_conversa: 'recusada' }).eq('id_conversa', idConversa);
        carregarConversas(); // Recarrega a tela
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível processar a resposta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: theme.text }]}>Chat e Solicitações</Text>
      </View>
      
      {/* O Menu de Abas que tinha sumido! */}
      <View style={styles.tabContainer}>
        {[
          { id: 'andamento', label: 'Andamento' },
          { id: 'recebidas', label: 'Recebidas' }, 
          { id: 'enviadas', label: 'Enviadas' }
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.id} 
            onPress={() => setAba(tab.id as any)} 
            style={[styles.tab, aba === tab.id && { borderBottomColor: theme.primary }]}
          >
            <Text style={{ color: aba === tab.id ? theme.primary : theme.subText, fontSize: 14, fontWeight: 'bold' }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : conversas.length === 0 ? (
        <Text style={[styles.vazioText, { color: theme.subText }]}>
          {aba === 'recebidas' ? 'Ninguém solicitou seus serviços ainda.' : aba === 'enviadas' ? 'Você não enviou nenhuma solicitação.' : 'Nenhuma conversa em andamento.'}
        </Text>
      ) : (
        <FlatList
          data={conversas}
          keyExtractor={(item) => item.id_conversa}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.card }]} 
              // Só deixa clicar para abrir o chat se já estiver em andamento ou se você for o remetente ansioso
              onPress={() => {
                if (aba === 'andamento' || aba === 'enviadas') router.push(`/chat/${item.id_conversa}`);
              }}
              disabled={aba === 'recebidas'} // Desativa o clique inteiro na aba recebidas pq tem os botões
            >
              <Image 
                source={{ uri: item.foto_outro || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.nome_outro) }} 
                style={styles.avatar} 
              />
              <View style={styles.cardInfo}>
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold' }}>{item.nome_outro}</Text>
                
                {/* Textos dinâmicos dependendo da aba */}
                <Text style={{ color: theme.subText, fontSize: 13, marginTop: 2 }}>
                  {aba === 'recebidas' ? 'Quer contratar o seu serviço.' : aba === 'enviadas' ? 'Aguardando o vizinho aceitar...' : 'Toque para abrir a conversa'}
                </Text>

                {/* Botões Mágicos: Só aparecem na aba "Recebidas" */}
                {aba === 'recebidas' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => responderSolicitacao(item.id_conversa, 'aceitar')} style={[styles.btnAcao, { backgroundColor: '#28a745' }]}>
                      <Text style={styles.btnTexto}>Aceitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => responderSolicitacao(item.id_conversa, 'recusar')} style={[styles.btnAcao, { backgroundColor: '#dc3545' }]}>
                      <Text style={styles.btnTexto}>Recusar</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </View>
              {aba !== 'recebidas' && <Ionicons name="chevron-forward" size={20} color={theme.subText} />}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 20 },
  titulo: { fontSize: 26, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  tab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', flex: 1, alignItems: 'center' },
  card: { padding: 15, flexDirection: 'row', alignItems: 'center', borderRadius: 15, marginBottom: 12, elevation: 1 },
  avatar: { width: 55, height: 55, borderRadius: 27.5, marginRight: 15 },
  cardInfo: { flex: 1 },
  vazioText: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  actionButtons: { flexDirection: 'row', marginTop: 12, gap: 10 },
  btnAcao: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnTexto: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});