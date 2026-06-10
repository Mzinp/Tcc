import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ArrowBack from "@/components/ArrowVoltar";
import { useAppTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase"; 

// ==========================================
// LISTA E FUNÇÃO DE FILTRO
// ==========================================
const palavrasProibidas = [
  "safada", "safado", "gostosa", "gostoso", "linda", "lindo", "nudes", "nude",
  "porra", "poha", "prra", "caralho", "crl", "crlh", "kralho", "carai", "caraio",
  "foda", "fodase", "foder", "fdp", "fudido", "fudida",
  "merda", "mrda", "bosta", 
  "buceta", "bct", "xoxota", "xereca", "pepeca",
  "cacete", "cct", "kct", 
  "puta", "puto", "pqp", "putinha", "putaria",
  "cu", "tnc", "vtnc", "tomarnocu", 
  "arrombado", "arrombada",
  "piranha", "vadia", "vagabunda", "vagabundo", "quenga", "kenga",
  "corno", "corna", "chifrudo", 
  "tesao", "pau", "rola", "piroca", "pinto", "benga", "caceta",
  "gozar", "gozada", "esperma", "boquete", "punheta", "siririca",
  "pelada", "pelado", "sexo", "transar", "suruba", "orgia",
  "vsf", "tmnc", "pnc"
];

const contemPalavraProibida = (texto: string) => {
  if (!texto) return false;
  
  // 1. Deixa tudo minúsculo e tira os acentos
  const textoNormalizado = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 2. Quebra a frase do usuário em uma lista de palavras (separando por espaços e pontuações)
  const palavrasDigitadas = textoNormalizado.split(/[^a-z0-9]+/);

  // 3. Verifica se alguma palavra que ele digitou existe na nossa lista de proibidas
  return palavrasDigitadas.some((palavra) => palavrasProibidas.includes(palavra));
};
// ==========================================

export default function DetalheServico() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  
  // AQUI ESTÁ A CORREÇÃO ABSOLUTA: Pega unicamente o id_morador que foi passado!
  const id_prestador = (params as any).id_morador; 

  const [modalVisible, setModalVisible] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleAbrirModal = () => {
    // Se o Marketplace não enviar o ID do vizinho, ele barra aqui mesmo!
    if (!id_prestador || id_prestador.length < 10) {
      Alert.alert("Erro no Anúncio", "Não foi possível identificar o vizinho dono deste serviço. Volte e recarregue a lista.");
      return;
    }
    setModalVisible(true);
  };

  const handleEnviarSolicitacao = async () => {
    if (contemPalavraProibida(mensagem)) {
      Alert.alert("Atenção", "Mensagem imprópria. O Vizzo preza pelo respeito.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        Alert.alert("Erro", "Você precisa estar logado para enviar uma mensagem.");
        return;
      }

      // Agora sim, se o ID for seu, ele bloqueia!
      if (user.id === id_prestador) {
        Alert.alert("Atenção", "Você não pode enviar uma solicitação para o seu próprio anúncio!");
        return;
      }

      const { error: erroConversa } = await supabase
        .from('tb_conversas')
        .insert([
          {
            id_solicitante: user.id, 
            id_prestador: id_prestador, // Agora vai o UUID correto do usuário!
            status_conversa: 'pendente'
          },
        ]);

      if (erroConversa) throw erroConversa;

      const { error: erroMensagem } = await supabase
        .from('tb_mensagens')
        .insert([
          {
            id_enviou: user.id,
            id_destino: id_prestador,
            texto: mensagem,
            data_envio: new Date().toISOString(),
          },
        ]);

      if (erroMensagem) {
        console.log("Erro ao salvar o texto:", erroMensagem);
      }
      
      setModalVisible(false);
      setMensagem(""); 
      router.push({
        pathname: "/(main)/(modal)/sucesso",
        params: { mensagem: "Solicitação enviada ao prestador!" }
      });

    } catch (error) {
      console.error("Erro ao enviar:", error);
      Alert.alert("Erro", "Não foi possível enviar a solicitação. Tente novamente.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.navBar}><ArrowBack cor={theme.text} /></View>
        <Text style={[styles.title, { color: theme.text }]}>{params.nome}</Text>
        <Text style={[styles.price, { color: theme.primary }]}>{params.preco}</Text>
        <Text style={[styles.info, { color: theme.text }]}>{params.descricao}</Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.btnChat, { backgroundColor: theme.primary }]} 
          onPress={handleAbrirModal}
        >
          <Text style={styles.btnChatText}>SOLICITAR CONTATO</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nova Solicitação</Text>
            <TextInput 
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              placeholder="Escreva detalhes para o prestador..."
              placeholderTextColor={theme.subText}
              multiline
              value={mensagem}
              onChangeText={setMensagem}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                <Text style={{ color: theme.subText }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEnviarSolicitacao} style={[styles.btnConfirm, { backgroundColor: theme.primary }]}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 25, paddingBottom: 120 },
  navBar: { marginBottom: 20, marginTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  info: { fontSize: 16, lineHeight: 24 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  btnChat: { height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  btnChatText: { color: "white", fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 15, height: 100, marginBottom: 15, textAlignVertical: 'top' }, 
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btnCancel: { padding: 15 },
  btnConfirm: { padding: 15, borderRadius: 12, paddingHorizontal: 30 }
});