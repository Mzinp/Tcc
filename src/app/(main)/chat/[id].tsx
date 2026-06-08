import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Image 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function TelaChat() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState('');
  const [meuId, setMeuId] = useState<string | null>(null);
  const [dadosDestinatario, setDadosDestinatario] = useState({ nome: 'Carregando...', foto: null });
  const { theme } = useAppTheme();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    inicializar();
  }, [id]);

  const inicializar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMeuId(user.id);
    
    // 1. Busca a conversa para identificar o destinatário
    const { data: conversa } = await supabase
      .from('tb_conversas') 
      .select('id_solicitante, id_prestador')
      .eq('id_conversa', id)
      .single();

    if (conversa) {
      // 2. Define o ID da outra pessoa
      const idOutro = conversa.id_solicitante === user.id ? conversa.id_prestador : conversa.id_solicitante;
      
      // 3. Busca nome e foto do outro morador
      const { data: morador } = await supabase
        .from('tb_morador')
        .select('nome, foto_url')
        .eq('id_morador', idOutro) 
        .single();
        
      if (morador) setDadosDestinatario({ nome: morador.nome, foto: morador.foto_url });
    }
    
    carregarMensagens();
  };

  const carregarMensagens = async () => {
    const { data } = await supabase
      .from('tb_historico_chat')
      .select('*')
      .eq('id_conversa', id)
      .order('data_envio', { ascending: true });
    
    setMensagens(data || []);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const enviarMensagem = async () => {
    if (!texto.trim() || !meuId) return;
    const msgParaEnviar = texto;
    setTexto('');

    await supabase.from('tb_historico_chat').insert([{ 
      id_conversa: id, 
      id_remetente: meuId, 
      texto: msgParaEnviar,
      data_envio: new Date().toISOString()
    }]);
    carregarMensagens();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Cabeçalho Estiloso */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Image 
          source={{ uri: dadosDestinatario.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(dadosDestinatario.nome) }} 
          style={styles.avatar} 
        />
        <Text style={[styles.headerTitle, { color: theme.text }]}>{dadosDestinatario.nome}</Text>
      </View>

      <FlatList 
        ref={flatListRef}
        data={mensagens}
        keyExtractor={(item) => item.id_mensagem}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => {
          const isMe = item.id_remetente === meuId;
          return (
            <View style={[styles.balao, isMe ? styles.balaoDireita : styles.balaoEsquerda, { backgroundColor: isMe ? theme.primary : theme.card }]}>
              <Text style={{ color: isMe ? '#fff' : theme.text, fontSize: 15 }}>{item.texto}</Text>
              <Text style={[styles.hora, { color: isMe ? '#e0e0e0' : theme.subText }]}>
                {new Date(item.data_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      <View style={[styles.inputArea, { backgroundColor: theme.card }]}>
        <TextInput 
          style={[styles.input, { color: theme.text }]} 
          value={texto} 
          onChangeText={setTexto} 
          placeholder="Mensagem..." 
          placeholderTextColor={theme.subText}
        />
        <TouchableOpacity onPress={enviarMensagem} style={styles.btnEnviar}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  balao: { padding: 12, marginVertical: 4, borderRadius: 18, maxWidth: '80%', paddingBottom: 6 },
  balaoDireita: { alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  balaoEsquerda: { alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  hora: { fontSize: 9, alignSelf: 'flex-end', marginTop: 3, opacity: 0.8 },
  inputArea: { flexDirection: 'row', padding: 12, alignItems: 'center', borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1, paddingHorizontal: 15, height: 45, borderRadius: 25 },
  btnEnviar: { backgroundColor: '#2d79f3', padding: 12, borderRadius: 25, marginLeft: 10 }
});