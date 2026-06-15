import ArrowBack from "@/components/ArrowVoltar";
import { COLORS } from "@/consts/colors";
import { useAppTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

export default function CadastroOcorrencia() {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  async function handleEnviar() {
    if (!titulo || !descricao) {
      Alert.alert("Atenção", "Por favor, preencha o assunto e a descrição.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: morador } = await supabase
        .from("tb_morador")
        .select("id_morador, id_condominio")
        .eq("id_morador", user.id)
        .single();

      if (!morador) throw new Error("Perfil de morador não encontrado");

      // Inserção simplificada na tabela sem o campo foto_url
      const { error } = await supabase.from("tb_ocorrencias").insert([
        {
          id_condominio: morador.id_condominio,
          id_morador: morador.id_morador,
          titulo: titulo,
          descricao: descricao,
          status: "Aberto",
        },
      ]);

      if (error) throw error;

      router.push({
        pathname: "/(main)/(modal)/sucesso" as any,
        params: {
          mensagem: "Sua ocorrência foi enviada ao síndico com sucesso!",
        },
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível enviar sua ocorrência agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ArrowBack cor={theme.text} />
          <Text style={[styles.title, { color: theme.text }]}>
            Registrar Ocorrência
          </Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            Relate problemas ou incidentes no condomínio
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>ASSUNTO</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.input || theme.border,
                borderColor: theme.border,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ex: Vazamento no corredor, Barulho excessivo..."
              placeholderTextColor={theme.subText}
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          <Text style={styles.label}>DESCRIÇÃO DETALHADA</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.input || theme.border,
                borderColor: theme.border,
                height: 150,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                { color: theme.text, textAlignVertical: "top", paddingTop: 15 },
              ]}
              multiline
              numberOfLines={6}
              placeholder="Descreva o que aconteceu com o máximo de detalhes possível..."
              placeholderTextColor={theme.subText}
              value={descricao}
              onChangeText={setDescricao}
            />
          </View>

          <TouchableOpacity
            style={[styles.mainButton, loading && { opacity: 0.7 }]}
            onPress={handleEnviar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="white" />
                <Text style={styles.buttonText}>ENVIAR AO SÍNDICO</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.warningText, { color: theme.subText }]}>
            Sua ocorrência será registrada com seu nome e unidade para que o
            síndico possa entrar em contato.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  header: { paddingHorizontal: 25, paddingTop: 60, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "bold", marginTop: 15 },
  subtitle: { fontSize: 14, marginTop: 5 },
  form: { padding: 25 },
  label: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 1,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    minHeight: 55,
  },
  input: { flex: 1, fontSize: 15 },
  mainButton: {
    backgroundColor: COLORS.red,
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    letterSpacing: 1,
  },
  warningText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 20,
    lineHeight: 18,
  },
});
