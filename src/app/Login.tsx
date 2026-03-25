import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";

export default function Login() {
  const [currentScreen, setCurrentScreen] = useState("home");

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.containerDark}
    >
      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={styles.loginForm}>
          {/* Header do Login */}
          <Text style={styles.brandTitle}>VIZZO</Text>
          <Text style={styles.loginTitle}>Login de Acesso</Text>

          {/* Campo de E-mail */}
          <Text style={styles.inputLabel}>E-MAIL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#8b8e98"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Campo de Senha */}
          <Text style={styles.inputLabel}>SENHA</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor="#8b8e98"
            />
          </View>

          {/* Botão Esqueci a Senha */}
          <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => setCurrentScreen("vendas")}
          >
            <Text style={styles.mainButtonText}>ENTRAR</Text>
          </TouchableOpacity>

          {/* Rodapé do Form */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta?</Text>
            <TouchableOpacity onPress={() => {/* Navegar para Cadastro */}}>
              <Text style={styles.linkText}> Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  containerDark: {
    flex: 1,
    backgroundColor: "#0f1111", // Fundo Dark profundo do HTML
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  loginForm: {
    backgroundColor: "#1a1d1d", // Fundo do Card
    padding: 35,
    borderRadius: 20,
    borderTopWidth: 6,
    borderTopColor: "#ff8c00", // Detalhe Laranja
    // Sombra (iOS/Android)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  brandTitle: {
    color: "#ff8c00",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 5,
  },
  loginTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputLabel: {
    color: "#e0e0e0",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: "#252828",
    borderWidth: 1.5,
    borderColor: "#353838",
    borderRadius: 10,
    height: 55,
    paddingHorizontal: 15,
    justifyContent: "center",
    marginBottom: 20,
  },
  input: {
    color: "white",
    fontSize: 16,
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 25,
    marginTop: -10,
  },
  forgotText: {
    color: "#2d79f3",
    fontSize: 13,
    fontWeight: "600",
  },
  mainButton: {
    backgroundColor: "#2d79f3", // Azul Principal
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  mainButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1.5,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  footerText: {
    color: "#b0b0b0",
    fontSize: 14,
  },
  linkText: {
    color: "#2d79f3",
    fontSize: 14,
    fontWeight: "bold",
  },
});