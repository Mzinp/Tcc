import { useRouter } from "expo-router";
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
  Alert,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons"; // Importamos os ícones para o Checkbox!
import { FormularioSelecaoNative } from "@components/input/autoCompletar";


export default function CadastroMorador() {
  const router = useRouter();

  // States do Morador
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [bloco, setBloco] = useState("");
  const [codigoCondominio, setCodigoCondominio] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!nome || !email || !cpf || !senha || !codigoCondominio) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);

    try {
      // 1. Validar se o código do condomínio existe
      const { data: condoData, error: condoError } = await supabase
        .from("tb_condominio")
        .select("id_condominio")
        .eq("codigo_acesso", codigoCondominio.toUpperCase().trim())
        .single();

      if (condoError || !condoData) {
        Alert.alert("Erro", "Código de condomínio não encontrado. Verifique com seu síndico.");
        setLoading(false);
        return;
      }

      // 2. Criar o login no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      });

      // TRATAMENTO DE ERRO SEGURO
      if (authError) {
        if (authError.message.includes("already registered")) {
          Alert.alert(
            "Conta Existente",
            "Este e-mail já está cadastrado no Vizzo.",
            [
              { text: "Fazer Login", onPress: () => router.push("/(auth)/login") },
              { text: "Tentar outro", style: "cancel" }
            ]
          );
        } else {
          Alert.alert("Erro no cadastro", authError.message);
        }
        setLoading(false);
        return;
      }

      // 3. Salvar na tb_morador com o ID do condomínio encontrado
      if (authData?.user) {
        const { error: dbError } = await supabase.from("tb_morador").insert([
          {
            id_morador: authData.user.id,
            nome,
            cpf: cpf.replace(/\D/g, ""),
            apartamento,
            bloco,
            id_condominio: condoData.id_condominio,
          },
        ]);

        if (dbError) {
          Alert.alert("Erro ao salvar dados", dbError.message);
          setLoading(false);
          return;
        }

        // Desloga o usuário para forçar o primeiro login manual (Segurança)
        await supabase.auth.signOut();

        // 4. REDIRECIONAMENTO PARA A TELA DE SUCESSO (E DEPOIS LOGIN)
        router.replace({
          pathname: "/(main)/(modal)/sucesso",
          params: {
            mensagem: "Conta criada com sucesso! Faça login para continuar.",
            proximaTela: "/(auth)/login"
          }
        });
      }
    } catch (error: any) {
      Alert.alert("Erro no Cadastro", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Olá, Morador!</Text>
        <Text style={styles.subtitle}>Crie sua conta para acessar o Vizzo do seu prédio.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>CÓDIGO DO CONDOMÍNIO</Text>
<FormularioSelecaoNative

  value={codigoCondominio}

  onChangeText={setCodigoCondominio}

  placeholder="Ex: VIZZO-0001"

  placeholderTextColor="#666"

  autoCapitalize="characters"

  estiloInputExterno={[
    styles.input,
    { borderColor: "#2d79f3" }
  ]}

  estiloListaExterna={{
    backgroundColor: "#1a1d1d"
  }}

  estiloItemExterno={{
    borderBottomColor: "#353838"
  }}

  estiloTextoItemExterno={{
    color: "#fff"
  }}
/>

          <Text style={styles.label}>NOME COMPLETO</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#666"
            value={nome}
            onChangeText={setNome}
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>APTO</Text>
              <TextInput
                style={styles.input}
                placeholder="101"
                placeholderTextColor="#666"
                value={apartamento}
                onChangeText={setApartamento}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>BLOCO</Text>
              <TextInput
                style={styles.input}
                placeholder="A"
                placeholderTextColor="#666"
                value={bloco}
                onChangeText={setBloco}
              />
            </View>
          </View>

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            placeholderTextColor="#666"
            value={cpf}
            onChangeText={setCpf}
          />

          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            autoCapitalize="none"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            placeholderTextColor="#666"
            value={senha}
            onChangeText={setSenha}
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
            disabled={loading} // O botão continua clicável para dar o alerta se a pessoa não marcar a caixa!
          >
            <Text style={styles.buttonText}>{loading ? "PROCESSANDO..." : "CRIAR MINHA CONTA"}</Text>
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
  subtitle: { color: "#2d79f3", fontSize: 14, marginBottom: 30, fontWeight: "500" },
  form: { gap: 5 },
  label: { color: "#8b8e98", fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 5 },
  input: { backgroundColor: "#1a1d1d", borderWidth: 1, borderColor: "#353838", borderRadius: 12, height: 55, paddingHorizontal: 15, color: "#fff", marginBottom: 15 },

  /* ESTILOS NOVOS DO CHECKBOX */
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginTop: 5, marginBottom: 15, paddingRight: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#353838", backgroundColor: "#1a1d1d", justifyContent: "center", alignItems: "center", marginRight: 12 },
  checkboxAtivo: { backgroundColor: "#2d79f3", borderColor: "#2d79f3" },
  checkboxText: { color: "#8b8e98", fontSize: 12, lineHeight: 18, flex: 1 },
  linkText: { color: "#2d79f3", fontWeight: "bold" },

  button: { backgroundColor: "#2d79f3", height: 60, borderRadius: 15, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});