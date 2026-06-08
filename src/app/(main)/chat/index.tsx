import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/context/ThemeContext';

export default function ListaConversas() {
  const [conversas, setConversas] = useState<any[]>([]);
  const [aba, setAba] = useState<'ativa' | 'pendente' | 'aguardando'>('ativa');
  const [loading, setLoading] = useState(true);
  const { theme } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    carregarConversas();
  }, [aba]);

  const carregarConversas = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase.from('tb_conversas').select('*');

    // Filtros corrigidos para evitar que você veja suas próprias solicitações
    if (aba === 'pendente') {
      query = query.eq('id_prestador', user.id).eq('status_conversa', 'pendente');
    } else if (aba === 'aguardando') {
      query = query.eq('id_solicitante', user.id).eq('status_conversa', 'pendente');
    } else {
      query = query.eq('status_conversa', 'ativa').or(`id_solicitante.eq.${user.id},id_prestador.eq.${user.id}`);
    }

    const { data } = await query;

    if (data) {
      const listaComDetalhes = await Promise.all(data.map(async (conv) => {
        const idOutro = conv.id_solicitante === user.id ? conv.id_prestador : conv.id_solicitante;
        const { data: morador } = await supabase.from('tb_morador').select('nome, foto_url').eq('id_morador', idOutro).single();
        return { ...conv, nome: morador?.nome || 'Usuário', foto: morador?.foto_url };
      }));
      setConversas(listaComDetalhes);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.titulo, { color: theme.text }]}>Conversas</Text>
      
      <View style={styles.tabContainer}>
        {[{id: 'ativa', label: 'Andamento'}, {id: 'pendente', label: 'Recebidas'}, {id: 'aguardando', label: 'Enviadas'}].map((tab) => (
          <TouchableOpacity key={tab.id} onPress={() => setAba(tab.id as any)} style={[styles.tab, aba === tab.id && { borderBottomColor: theme.primary }]}>
            <Text style={{ color: aba === tab.id ? theme.primary : theme.subText, fontSize: 13, fontWeight: 'bold' }}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 50 }} /> : (
        <FlatList
          data={conversas}
          keyExtractor={(item) => item.id_conversa}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={() => router.push(`/chat/${item.id_conversa}`)}>
              <Image source={{ uri: item.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.nome) }} style={styles.avatar} />
              <View>
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold' }}>{item.nome}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  tab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  card: { padding: 15, flexDirection: 'row', alignItems: 'center', borderRadius: 15, marginBottom: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 }
});