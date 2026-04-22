import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import BotaoVoltar from '@/components/ArrowVoltar';

// Mensagens fakes para popular o chat do condomínio
const MENSAGENS_INICIAIS = [
  { id: '1', usuario: 'Mateus', apto: '202', texto: 'Alguém sabe se a piscina está aberta hoje?', eu: false, hora: '14:20' },
  { id: '2', usuario: 'Você', apto: '102', texto: 'Acredito que sim, vi o zelador limpando hoje cedo.', eu: true, hora: '14:22' },
  { id: '3', usuario: 'Dra. Ana', apto: '501', texto: 'O síndico avisou no mural que a manutenção acabou!', eu: false, hora: '14:25' },
];

export default function TestChatGeral() {
  const [isDark, setIsDark] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? "#0f1111" : "#ffffff",
    header: isDark ? "#1a1d1d" : "#f9f9f9",
    text: isDark ? "#ffffff" : "#0f1111",
    subText: isDark ? "#8b8e98" : "#666666",
    bubbleEu: "#2d79f3",
    bubbleOutro: isDark ? "#252828" : "#f0f0f0",
    inputBg: isDark ? "#1a1d1d" : "#f5f5f5",
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: theme.bg }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* HEADER DO CHAT */}
      <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: isDark ? "#252828" : "#eee" }]}>
        <BotaoVoltar cor={theme.text} />
        <View style={styles.headerInfo}>
          <Text style={[styles.chatTitle, { color: theme.text }]}>Chat Geral Vizzo</Text>
          <Text style={[styles.chatStatus, { color: "#4caf50" }]}>● 14 vizinhos online</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ÁREA DE MENSAGENS */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>HOJE</Text>
        </View>

        {MENSAGENS_INICIAIS.map((msg) => (
          <View 
            key={msg.id} 
            style={[styles.msgContainer, msg.eu ? styles.msgEu : styles.msgOutro]}
          >
            {!msg.eu && (
              <Text style={[styles.userLabel, { color: theme.subText }]}>
                {msg.usuario} <Text style={{ fontSize: 9 }}>• Apt {msg.apto}</Text>
              </Text>
            )}
            <View style={[
              styles.bubble, 
              { backgroundColor: msg.eu ? theme.bubbleEu : theme.bubbleOutro }
            ]}>
              <Text style={[styles.msgText, { color: msg.eu ? "#fff" : theme.text }]}>
                {msg.texto}
              </Text>
              <Text style={[styles.horaText, { color: msg.eu ? "rgba(255,255,255,0.7)" : theme.subText }]}>
                {msg.hora}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* BARRA DE INPUT */}
      <View style={[styles.inputBar, { backgroundColor: theme.header, borderTopColor: isDark ? "#252828" : "#eee" }]}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="add-circle-outline" size={28} color={theme.bubbleEu} />
        </TouchableOpacity>
        
        <TextInput 
          placeholder="Escreva para o condomínio..."
          placeholderTextColor={theme.subText}
          value={mensagem}
          onChangeText={setMensagem}
          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
          multiline
        />

        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: mensagem.trim() ? theme.bubbleEu : theme.subText }]}
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 15, 
    borderBottomWidth: 1 
  },
  headerInfo: { flex: 1, marginLeft: 10 },
  chatTitle: { fontSize: 16, fontWeight: 'bold' },
  chatStatus: { fontSize: 11, fontWeight: '700' },

  chatArea: { padding: 20, paddingBottom: 40 },
  dateBadge: { alignSelf: 'center', backgroundColor: 'rgba(120,120,120,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginBottom: 20 },
  dateText: { fontSize: 10, fontWeight: 'bold', color: '#888', letterSpacing: 1 },

  msgContainer: { maxWidth: '85%', marginBottom: 15 },
  msgEu: { alignSelf: 'flex-end' },
  msgOutro: { alignSelf: 'flex-start' },

  userLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, marginLeft: 5 },
  bubble: { padding: 12, borderRadius: 18, elevation: 1 },
  msgText: { fontSize: 14, lineHeight: 20 },
  horaText: { fontSize: 9, textAlign: 'right', marginTop: 4 },

  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15 
  },
  attachBtn: { marginRight: 10 },
  input: { 
    flex: 1, 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    fontSize: 14, 
    maxHeight: 100 
  },
  sendBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 10 
  }
});