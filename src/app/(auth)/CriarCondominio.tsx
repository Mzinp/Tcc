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
  ActivityIndicator
} from "react-native";
import { supabase } from "../../lib/supabase";

// === MÁSCARAS ===
const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

export default function CriarCondominio() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // States do Form
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  async function buscarCep(valor: string) {
    // 1. Aplica a máscara e salva no state (para aparecer na tela com o traço)
    const cepMascarado = maskCEP(valor);
    setCep(cepMascarado);

    // 2. Limpa a pontuação só para checar o tamanho e buscar na API
    const cepLimpo = cepMascarado.replace(/\D/g, "");

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (data.erro) {
          Alert.alert("Erro", "CEP não encontrado.");
          return;
        }

        setLogradouro(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setEstado(data.uf);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível buscar o CEP.");
      }
    }
  }

  async function handleSalvarCondominio() {
    if (!nome || !cnpj || !cep || !numero) {
      Alert.alert("Erro", "Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        router.replace("/(auth)/login");
        return;
      }

      const { data: condoData, error: condoError } = await supabase
        .from("tb_condominio")
        .insert([
          {
            nome_condominio: nome,
            cnpj: cnpj.replace(/\D/g, ""), // Salva limpo no banco
            cep: cep.replace(/\D/g, ""),   // Salva limpo no banco
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
          },
        ])
        .select() 
        .single();

      if (condoError) {
        throw new Error(condoError.message);
      }

      if (condoData) {
        const { error: updateError } = await supabase
          .from("tb_administrador")
          .update({ id_condominio: condoData.id_condominio })
          .eq("id_administrador", user.id);

        if (updateError) {
          console.error("Erro ao vincular:", updateError.message);
        }

        router.replace({
          pathname: "/(main)/(modal)/sucesso",
          params: { 
            mensagem: `Condomínio registrado!\nCódigo dos moradores: ${condoData.codigo_acesso}`,
            proximaTela: "/(auth)/login" 
          }
        });
        
        await supabase.auth.signOut();
      }

    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#0f1111" }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dados do Condomínio</Text>
        <Text style={styles.subtitle}>
          O endereço detalhado ajuda na localização e serviços.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>NOME DO CONDOMÍNIO *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Edifício Horizonte"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>CNPJ *</Text>
          <TextInput
            style={styles.input}
            value={cnpj}
            // MÁSCARA DO CNPJ APLICADA
            onChangeText={(texto) => setCnpj(maskCNPJ(texto))}
            maxLength={18}
            placeholder="00.000.000/0001-00"
            keyboardType="numeric"
            placeholderTextColor="#666"
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CEP *</Text>
              <TextInput
                style={styles.input}
                value={cep}
                onChangeText={buscarCep}
                placeholder="00000-000"
                keyboardType="numeric"
                maxLength={9} // 8 números + 1 traço
                placeholderTextColor="#666"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>NÚMERO *</Text>
              <TextInput
                style={styles.input}
                value={numero}
                onChangeText={setNumero}
                placeholder="123"
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <Text style={styles.label}>LOGRADOURO</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#151818" }]}
            value={logradouro}
            editable={false}
            placeholder="Rua/Avenida"
          />

          <Text style={styles.label}>COMPLEMENTO</Text>
          <TextInput
            style={styles.input}
            value={complemento}
            onChangeText={setComplemento}
            placeholder="Bloco B, Apto 10..."
            placeholderTextColor="#666"
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>BAIRRO</Text>
              <TextInput
                style={[styles.input, { backgroundColor: "#151818" }]}
                value={bairro}
                editable={false}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>UF</Text>
              <TextInput
                style={[styles.input, { backgroundColor: "#151818" }]}
                value={estado}
                editable={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSalvarCondominio}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>CRIAR CONDOMÍNIO</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, paddingTop: 60, paddingBottom: 60 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 5 },
  subtitle: { color: "#2d79f3", fontSize: 14, marginBottom: 30 },
  form: { gap: 5 },
  label: {
    color: "#8b8e98",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#1a1d1d",
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    color: "#fff",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#353838",
  },
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