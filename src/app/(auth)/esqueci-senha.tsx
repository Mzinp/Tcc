import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';

export default function EsqueciSenha() {
  const [isDark, setIsDark] = useState(true);

  React.useEffect(() => {
    const carregarTema = async () => {
      try {
        const salvo = await AsyncStorage.getItem('@vizzo_theme');
        if (salvo !== null) setIsDark(salvo === 'dark');
      } catch (e) {
        console.log("Erro ao carregar tema");
      }
    };
    carregarTema();
  }, []);

  const theme = {
    bg: isDark ? COLORS.dark.bg : "#f5f5f5",
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    input: isDark ? "#252828" : "#f0f0f0",
    border: isDark ? "#353838" : "#dddddd",
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    label: isDark ? "#e0e0e0" : "#666666"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
      </View>

      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Recuperar Senha</Text>
          
          <Text style={[styles.description, { color: theme.label }]}>
            Digite seu e-mail cadastrado no Vizzo. Enviaremos um código para você criar uma nova senha.
          </Text>

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

          <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => router.push({
              pathname: "/sucesso",
              params: { mensagem: "Verifique seu e-mail! Enviamos as instruções de recuperação." }
            })}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 10,
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
    borderTopColor: COLORS.orange,
    borderWidth: 1,
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
    backgroundColor: COLORS.primary,
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