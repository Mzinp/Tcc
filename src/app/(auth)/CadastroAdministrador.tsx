import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons"; // Importação do ícone para o Checkbox

export default function CadastroAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // States do Formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");
  const [senha, setSenha] = useState("");
  
  // NOVO: Estado para controlar a aceitação dos termos (LGPD)
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Função para CPF: 000.000.000-00
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

// Função para Telefone: (00) 00000-0000
const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

// Função para CNPJ: 00.000.000/0000-00
const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "") // Remove tudo que não é número
    .replace(/^(\d{2})(\d)/, "$1.$2") // Coloca ponto após os 2 primeiros números
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3") // Coloca ponto após os 5 primeiros
    .replace(/\.(\d{3})(\d)/, ".$1/$2") // Coloca a barra após os 8 primeiros
    .replace(/(\d{4})(\d)/, "$1-$2") // Coloca o hífen após os 12 primeiros
    .replace(/(-\d{2})\d+?$/, "$1"); // Limita em 14 números (formatados)
};

// No seu TextInput de CPF, use assim:
<TextInput
  value={cpf}
  onChangeText={(text) => setCpf(maskCPF(text))}
  maxLength={14}
  keyboardType="numeric"
/>

  async function handleCadastro() {
    // NOVA TRAVA: Verificação da LGPD antes de qualquer coisa
    if (!aceitouTermos) {
      Alert.alert(
        "Termos Obrigatórios", 
        "Para prosseguir, você precisa ler e concordar com os Termos de Uso e Política de Privacidade."
      );
      return;
    }

    // 1. Validação de campos vazios
    if (!nome || !email || !cpf || !cargo || !senha) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha todos os campos obrigatórios!",
      );
      return;
    }

    setLoading(true);

    try {
      // 2. Criar o login no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      });

      // Se der erro no Auth (ex: e-mail já cadastrado)
      if (authError) {
        setLoading(false); // Libera o botão
        if (authError.message.includes("already registered")) {
          Alert.alert(
            "Conta Existente",
            "Este e-mail já está cadastrado. Tente fazer login.",
          );
        } else {
          Alert.alert("Erro no Cadastro", authError.message);
        }
        return;
      }

      // 3. Salvar os dados na tabela tb_administrador
      if (authData?.user) {
        const { error: dbError } = await supabase
          .from("tb_administrador")
          .insert([
            {
              id_administrador: authData.user.id,
              nome: nome,
              email: email.trim(),
              cpf: cpf.replace(/\D/g, ""),
              telefone: telefone,
              cargo: cargo,
              id_condominio: null, // Será preenchido na tela de Criar Condomínio
            },
          ]);

        if (dbError) {
          setLoading(false); // Libera o botão
          console.error("Erro DB:", dbError);
          Alert.alert(
            "Erro ao salvar",
            "Não conseguimos salvar seus dados no banco.",
          );
          return;
        }

        // 4. Limpar a sessão e Redirecionar
        // Fazemos logOut porque o signUp loga automaticamente, mas queremos que ela faça login manual.
        await supabase.auth.signOut();

        setLoading(false); // Sucesso!

        // Redireciona direto para o Login
        router.replace("/(auth)/login");
      }
    } catch (error) {
      setLoading(false);
      console.error("Erro Crítico:", error);
      Alert.alert("Erro", "Ocorreu uma falha inesperada.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Novo Administrador</Text>
        <Text style={styles.subtitle}>
          Primeiro, crie sua conta pessoal de acesso.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>NOME COMPLETO</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Isabelly..."
            placeholderTextColor="#666"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor="#666"
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
          />

          <Text style={styles.label}>E-MAIL CORPORATIVO</Text>
          <TextInput
            style={styles.input}
            placeholder="adm@vizzo.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>CARGO</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Síndico ou Gerente"
            placeholderTextColor="#666"
            value={cargo}
            onChangeText={setCargo}
          />

          <Text style={styles.label}>TELEFONE</Text>
          <TextInput
            style={styles.input}
            placeholder="(11) 99999-9999"
            placeholderTextColor="#666"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          {/* NOVO: CHECKBOX DE TERMOS E CONDIÇÕES (LGPD) */}
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAceitouTermos(!aceitouTermos)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, aceitouTermos && styles.checkboxAtivo]}>
              {aceitouTermos && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>
              Li e concordo com os <Text style={styles.linkText}>Termos de Uso</Text> e <Text style={styles.linkText}>Política de Privacidade</Text>.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!aceitouTermos || loading) && { opacity: 0.5 }]}
            onPress={handleCadastro}
            disabled={loading} // Continua apenas bloqueando o loading para o Alerta de Termos funcionar
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>PRÓXIMO PASSO</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#0f1111" },
  container: { padding: 30, paddingTop: 60, paddingBottom: 60 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: {
    color: "#2d79f3",
    fontSize: 14,
    marginBottom: 30,
    fontWeight: "500",
  },
  form: { gap: 5 },
  label: {
    color: "#8b8e98",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#1a1d1d",
    borderWidth: 1,
    borderColor: "#353838",
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    color: "#fff",
    marginBottom: 15,
  },
  
  /* ESTILOS NOVOS DO CHECKBOX */
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginTop: 5, marginBottom: 15, paddingRight: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#353838", backgroundColor: "#1a1d1d", justifyContent: "center", alignItems: "center", marginRight: 12 },
  checkboxAtivo: { backgroundColor: "#2d79f3", borderColor: "#2d79f3" },
  checkboxText: { color: "#8b8e98", fontSize: 12, lineHeight: 18, flex: 1 },
  linkText: { color: "#2d79f3", fontWeight: "bold" },
  
  button: {
    backgroundColor: "#2d79f3",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});