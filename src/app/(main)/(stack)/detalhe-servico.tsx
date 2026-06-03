import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";
import ArrowBack from "@/components/ArrowVoltar";
import { useAppTheme } from "@/context/ThemeContext"; // Importando o hook do tema global

export default function DetalheServico() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme(); // Injetando o cérebro do tema global de forma reativa

  // Pegando os dados passados pelo Marketplace
  const { id, nome, prestador, preco, descricao, id_morador } = params;

  const abrirWhatsApp = () => {
    if (!params.telefone) {
      Alert.alert("Erro", "Este morador não cadastrou um telefone de contato.");
      return;
    }
    
    // Remove tudo que não é número do telefone
    const telLimpo = params.telefone.toString().replace(/\D/g, "");
    const url = `whatsapp://send?phone=55${telLimpo}&text=Olá! Vi seu serviço de ${nome} no Vizzo e gostaria de contratar.`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert("Erro", "O WhatsApp não está instalado no seu dispositivo.");
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header com imagem ou ícone grande */}
      <View style={[styles.headerImage, { backgroundColor: theme.card }]}>
        <View style={styles.navBar}>
           <ArrowBack cor="#fff" />
        </View>
        <Ionicons name="construct-outline" size={80} color={theme.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainInfo}>
          <Text style={[styles.title, { color: theme.text }]}>{nome}</Text>
          <Text style={[styles.price, { color: theme.primary }]}>{preco}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Informações do Prestador */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.subText }]}>PRESTADOR</Text>
          <View style={styles.row}>
            <Ionicons name="person-circle-outline" size={24} color={theme.subText} />
            <Text style={[styles.infoText, { color: theme.text }]}>{prestador}</Text>
          </View>
        </View>

        {/* Descrição Detalhada */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.subText }]}>SOBRE O SERVIÇO</Text>
          <Text style={[styles.description, { color: theme.text }]}>
            {descricao || "O morador não forneceu uma descrição detalhada para este serviço."}
          </Text>
        </View>

        {/* Card de Segurança */}
        <View style={[styles.safetyCard, { backgroundColor: theme.card }]}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.green} />
          <Text style={[styles.safetyText, { color: theme.subText }]}>
            Negocie sempre pelo chat do Vizzo para sua segurança.
          </Text>
        </View>
      </ScrollView>

      {/* Botão de Ação Fixo */}
      <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.btnChat, { backgroundColor: theme.primary }]}
          onPress={() => router.push({
            pathname: "/(main)/(modal)/sucesso",
            params: { 
                mensagem: `Solicitação enviada para ${prestador}`,
                proximaTela: "/(main)/(tabs)/marketplace"
            }
          })}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          <Text style={styles.btnChatText}>CONTRATAR AGORA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerImage: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  navBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  content: { padding: 25, paddingBottom: 120 },
  mainInfo: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 8 },
  price: { fontSize: 22, fontWeight: "800" },
  divider: { height: 1, width: "100%", marginVertical: 20 },
  section: { marginBottom: 30 },
  label: { fontSize: 10, fontWeight: "bold", letterSpacing: 1.5, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontSize: 16, fontWeight: "500" },
  description: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
  safetyCard: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    gap: 12,
  },
  safetyText: { fontSize: 12, flex: 1 },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 25,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  btnChat: {
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnChatText: { color: "white", fontWeight: "bold", fontSize: 16 },
});