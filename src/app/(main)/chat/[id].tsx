import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function TelaChat() {
  const { id } = useLocalSearchParams(); 
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState('');

  useEffect(() => {
    if (id) carregarMensagens();
  }, [id]);

  const carregarMensagens = async () => {
    // Adicionado tratamento de erro para debug
    const { data, error } = await supabase
      .from('tb_historico_chat')
      .select('*')
      .eq('id_conversa', id)
      .order('data_envio', { ascending: true });

    if (error) {
      console.error("Erro ao carregar mensagens:", error);
      Alert.alert("Erro", "Não foi possível carregar as mensagens.");
    } else {
      setMensagens(data || []);
    }
  };

  const enviarMensagem = async () => {
    if (!texto.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Alert.alert("Erro", "Usuário não autenticado.");
    
    const { error } = await supabase.from('tb_historico_chat').insert([{ 
      id_conversa: id, 
      id_remetente: user.id, 
      texto 
    }]);
    
    if (error) {
      console.error("Erro ao enviar:", error);
      Alert.alert("Erro", "Falha ao enviar mensagem.");
    } else {
      setTexto('');
      carregarMensagens();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={100} // Ajuste conforme necessário
    >
      <FlatList 
        data={mensagens}
        keyExtractor={(item) => item.id_mensagem.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <View style={styles.balao}>
            <Text style={{ color: '#000' }}>{item.texto}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma mensagem.</Text>}
      />
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          value={texto} 
          onChangeText={setTexto} 
          placeholder="Digite uma mensagem..." 
        />
        <TouchableOpacity onPress={enviarMensagem} style={styles.btnEnviar}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  balao: { padding: 12, backgroundColor: '#e1ffc7', margin: 8, borderRadius: 10, alignSelf: 'flex-start', maxWidth: '80%' },
  inputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  btnEnviar: { marginLeft: 10, backgroundColor: '#28a745', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 20 }
});