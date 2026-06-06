import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ListaConversas() {
  const [conversas, setConversas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    carregarConversas();
  }, []);

  const carregarConversas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Busca conversas onde o usuário é o solicitante OU o prestador
    const { data, error } = await supabase
      .from('tb_conversas')
      .select('id_conversa, id_solicitante, id_prestador')
      .or(`id_solicitante.eq.${user.id},id_prestador.eq.${user.id}`);

    if (error) console.error(error);
    else setConversas(data || []);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Suas Conversas</Text>
      <FlatList
        data={conversas}
        keyExtractor={(item) => item.id_conversa}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`/chat/${item.id_conversa}`)}
          >
            <Text style={styles.nome}>Conversa ID: {item.id_conversa.substring(0, 8)}...</Text>
            <Text style={styles.sub}>Toque para abrir</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, elevation: 2 },
  nome: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 12, color: '#666', marginTop: 5 }
});