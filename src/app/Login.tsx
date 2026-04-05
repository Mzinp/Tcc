import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Image 
} from "react-native";
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [isDark, setIsDark] = useState(true);

  // Carrega o tema salvo na memória
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema no Login");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    input: isDark ? "#252828" : "#f0f0f0",
    border: isDark ? "#353838" : "#dddddd",
    text: isDark ? "#ffffff" : "#0f1111",
    label: isDark ? "#8b8e98" : "#666666"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.loginForm, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDark ? 0 : 1 }]}>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require("../assets/img/logo.png")} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>

          <Text style={styles.brandTitle}>VIZZO</Text>
          <Text style={[styles.loginTitle, { color: theme.text }]}>Bem-vindo de volta</Text>

          <Text style={[styles.inputLabel, { color: theme.text }]}>E-MAIL OU CPF</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              placeholder="Digite seus dados" 
              placeholderTextColor="#555" 
              style={{ color: theme.text, flex: 1 }} 
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.text, marginTop: 15 }]}>SENHA</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              placeholder="••••••••" 
              placeholderTextColor="#555" 
              secureTextEntry 
              style={{ color: theme.text, flex: 1 }} 
            />
          </View>

          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={() => router.push("/home")}
          >
            <Text style={styles.mainButtonText}>ENTRAR</Text>
          </TouchableOpacity>

          <View style={styles.esqueciView}>
            <TouchableOpacity onPress={() => router.push("/EsqueciSenha")}>
              <Text style={styles.esqueciText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={{ marginTop: 30, alignItems: 'center' }} 
          onPress={() => router.push("/Cadastro")}
        >
          <Text style={{ color: theme.label, fontSize: 13 }}>
            Não tem conta? <Text style={{ color: "#2d79f3", fontWeight: 'bold' }}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
  loginForm: { 
    padding: 35, 
    borderRadius: 25, 
    borderTopWidth: 6, 
    borderTopColor: "#ff8c00", 
    elevation: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 15 
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 60,
  },
  brandTitle: { color: "#ff8c00", fontSize: 14, fontWeight: "800", letterSpacing: 4, textAlign: "center", marginBottom: 5 },
  loginTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  inputLabel: { fontSize: 11, fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
  inputContainer: { 
    borderWidth: 1.5, 
    borderRadius: 12, 
    height: 55, 
    paddingHorizontal: 15, 
    justifyContent: 'center' 
  },
  mainButton: { 
    backgroundColor: "#2d79f3", 
    padding: 18, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 30 
  },
  mainButtonText: { color: "#fff", fontWeight: "bold", letterSpacing: 1 },
  esqueciView: { marginTop: 25, alignItems: 'center' },
  esqueciText: { color: "#2d79f3", fontWeight: "600", fontSize: 14 }
});