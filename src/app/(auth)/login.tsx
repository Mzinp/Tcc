import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router"; 
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import ArrowBack from '@/components/ArrowVoltar'; // Importando a seta de voltar

export default function Login() {
  const router = useRouter();
  
  // App agora é fixo no Dark Mode conforme pedido
  const isDark = true; 
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para a mensagem de boas-vindas bonita
  const [msgVisible, setMsgVisible] = useState(false);
  const [msgTexto, setMsgTexto] = useState("");
  const [msgTipo, setMsgTipo] = useState<"success" | "error">("success");

  const theme = {
    bg: "#0f1111",
    card: "#1a1d1d",
    input: "#252828",
    border: "#353838",
    text: "#ffffff",
  };

  // Função para mostrar a mensagem e redirecionar
  function mostrarAviso(texto: string, tipo: "success" | "error" = "success") {
    setMsgTexto(texto);
    setMsgTipo(tipo);
    setMsgVisible(true);
    
    // Fecha sozinho após 2 segundos
    setTimeout(() => {
      setMsgVisible(false);
      if (tipo === "success") {
        router.replace("/(main)/(tabs)/home");
      }
    }, 2000);
  }

  async function handleLogin() {
    if (!email || !senha) {
      mostrarAviso("Preencha todos os campos", "error");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (authError) {
        mostrarAviso("E-mail ou senha incorretos", "error");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Buscando a coluna "nome" de cada tabela
      const [resAdmin, resMorador] = await Promise.all([
        supabase.from("tb_administrador").select("nome").eq("id_administrador", userId).maybeSingle(),
        supabase.from("tb_morador").select("nome").eq("id_morador", userId).maybeSingle()
      ]);

      if (resAdmin.data || resMorador.data) {
        let nomeUsuario = "";

        if (resAdmin.data && resAdmin.data.nome) {
          nomeUsuario = resAdmin.data.nome.split(" ")[0];
        } else if (resMorador.data && resMorador.data.nome) {
          nomeUsuario = resMorador.data.nome.split(" ")[0];
        } else {
          nomeUsuario = resAdmin.data ? "Administrador" : "Morador";
        }

        mostrarAviso(`Seja bem-vindo, ${nomeUsuario}!`, "success");
      } else {
        mostrarAviso("Perfil não encontrado no sistema", "error");
        setLoading(false);
      }
      
    } catch (err) {
      console.log(err);
      mostrarAviso("Erro na conexão com o servidor", "error");
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      {/* Botão de voltar flutuante no topo esquerdo da tela */}
      <View style={styles.backButtonContainer}>
        <ArrowBack cor={theme.text} />
      </View>

      {/* Modal de Mensagem Customizada (Substitui o Alert) */}
      <Modal transparent visible={msgVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.toast, { borderLeftColor: msgTipo === "success" ? "#4caf50" : "#f44336" }]}>
            <Ionicons 
              name={msgTipo === "success" ? "checkmark-circle" : "alert-circle"} 
              size={24} 
              color={msgTipo === "success" ? "#4caf50" : "#f44336"} 
            />
            <Text style={styles.toastText}>{msgTexto}</Text>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={[styles.loginForm, { backgroundColor: theme.card }]}>
          <Text style={styles.brandTitle}>VIZZO</Text>
          <Text style={[styles.loginTitle, { color: theme.text }]}>
            Login de Acesso
          </Text>

          <Text style={[styles.inputLabel, { color: "#e0e0e0" }]}>E-MAIL</Text>
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

          <Text style={[styles.inputLabel, { color: "#e0e0e0" }]}>SENHA</Text>
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
          // ... abaixo do TextInput da senha
<TouchableOpacity 
  onPress={() => router.push("/(auth)/forgotPassword")} 
  style={{ alignSelf: 'flex-end', marginBottom: 20 }}
>
  <Text style={{ color: '#8b8e98', fontSize: 12 }}>Esqueceu sua senha?</Text>
</TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.mainButtonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButtonContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  centerContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
  loginForm: {
    padding: 35,
    borderRadius: 20,
    borderTopWidth: 6,
    borderTopColor: "#ff8c00",
    elevation: 20,
  },
  brandTitle: {
    color: "#ff8c00",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 5,
  },
  loginTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
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
    marginTop: 10,
  },
  mainButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  
  // Estilos do novo Toast
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    backgroundColor: '#1a1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 5,
    width: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  }
});