import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from 'expo-router';
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';

export default function TestChatGeral() {
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Morador"); // Estado para o nome real
  const scrollViewRef = useRef<ScrollView>(null);

  const LIMITE_CARACTERES = 500;

  // Tema Full Black Fixo
  const theme = {
    bg: "#0f1111",
    header: "#1a1d1d",
    text: "#ffffff",
    subText: "#8b8e98",
    bubbleEu: "#2d79f3",
    bubbleOutro: "#252828",
    inputBg: "#252828",
    border: "#252828",
    accent: "#2d79f3"
  };

  useFocusEffect(
    React.useCallback(() => {
      obterSessaoEPefil();
    }, [])
  );

  useEffect(() => {
    buscarMensagens();

    // Canal de Realtime
    const channel = supabase
      .channel('chat_condominio')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tb_chat' }, 
        (payload) => {
          setMensagens((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function obterSessaoEPefil() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      // Busca o nome real do morador para o chat
      const { data } = await supabase
        .from("tb_morador")
        .select("Nome")
        .eq("id_morador", user.id)
        .single();
      
      if (data?.Nome) setUserName(data.Nome);
    }
  }

  async function buscarMensagens() {
    const { data } = await supabase.from('tb_chat').select('*').order('created_at', { ascending: true });
    if (data) setMensagens(data);
    setLoading(false);
  }

  async function enviarMensagem() {
    if (!mensagem.trim() || mensagem.length > LIMITE_CARACTERES || !userId) return;

    const { error } = await supabase.from('tb_chat').insert([{
      id_autor: userId,
      texto: mensagem.trim(),
      nome_autor: userName, // Agora envia o nome real buscado do banco
      apto_autor: "Vizzo"
    }]);

    if (!error) setMensagem("");
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: theme.bg }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: theme.border }]}>
        <ArrowBack cor={theme.text} />
        <View style={styles.headerInfo}>
          <Text style={[styles.chatTitle, { color: theme.text }]}>Chat Geral Vizzo</Text>
          <Text style={[styles.chatStatus, { color: COLORS.green }]}>● Realtime Ativo</Text>
        </View>
        <Ionicons name="shield-checkmark-outline" size={22} color={theme.accent} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.primary}/>
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatArea}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {mensagens.map((msg) => {
            const ehEu = msg.id_autor === userId;
            return (
              <View key={msg.id} style={[styles.msgContainer, ehEu ? styles.msgEu : styles.msgOutro]}>
                {!ehEu && <Text style={[styles.userLabel, { color: "#ff8c00" }]}>{msg.nome_autor}</Text>}
                <View style={[styles.bubble, { backgroundColor: ehEu ? theme.bubbleEu : theme.bubbleOutro }]}>
                  <Text style={[styles.msgText, { color: "#fff" }]}>{msg.texto}</Text>
                  <Text style={[styles.horaText, { color: "rgba(255,255,255,0.5)" }]}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={[styles.inputBar, { backgroundColor: theme.header, borderTopColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <TextInput 
            placeholder="Escreva para o condomínio..."
            placeholderTextColor={theme.subText}
            value={mensagem}
            onChangeText={setMensagem}
            maxLength={LIMITE_CARACTERES}
            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
            multiline
          />
        </View>

        <TouchableOpacity 
          onPress={enviarMensagem}
          style={[styles.sendBtn, { backgroundColor: (mensagem.trim()) ? theme.bubbleEu : theme.subText }]}
          disabled={!mensagem.trim()}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20, borderBottomWidth: 1 },
  headerInfo: { flex: 1, marginLeft: 15 },
  chatTitle: { fontSize: 18, fontWeight: 'bold' },
  chatStatus: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  chatArea: { padding: 20, paddingBottom: 40 },
  msgContainer: { maxWidth: '85%', marginBottom: 15 },
  msgEu: { alignSelf: 'flex-end' },
  msgOutro: { alignSelf: 'flex-start' },
  userLabel: { fontSize: 11, fontWeight: '900', marginBottom: 4, marginLeft: 8, letterSpacing: 0.5 },
  bubble: { padding: 14, borderRadius: 20 },
  msgText: { fontSize: 15, lineHeight: 22 },
  horaText: { fontSize: 9, textAlign: 'right', marginTop: 6 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 35 : 15 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 10, elevation: 3 }
});