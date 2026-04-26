import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router"; 
import { supabase } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    input: isDark ? "#252828" : "#ffffff",
    border: isDark ? "#353838" : "#dddddd",
    text: isDark ? "#ffffff" : "#0f1111",
  };

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      // 1. Autenticação no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (authError) {
        Alert.alert("Erro ao entrar", "E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 2. Busca o perfil para saber se é ADM ou Morador
      // Vamos tentar buscar em ambas as tabelas
      const [resAdmin, resMorador] = await Promise.all([
        supabase.from("tb_administrador").select("id_administrador").eq("id_administrador", userId).single(),
        supabase.from("tb_morador").select("id_morador").eq("id_morador", userId).single()
      ]);

      if (resAdmin.data || resMorador.data) {
        // Para o TCC, você pode até mostrar mensagens diferentes se quiser
        const tipo = resAdmin.data ? "Administrador" : "Morador";
        Alert.alert("Bem-vindo!", `Acesso ${tipo} realizado com sucesso!`);
        
        // REDIRECIONAMENTO PARA AS PASTAS NOVAS:
        // O caminho ignora os parênteses, então (main)/(tabs)/home vira apenas /home
        // Mas se der erro, tente o caminho completo: "/(main)/(tabs)/home"
        router.replace("/(main)/(tabs)/home"); 
      } else {
        Alert.alert("Aviso", "Usuário autenticado, mas perfil não encontrado nas tabelas de segurança.");
      }
      
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Ocorreu um problema ao identificar seu perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <ScrollView contentContainerStyle={styles.centerContent}>
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={() => setIsDark(!isDark)}
        >
          <Text style={{ color: "#2d79f3", fontWeight: "bold" }}>
            {isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
          </Text>
        </TouchableOpacity>

        <View style={[styles.loginForm, { backgroundColor: theme.card }]}>
          <Text style={styles.brandTitle}>VIZZO</Text>
          <Text style={[styles.loginTitle, { color: theme.text }]}>
            Login de Acesso
          </Text>

          <Text style={[styles.inputLabel, { color: isDark ? "#e0e0e0" : "#444444" }]}>
            E-MAIL
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput
              style={{ color: theme.text, flex: 1 }}
              placeholder="seu@email.com"
              placeholderTextColor="#8b8e98"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={[styles.inputLabel, { color: isDark ? "#e0e0e0" : "#444444" }]}>
            SENHA
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput
              style={{ color: theme.text, flex: 1 }}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor="#8b8e98"
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          <TouchableOpacity 
            style={[styles.mainButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.mainButtonText}>
              {loading ? "VERIFICANDO..." : "ENTRAR"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
  themeToggle: { alignSelf: "center", marginBottom: 20 },
  loginForm: {
    padding: 35,
    borderRadius: 20,
    borderTopWidth: 6,
    borderTopColor: "#ff8c00",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 10,
    height: 55,
    paddingHorizontal: 15,
    justifyContent: "center",
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: "#2d79f3",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  mainButtonText: { color: "white", fontWeight: "bold" },
});