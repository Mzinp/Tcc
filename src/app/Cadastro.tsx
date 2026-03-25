import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";

export default function Cadastro() {
  const [currentScreen, setCurrentScreen] = useState("home");

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.containerDark}
    >
      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={styles.loginForm}>
          <Text style={styles.loginTitle}>Novo Membro</Text>

          <Text style={styles.inputLabel}>E-MAIL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="executivo@email.com"
              placeholderTextColor="#8b8e98"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.inputLabel}>CELULAR</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="+55 (11) 99999-9999"
              placeholderTextColor="#8b8e98"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity style={styles.fotoBotao}>
            <Text style={styles.fotoBotaoText}>
              + ADICIONAR FOTO DE PERFIL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => setCurrentScreen("login")}
          >
            <Text style={styles.mainButtonText}>SALVAR CADASTRO</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => {/* Navegar para Login */}}>
            <Text style={styles.linkText}>
              Já tem uma conta? <Text style={styles.linkSpan}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  containerDark: {
    flex: 1,
    backgroundColor: "#0f1111", // Fundo do HTML
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  loginForm: {
    backgroundColor: "#1a1d1d", // Fundo do Card
    padding: 35,
    borderRadius: 20, // Arredondado igual ao HTML
    borderTopWidth: 6,
    borderTopColor: "#ff8c00", // Laranja do Vizzo
    // Sombra para dar profundidade
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 35,
    elevation: 10,
  },
  loginTitle: { 
    color: "white", 
    fontSize: 22, 
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center' 
  },
  inputLabel: {
    color: "#e0e0e0",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: "#252828", // Cor de fundo do input
    borderWidth: 1.5,
    borderColor: "#353838",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    color: "white",
    fontSize: 14,
  },
  fotoBotao: {
    height: 60,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ff8c00", // Pontilhado em laranja para destacar
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "rgba(255, 140, 0, 0.05)", // Leve fundo laranja
  },
  fotoBotaoText: {
    color: "#ff8c00",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  mainButton: {
    backgroundColor: "#2d79f3", // Azul do botão principal
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    // Efeito de brilho suave
    shadowColor: "#2d79f3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  linkText: {
    textAlign: 'center',
    color: '#b0b0b0',
    fontSize: 14,
  },
  linkSpan: {
    color: '#2d79f3',
    fontWeight: 'bold',
  }
});