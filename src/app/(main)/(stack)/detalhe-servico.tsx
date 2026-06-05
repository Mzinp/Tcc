import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ArrowBack from "@/components/ArrowVoltar";
import { useAppTheme } from "@/context/ThemeContext";

export default function DetalheServico() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleEnviarSolicitacao = () => {
    const proibidas = ["safada", "gostosa", "linda", "nudes"];
    if (proibidas.some(p => mensagem.toLowerCase().includes(p))) {
      Alert.alert("Atenção", "Mensagem imprópria. O Vizzo preza pelo respeito.");
      return;
    }

    setModalVisible(false);
    router.push({
      pathname: "/(main)/(modal)/sucesso",
      params: { mensagem: "Solicitação enviada ao prestador!" }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* ScrollView com o conteúdo */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.navBar}><ArrowBack cor={theme.text} /></View>
        <Text style={[styles.title, { color: theme.text }]}>{params.nome}</Text>
        <Text style={[styles.price, { color: theme.primary }]}>{params.preco}</Text>
        <Text style={[styles.info, { color: theme.text }]}>{params.descricao}</Text>
      </ScrollView>

      {/* FOOTER FIXO NO RODAPÉ */}
      <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.btnChat, { backgroundColor: theme.primary }]} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.btnChatText}>SOLICITAR CONTATO</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PROFISSIONAL */}
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