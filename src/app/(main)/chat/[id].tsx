import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAppTheme } from "@/context/ThemeContext";

export default function TelaChat() {
  const { id } = useLocalSearchParams(); // Pega o id_conversa da rota
  const { theme } = useAppTheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [outroUsuario, setOutroUsuario] = useState<{ nome: string; foto: string | null }>({ nome: "Vizinho", foto: null });

  useEffect(() => {
    inicializarChat();

    // Cria uma atualização automática a cada 3 segundos para receber novas mensagens
    const intervalo = setInterval(() => {
      if (meuId) atualizarHistoricoMensagens(meuId);
    }, 3000);

    return () => clearInterval(intervalo);
  }, [meuId]);

  const inicializarChat = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMeuId(user.id);

      // 1. Busca os detalhes da conversa para saber quem são os dois participantes
      const { data: conversa } = await supabase
        .from("tb_conversas")
        .select("*")
        .eq("id_conversa", id)
        .single();

      if (conversa) {
        // Descobre quem é o ID da OUTRA pessoa
        const idOutro = conversa.id_solicitante === user.id ? conversa.id_prestador : conversa.id_solicitante;

        // 2. Busca o Nome e Foto da outra pessoa
        const { data: morador } = await supabase
          .from("tb_morador")
          .select("nome, foto_url")
          .eq("id_morador", idOutro)
          .maybeSingle();

        if (morador) {
          setOutroUsuario({ nome: morador.nome, foto: morador.foto_url });
        }

        // 3. Carrega o histórico inicial de mensagens
        await atualizarHistoricoMensagens(user.id, idOutro);
      }
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarHistoricoMensagens = async (meuUid: string, idOutroFixo?: string) => {
    try {
      // Se não passarmos o idOutro por parâmetro, descobrimos ele de novo
      let idOutro = idOutroFixo;
      if (!idOutro) {
        const { data: conversa } = await supabase.from("tb_conversas").select("*").eq("id_conversa", id).single();
        if (!conversa) return;
        idOutro = conversa.id_solicitante === meuUid ? conversa.id_prestador : conversa.id_solicitante;
      }

      // Busca todas as mensagens trocadas entre essas duas pessoas
      const { data } = await supabase
        .from("tb_mensagens")
        .select("*")
        .or(`and(id_enviou.eq.${meuUid},id_destino.eq.${idOutro}),and(id_enviou.eq.${idOutro},id_destino.eq.${meuUid})`)
        .order("data_envio", { ascending: true });

      if (data) {
        setMensagens(data);
      }
    } catch (e) {
      console.log("Erro ao atualizar mensagens:", e);
    }
  };

  const handleEnviarMensagem = async () => {
    if (!novoTexto.trim() || !meuId) return;

    try {
      const textoEnviar = novoTexto.trim();
      setNovoTexto(""); // Limpa o campo imediatamente para dar sensação de velocidade

      // Descobre quem vai receber a mensagem
      const { data: conversa } = await supabase.from("tb_conversas").select("*").eq("id_conversa", id).single();
      if (!conversa) return;
      const idOutro = conversa.id_solicitante === meuId ? conversa.id_prestador : conversa.id_solicitante;

      // Insere a nova mensagem na tabela contínua
      const { error } = await supabase
        .from("tb_mensagens")
        .insert([{
          id_enviou: meuId,
          id_destino: idOutro,
          texto: textoEnviar,
          data_envio: new Date().toISOString(),
          status: 'aceito' // Já entra como aceito pois a conversa já está ativa
        }]);

      if (error) throw error;

      // Recarrega a lista na hora
      await atualizarHistoricoMensagens(meuId, idOutro);
      
      // Rola a tela para a última mensagem
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.bg }]} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Barra Superior do Chat */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Image 
          source={{ uri: outroUsuario.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(outroUsuario.nome) }} 
          style={styles.avatar} 
        />
        <Text style={[styles.nomeHeader, { color: theme.text }]}>{outroUsuario.nome}</Text>
      </View>

      {/* Lista de Mensagens estilo Balão */}
      <FlatList
        ref={flatListRef}
        data={mensagens}
        keyExtractor={(item) => item.id_mensagem.toString()}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const souEu = item.id_enviou === meuId;
          return (
            <View style={[styles.containerBalao, souEu ? styles.alinharDireita : styles.alinharEsquerda]}>
              <View style={[
                styles.balao, 
                souEu ? [styles.balaoEu, { backgroundColor: theme.primary }] : [styles.balaoOutro, { backgroundColor: theme.card }]
              ]}>
                <Text style={{ color: souEu ? 'white' : theme.text, fontSize: 15 }}>{item.texto}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input inferior de digitação */}
      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={theme.subText}
          value={novoTexto}
          onChangeText={setNovoTexto}
          multiline
        />
        <TouchableOpacity style={[styles.btnEnviar, { backgroundColor: theme.primary }]} onPress={handleEnviarMensagem}>
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, borderBottomWidth: 1 },
  btnVoltar: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  nomeHeader: { fontSize: 18, fontWeight: 'bold' },
  containerBalao: { flexDirection: 'row', marginBottom: 10, width: '100%' },
  alinharDireita: { justifyContent: 'flex-end' },
  alinharEsquerda: { justifyContent: 'flex-start' },
  balao: { maxWidth: '75%', padding: 12, borderRadius: 18 },
  balaoEu: { borderBottomRightRadius: 2 },
  balaoOutro: { borderBottomLeftRadius: 2 },
  inputContainer: { flexDirection: 'row', padding: 12, alignItems: 'center', borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, maxHeight: 100, fontSize: 15 },
  btnEnviar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});