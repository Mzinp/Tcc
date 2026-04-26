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
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';

export default function TestChatGeral() {
  const [isDark, setIsDark] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Limite de caracteres para segurança
  const LIMITE_CARACTERES = 500;

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        const salvo = await AsyncStorage.getItem('@vizzo_theme');
        if (salvo !== null) setIsDark(salvo === 'dark');
      };
      carregarTema();
      obterSessao();
    }, [])
  );

  useEffect(() => {
    buscarMensagens();

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

  async function obterSessao() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  }

  async function buscarMensagens() {
    const { data } = await supabase.from('tb_chat').select('*').order('created_at', { ascending: true });
    if (data) setMensagens(data);
    setLoading(false);
  }

  async function enviarMensagem() {
    // Validação extra de segurança: não envia se estiver vazio ou passar do limite
    if (!mensagem.trim() || mensagem.length > LIMITE_CARACTERES || !userId) return;

    const { error } = await supabase.from('tb_chat').insert([{
      id_autor: userId,
      texto: mensagem.trim(),
      nome_autor: "Vizinho",
      apto_autor: "Vizzo"
    }]);

    if (!error) setMensagem("");
  }

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    header: isDark ? COLORS.dark.card : "#f9f9f9",
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : "#666666",
    bubbleEu: COLORS.primary,
    bubbleOutro: isDark ? COLORS.dark.border : "#f0f0f0",
    inputBg: isDark ? COLORS.dark.card : "#f5f5f5",
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: theme.bg }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: isDark ? COLORS.dark.border : "#eee" }]}>
        <ArrowBack cor={theme.text} />
        <View style={styles.headerInfo}>
          <Text style={[styles.chatTitle, { color: theme.text }]}>Chat Geral Vizzo</Text>
          <Text style={[styles.chatStatus, { color: COLORS.green }]}>● Realtime Ativo</Text>
        </View>
        <Ionicons name="information-circle-outline" size={24} color={theme.text} />
      </View>

      {loading ? <ActivityIndicator style={{flex:1}} color={COLORS.primary}/> : (
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatArea}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {mensagens.map((msg) => {
            const ehEu = msg.id_autor === userId;
            return (
              <View key={msg.id} style={[styles.msgContainer, ehEu ? styles.msgEu : styles.msgOutro]}>
                {!ehEu && <Text style={[styles.userLabel, { color: theme.subText }]}>{msg.nome_autor}</Text>}
                <View style={[styles.bubble, { backgroundColor: ehEu ? theme.bubbleEu : theme.bubbleOutro }]}>
                  <Text style={[styles.msgText, { color: ehEu ? "#fff" : theme.text }]}>{msg.texto}</Text>
                  <Text style={[styles.horaText, { color: ehEu ? "rgba(255,255,255,0.7)" : theme.subText }]}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={[styles.inputBar, { backgroundColor: theme.header, borderTopColor: isDark ? COLORS.dark.border : "#eee" }]}>
        <View style={{ flex: 1 }}>
          <TextInput 
            placeholder="Escreva para o condomínio..."
            placeholderTextColor={theme.subText}
            value={mensagem}
            onChangeText={setMensagem}
            maxLength={LIMITE_CARACTERES} // Impede digitar mais que o limite
            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
            multiline
          />
          {/* Contador de caracteres opcional para o usuário ver */}
          {mensagem.length > LIMITE_CARACTERES * 0.8 && (
            <Text style={{ fontSize: 9, color: COLORS.red, position: 'absolute', bottom: -12, right: 10 }}>
              {mensagem.length}/{LIMITE_CARACTERES}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          onPress={enviarMensagem}
          style={[styles.sendBtn, { backgroundColor: (mensagem.trim() && mensagem.length <= LIMITE_CARACTERES) ? theme.bubbleEu : theme.subText }]}
          disabled={!mensagem.trim() || mensagem.length > LIMITE_CARACTERES}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, borderBottomWidth: 1 },
  headerInfo: { flex: 1, marginLeft: 10 },
  chatTitle: { fontSize: 16, fontWeight: 'bold' },
  chatStatus: { fontSize: 11, fontWeight: '700' },
  chatArea: { padding: 20 },
  msgContainer: { maxWidth: '85%', marginBottom: 15 },
  msgEu: { alignSelf: 'flex-end' },
  msgOutro: { alignSelf: 'flex-start' },
  userLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, marginLeft: 5 },
  bubble: { padding: 12, borderRadius: 18 },
  msgText: { fontSize: 14, lineHeight: 20 },
  horaText: { fontSize: 9, textAlign: 'right', marginTop: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 30 : 15 },
  input: { flex: 1, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 8, fontSize: 14 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});