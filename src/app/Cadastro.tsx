import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from "react-native";
import Navegacao from "@/components/Navegacao";

export default function Cadastro() {
  const [currentScreen, setCurrentScreen] = useState("home");
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.containerDark}>
      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={styles.loginForm}>
          <Text style={styles.loginTitle}>Novo Membro</Text>
          <Text style={styles.inputLabel}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="executivo@email.com"
            placeholderTextColor="#555"
          />
          <Text style={styles.inputLabel}>CELULAR</Text>
          <TextInput
            style={styles.input}
            placeholder="+55 (11) 99999-9999"
            placeholderTextColor="#555"
          />
          <TouchableOpacity style={styles.fotoBotao}>
            <Text style={{ color: "#c5a47e", letterSpacing: 1 }}>
              + ADICIONAR FOTO DE PERFIL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => setCurrentScreen("login")}
          >
            <Text style={styles.mainButtonText}>SALVAR CADASTRO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  containerDark: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  loginForm: {
    backgroundColor: "#1a1a1a",
    padding: 30,
    borderTopWidth: 2,
    borderTopColor: "#c5a47e",
  },
  loginTitle: { color: "white", fontSize: 22, marginBottom: 30 },
  inputLabel: {
    color: "#c5a47e",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    color: "white",
    paddingVertical: 12,
    marginBottom: 25,
  },
  fotoBotao: {
    height: 60,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  mainButton: {
    backgroundColor: "#c5a47e",
    padding: 18,
    alignItems: "center",
    marginBottom: 15,
  },
  mainButtonText: {
    color: "#0f0f0f",
    fontWeight: "bold",
    letterSpacing: 2,
    fontSize: 11,
  },
});
