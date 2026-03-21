import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";


export default function Login() {
  const [currentScreen, setCurrentScreen] = useState("home");
  return (
    <View style={styles.containerDark}>
      <View style={styles.centerContent}>
        <View style={styles.loginForm}>
          <Text>VISUALLINE.</Text>
          <Text style={styles.loginTitle}>Login de Acesso</Text>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#555"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            placeholderTextColor="#555"
          />
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => setCurrentScreen("vendas")}
          >
            <Text style={styles.mainButtonText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  loginTitle: {
    color: "white",
    fontSize: 22,
    marginBottom: 30,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    color: "white",
    paddingVertical: 12,
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
