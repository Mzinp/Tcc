import { useRouter } from "expo-router";
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
import { supabase } from "../lib/supabase";

export default function CadastroAdmin() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");
  // REMOVIDO: setIdCondominio (será feito na próxima tela)
  const [senha, setSenha] = useState("");

  async function handleCadastro() {
    // 1. Validação (Atualizada: removido idCondominio)
    if (!nome || !email || !cpf || !cargo || !senha) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha todos os campos obrigatórios!",
      );
      return;
    }

    // 2. Criar o login no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      Alert.alert("Erro no cadastro", authError.message);
      return;
    }

    // 3. Salvar os dados na tabela tb_administrador
    if (authData.user) {
      const { error: dbError } = await supabase
        .from("tb_administrador")
        .insert([
          {
            id_administrador: authData.user.id,
            nome,
            email,
            cpf: cpf.replace(/\D/g, ""),
            telefone,
            cargo,
            // O id_condominio fica nulo por enquanto até a próxima tela salvar
          },
        ]);

      if (dbError) {
        console.log(dbError);
        Alert.alert("Erro ao salvar dados", dbError.message);
      } else {
        Alert.alert(
          "Cadastro Pessoal Concluído!",
          "Agora, vamos registrar os dados do seu condomínio.",
          [
            {
              text: "Continuar",
              onPress: () => router.replace("/CriarCondominio")
            },
          ],
        );
      }
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

          <TouchableOpacity style={styles.button} onPress={handleCadastro}>
            <Text style={styles.buttonText}>PRÓXIMO PASSO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos permanecem os mesmos que você enviou...
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#0f1111" },
  container: { padding: 30, paddingTop: 60 },
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
  button: {
    backgroundColor: "#2d79f3",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
