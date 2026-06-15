import ArrowBack from "@/components/ArrowVoltar";
import { useAppTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const getIconeParaServico = (nome: string) => {
  const n = nome.toLowerCase();

  // Lista de palavras-chave mais completa
  if (
    n.includes("aula") ||
    n.includes("estudo") ||
    n.includes("ensino") ||
    n.includes("professor")
  )
    return "book-outline";
  if (
    n.includes("limpeza") ||
    n.includes("faxina") ||
    n.includes("limpar") ||
    n.includes("organizar")
  )
    return "brush-outline";
  if (
    n.includes("conserto") ||
    n.includes("reparo") ||
    n.includes("eletric") ||
    n.includes("encanador")
  )
    return "build-outline";
  if (
    n.includes("entrega") ||
    n.includes("frete") ||
    n.includes("transporte") ||
    n.includes("delivery")
  )
    return "car-outline";
  if (
    n.includes("pet") ||
    n.includes("cachorro") ||
    n.includes("gato") ||
    n.includes("animal")
  )
    return "paw-outline";

  // Adicionei estas palavras para o caso de culinária:
  if (
    n.includes("culinaria") ||
    n.includes("cozinha") ||
    n.includes("bolo") ||
    n.includes("doce") ||
    n.includes("comida")
  )
    return "restaurant-outline";

  // Log para você descobrir o que está acontecendo se cair no default
  console.log("Serviço não mapeado, usando ícone padrão para:", nome);
  return "briefcase-outline";
};

export default function DetalheServico() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();

  // Captura os novos campos que você salvou no banco
  const id_prestador = (params as any).id_morador;
  const iconeServico = getIconeParaServico((params.nome as string) || "");
  const tipoCobranca = (params as any).tipo_cobranca;
  const certificado = (params as any).certificado_url;

  const [modalVisible, setModalVisible] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleAbrirModal = () => {
    if (!id_prestador || id_prestador.length < 10) {
      Alert.alert(
        "Erro no Anúncio",
        "Não foi possível identificar o vizinho dono deste serviço.",
      );
      return;
    }
    setModalVisible(true);
  };

  const handleEnviarSolicitacao = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return Alert.alert("Erro", "Você precisa estar logado.");

      if (user.id === id_prestador)
        return Alert.alert(
          "Atenção",
          "Você não pode enviar solicitação para si mesmo!",
        );

      await supabase.from("tb_conversas").insert([
        {
          id_solicitante: user.id,
          id_prestador: id_prestador,
          status_conversa: "pendente",
        },
      ]);
      await supabase.from("tb_mensagens").insert([
        {
          id_enviou: user.id,
          id_destino: id_prestador,
          texto: mensagem,
          data_envio: new Date().toISOString(),
        },
      ]);

      setModalVisible(false);
      router.push({
        pathname: "/(main)/(modal)/sucesso" as any,
        params: { mensagem: "Solicitação enviada!" },
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navBar}>
          <ArrowBack cor={theme.text} />
        </View>

        <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
          <Ionicons
            name={iconeServico as any}
            size={40}
            color={theme.primary}
          />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>{params.nome}</Text>

        {/* Preço e Tipo de Cobrança */}
        <Text style={[styles.price, { color: theme.primary }]}>
          {params.preco}{" "}
          <Text style={{ fontSize: 14, color: theme.subText }}>
            / {tipoCobranca}
          </Text>
        </Text>

        {/* Certificado (Se existir) */}
        {certificado && certificado !== "null" && (
          <View style={[styles.badge, { backgroundColor: theme.card }]}>
            <Ionicons name="shield-checkmark" size={16} color="#28B446" />
            <Text style={[styles.badgeText, { color: "#28B446" }]}>
              Certificado Verificado
            </Text>
          </View>
        )}

        <Text style={[styles.info, { color: theme.text }]}>
          {params.descricao}
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.bg, borderTopColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.btnChat, { backgroundColor: theme.primary }]}
          onPress={handleAbrirModal}
        >
          <Text style={styles.btnChatText}>SOLICITAR CONTATO</Text>
        </TouchableOpacity>
      </View>

      {/* Modal permanece igual */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Nova Solicitação
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.bg,
                },
              ]}
              placeholder="Escreva detalhes..."
              placeholderTextColor={theme.subText}
              multiline
              value={mensagem}
              onChangeText={setMensagem}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.btnCancel}
              >
                <Text style={{ color: theme.subText }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEnviarSolicitacao}
                style={[styles.btnConfirm, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Enviar
                </Text>
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
  content: { padding: 25, paddingBottom: 150 },
  navBar: { marginBottom: 20, marginTop: 40 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 8 },
  price: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  badgeText: { fontWeight: "bold", marginLeft: 8 },
  info: { fontSize: 16, lineHeight: 24 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    paddingBottom: 85,
    borderTopWidth: 1,
  },
  btnChat: {
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  btnChatText: { color: "white", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    height: 100,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  btnCancel: { padding: 15 },
  btnConfirm: { padding: 15, borderRadius: 12, paddingHorizontal: 30 },
});
