import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ArrowBack from "@/components/ArrowVoltar";
import { useAppTheme } from "@/context/ThemeContext";
// IMPORTANTE: Use a instância do supabase que já está configurada no seu projeto
import { supabase } from "@/lib/supabase"; 

export default function DetalheServico() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  
  // Extrai o id do prestador dos params. Ajuste o nome da chave se o seu parâmetro for diferente.
  const id_prestador = (params as any).id_prestador ?? (params as any).idPrestador ?? (params as any).id ?? "";
  
  const [modalVisible, setModalVisible] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleEnviarSolicitacao = async () => {
    // 1. Filtro de mensagens proibidas
    const proibidas = ["safada", "gostosa", "linda", "nudes"];
    if (proibidas.some(p => mensagem.toLowerCase().includes(p))) {
      Alert.alert("Atenção", "Mensagem imprópria. O Vizzo preza pelo respeito.");
      return;
    }

    try {
      // 2. Pega a sessão do usuário logado
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        Alert.alert("Erro", "Você precisa estar logado para enviar uma mensagem.");
        return;
      }

      // 3. Verifica se temos o ID do prestador antes de enviar
      if (!id_prestador) {
        Alert.alert("Erro", "ID do prestador não encontrado.");
        return;
      }

      // 4. Insere no banco
      const { error } = await supabase
        .from('tb_mensagens')
        .insert([
          {
            id_enviou: user.id,
            id_destino: id_prestador,
            texto: mensagem,
            data_envio: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // 5. Sucesso
      setModalVisible(false);
      setMensagem(""); // Limpa o campo após o envio
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
          onPress={() => setModalVisible(true)}
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
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 15, height: 100, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btnCancel: { padding: 15 },
  btnConfirm: { padding: 15, borderRadius: 12, paddingHorizontal: 30 }
});