import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from 'expo-router';
import { supabase } from "@/lib/supabase"; 
import ArrowBack from '@/components/ArrowVoltar';

export default function Visitantes() {
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  
  // States do formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState(""); 
  const [dataVisita, setDataVisita] = useState("");

  // Tema Full Black Fixo para o TCC
  const theme = {
    bg: "#0f1111",
    card: "#1a1d1d",
    text: "#ffffff",
    subText: "#8b8e98",
    input: "#252828",
    border: "#252828",
    accent: "#2d79f3"
  };

  useFocusEffect(
    React.useCallback(() => {
      buscarHistorico();
    }, [])
  );

  // Validação Matemática de CPF
  const validarCPF = (valor: string) => {
    valor = valor.replace(/[^\d]+/g, '');
    if (valor.length !== 11 || !!valor.match(/(\d)\1{10}/)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(valor.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(valor.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(valor.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(valor.substring(10, 11))) return false;
    return true;
  };

  const aplicarMascaraCPF = (value: string) => {
    return value
      .replace(/\D/g, '') 
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  async function buscarHistorico() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tb_visitante")
        .select("*")
        .eq("id_morador", user.id)
        .order("id_visitante", { ascending: false })
        .limit(10);

      if (data) setHistorico(data);
      if (error) console.error("Erro ao buscar:", error.message);
    } catch (error) {
      console.log("Erro de conexão:", error);
    }
  }

  async function handleLiberarAcesso() {
    if (!nome || !cpf) {
      Alert.alert("Atenção", "Preencha o nome e o CPF.");
      return;
    }

    if (!validarCPF(cpf)) {
      Alert.alert("CPF Inválido", "Informe um CPF real para autorização.");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dataFinal = dataVisita || new Date().toLocaleDateString('pt-BR');

      const { error } = await supabase
        .from("tb_visitante")
        .insert([{
          id_morador: user.id,
          nome_visitante: nome,
          cpf_visitante: cpf,
          data_prevista: dataFinal,
          status: "Autorizado"
        }]);

      if (error) throw error;

      // Limpa os campos e atualiza a lista antes de ir para a tela de sucesso
      setNome("");
      setCpf("");
      setDataVisita("");
      await buscarHistorico();

      router.push({ 
        pathname: "/(main)/(modal)/sucesso", 
        params: { 
          mensagem: "A portaria recebeu a autorização!",
          proximaTela: "/(main)/(tabs)/home" 
        } 
      });

    } catch (error: any) {
      Alert.alert("Erro no Banco", "Verifique os nomes das tabelas com a Isa.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topHeader}>
        <ArrowBack cor={theme.text} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Visitantes</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Autorize acessos à sua unidade</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-add-outline" size={20} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nova Autorização</Text>
          </View>

          <Text style={[styles.label, { color: theme.accent }]}>NOME DO VISITANTE</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              style={[styles.input, { color: theme.text }]} 
              placeholder="Ex: João Silva" 
              placeholderTextColor={theme.subText}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1.5, marginRight: 10 }}>
              <Text style={[styles.label, { color: theme.accent }]}>CPF</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  placeholder="000.000.000-00" 
                  keyboardType="numeric"
                  maxLength={14}
                  placeholderTextColor={theme.subText} 
                  value={cpf}
                  onChangeText={(t) => setCpf(aplicarMascaraCPF(t))}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.accent }]}>DATA</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  placeholder="Hoje" 
                  placeholderTextColor={theme.subText}
                  value={dataVisita}
                  onChangeText={setDataVisita}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: theme.accent }, loading && { opacity: 0.7 }]}
            onPress={handleLiberarAcesso}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Ionicons name="shield-checkmark" size={18} color="white" />
                <Text style={styles.buttonText}>LIBERAR ACESSO</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>Recentes</Text>
          
          {historico.map((item) => (
            <View key={item.id_visitante} style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.historyAvatar, { backgroundColor: "#1e2b3c" }]}>
                <Ionicons name="person" size={20} color={theme.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.historyName, { color: theme.text }]}>{item.nome_visitante}</Text>
                <Text style={[styles.historyMeta, { color: theme.subText }]}>
                  {item.cpf_visitante} • {item.data_prevista}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color="#2ecc71" />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingTop: 60, paddingHorizontal: 15 },
  scrollContent: { paddingBottom: 120 },
  header: { paddingHorizontal: 25, marginBottom: 25 },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  formCard: { marginHorizontal: 20, padding: 22, borderRadius: 28, borderWidth: 1, elevation: 5 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginLeft: 10 },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1.2 },
  inputWrapper: { borderRadius: 15, borderWidth: 1, height: 55, paddingHorizontal: 15, justifyContent: 'center', marginBottom: 18 },
  input: { flex: 1, fontSize: 15 },
  row: { flexDirection: 'row' },
  mainButton: { padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
  historySection: { paddingHorizontal: 25, marginTop: 35 },
  historyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, marginBottom: 12, borderWidth: 1 },
  historyAvatar: { width: 45, height: 45, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  historyName: { fontSize: 16, fontWeight: 'bold' },
  historyMeta: { fontSize: 12, marginTop: 3 }
});