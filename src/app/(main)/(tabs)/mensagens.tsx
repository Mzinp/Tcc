import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAppTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

export default function Mensagens() {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    carregarMensagens();
  }, []);

  const carregarMensagens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tb_mensagens')
        .select('*')
        .eq('status', 'pendente')
        .order('data_envio', { ascending: false });

      if (error) throw error;
      setMensagens(data || []);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  };

  const processarSolicitacao = async (item: any, status: 'aceito' | 'recusado') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const ID_PRESTADOR = user?.id;

      if (status === 'aceito') {
        // 1. Cria a conversa e retorna o ID dela
        const { data: novaConversa, error: errorInsert } = await supabase
          .from('tb_conversas')
          .insert([{
              id_solicitante: item.id_enviou,
              id_prestador: ID_PRESTADOR,
              status_conversa: 'ativa',
          }])
          .select('id_conversa') // Pega o ID gerado
          .single();

        if (errorInsert) throw errorInsert;

        // 2. Atualiza a mensagem original
        await supabase
          .from('tb_mensagens')
          .update({ status: 'aceito' })
          .eq('id_mensagem', item.id_mensagem);

        // 3. Redireciona para o chat da nova conversa
        // Usar objeto com pathname e params para corresponder ao tipo esperado
        router.push({
          pathname: '/(main)/chat/[id]',
          params: { id: novaConversa?.id_conversa },
        });
        
      } else {
        await supabase
          .from('tb_mensagens')
          .update({ status: 'recusado' })
          .eq('id_mensagem', item.id_mensagem);
        
        carregarMensagens();
      }

    } catch (error) {
      console.error('Erro ao processar:', error);
      Alert.alert("Erro", "Não foi possível processar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={theme.primary} style={{flex: 1}} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.header, { color: theme.text }]}>Solicitações Pendentes</Text>
      
      <FlatList
        data={mensagens}
        keyExtractor={(item) => item.id_mensagem.toString()}
        ListEmptyComponent={<Text style={{color: theme.subText, textAlign: 'center'}}>Nenhuma solicitação.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text, fontSize: 16 }}>{item.texto}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={() => processarSolicitacao(item, 'aceito')}
                style={[styles.btn, { backgroundColor: '#28a745' }]}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Aceitar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => processarSolicitacao(item, 'recusado')}
                style={[styles.btn, { backgroundColor: '#dc3545' }]}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Recusar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ccc' },
  buttonContainer: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  btn: { padding: 10, borderRadius: 8, flex: 0.48, alignItems: 'center' }
});