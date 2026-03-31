import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import ArrowVoltar from '@/components/ArrowVoltar'; // Importação solicitada
import { router } from 'expo-router';

export default function EsqueceuSenha() {
  const [isDark, setIsDark] = useState(true);

  // Tema: Preto vs Branco conforme as imagens anteriores
  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    input: isDark ? "#252828" : "#ffffff",
    border: isDark ? "#353838" : "#dddddd",
    text: isDark ? "#ffffff" : "#0f1111",
    label: isDark ? "#e0e0e0" : "#444444"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      {/* Header com o Botão de Voltar e Alternador de Tema */}
      <View style={styles.header}>
        <ArrowVoltar cor={theme.text} />
        
        <TouchableOpacity 
          style={styles.themeBtn} 
          onPress={() => setIsDark(!isDark)}
        >
          <Text style={{ color: "#2d79f3", fontWeight: 'bold' }}>
            {isDark ? "☀️" : "🌙"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Recuperar Senha</Text>
          
          <Text style={[styles.description, { color: theme.label }]}>
            Digite seu e-mail cadastrado no Vizzo. Enviaremos um código para você criar uma nova senha.
          </Text>

          {/* Campo de E-mail */}
          <Text style={[styles.inputLabel, { color: theme.label }]}>E-MAIL</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              style={{ color: theme.text }} 
              placeholder="exemplo@email.com" 
              placeholderTextColor="#8b8e98"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Botão de Enviar */}
          <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => {
              console.log("Código enviado");
              router.back(); // Retorna após simular o envio
            }}
          >
            <Text style={styles.mainButtonText}>ENVIAR CÓDIGO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 25,
    // ArrowVoltar já possui padding/margin interno conforme criado anteriormente
  },
  themeBtn: {
    marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  card: {
    padding: 35,
    borderRadius: 20,
    borderTopWidth: 6,
    borderTopColor: "#ff8c00", // Laranja Vizzo
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    justifyContent: "center",
    marginBottom: 25,
  },
  mainButton: {
    backgroundColor: "#2d79f3", // Azul Vizzo
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  mainButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
});