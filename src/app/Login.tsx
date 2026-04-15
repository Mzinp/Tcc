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
    bg: isDark ? "#0f1111" : "#ffffff", // Branco Puro
    card: isDark ? "#1a1d1d" : "#ffffff",
    input: isDark ? "#252828" : "#f9f9f9", // Um cinza quase branco para os inputs
    border: isDark ? "#353838" : "#eeeeee",
    text: isDark ? "#ffffff" : "#0f1111",
    label: isDark ? "#8b8e98" : "#666666"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.loginForm, { 
          backgroundColor: theme.card, 
          borderColor: theme.border, 
          borderWidth: isDark ? 0 : 1,
          shadowOpacity: isDark ? 0.3 : 0.05 
        }]}>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require("../assets/img/logo.png")} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>

          <Text style={styles.brandTitle}>VIZZO</Text>
          <Text style={[styles.loginTitle, { color: theme.text }]}>Bem-vindo de volta</Text>

          <Text style={[styles.inputLabel, { color: theme.label }]}>E-MAIL OU CPF</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              placeholder="Digite seus dados" 
              placeholderTextColor="#888" 
              style={{ color: theme.text, flex: 1, fontSize: 14 }} 
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.label, marginTop: 15 }]}>SENHA</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              placeholder="••••••••" 
              placeholderTextColor="#888" 
              secureTextEntry 
              style={{ color: theme.text, flex: 1, fontSize: 14 }} 
            />
          </View>

          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={() => router.replace("/home")} // Use replace para login
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>ENTRAR NO VIZZO</Text>
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
          <Text style={{ color: theme.label, fontSize: 14 }}>
            Não tem uma conta? <Text style={{ color: "#2d79f3", fontWeight: 'bold' }}>Cadastre-se aqui</Text>
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
    borderRadius: 30, // Mais arredondado para um look moderno
    borderTopWidth: 6, 
    borderTopColor: "#ff8c00", 
    elevation: 8, 
    shadowColor: "#000", 
    shadowRadius: 15 
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 110,
    height: 55,
  },
  brandTitle: { color: "#ff8c00", fontSize: 12, fontWeight: "900", letterSpacing: 5, textAlign: "center", marginBottom: 5 },
  loginTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  inputLabel: { fontSize: 10, fontWeight: "700", marginBottom: 8, letterSpacing: 1 },
  inputContainer: { 
    borderWidth: 1, 
    borderRadius: 15, 
    height: 55, 
    paddingHorizontal: 15, 
    justifyContent: 'center' 
  },
  mainButton: { 
    backgroundColor: "#2d79f3", 
    padding: 18, 
    borderRadius: 15, 
    alignItems: "center", 
    marginTop: 30,
    elevation: 4
  },
  mainButtonText: { color: "#fff", fontWeight: "bold", letterSpacing: 1.5, fontSize: 14 },
  esqueciView: { marginTop: 25, alignItems: 'center' },
  esqueciText: { color: "#2d79f3", fontWeight: "600", fontSize: 13 }
});