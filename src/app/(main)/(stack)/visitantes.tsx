import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';

export default function Visitantes() {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  
  // States do formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState(""); 
  const [dataVisita, setDataVisita] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        const salvo = await AsyncStorage.getItem('@vizzo_theme');
        if (salvo !== null) setIsDark(salvo === 'dark');
      };
      carregarTema();
      buscarHistorico();
    }, [])
  );

  // Validação Matemática de CPF (Segurança da Informação)
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

      const { data } = await supabase
        .from("tb_visitante")
        .select("*")
        .eq("id_morador", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setHistorico(data);
    } catch (error) {
      console.log("Erro ao buscar histórico:", error);
    }
  }

  async function handleLiberarAcesso() {
    if (!nome || !cpf) {
      Alert.alert("Atenção", "Preencha o nome e o CPF do visitante.");
      return;
    }

    if (!validarCPF(cpf)) {
      Alert.alert("CPF Inválido", "O número de CPF informado não é real.");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("tb_visitante")
        .insert([{
          id_morador: user.id,
          nome_visitante: nome,
          cpf_visitante: cpf, // Nome da coluna atualizado
          data_prevista: dataVisita || "Hoje",
          status: "Autorizado"
        }]);

      if (error) throw error;

      router.push({ 
        pathname: "/(main)/(modal)/sucesso", 
        params: { mensagem: "A portaria recebeu a autorização!" } 
      });

    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    input: isDark ? COLORS.dark.input : COLORS.light.input,
    border: isDark ? COLORS.dark.border : COLORS.light.border,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topHeader}>
        <ArrowBack cor={theme.text} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Visitantes</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Gerencie e autorize acessos à sua unidade</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nova Autorização</Text>
          </View>

          <Text style={styles.label}>NOME DO VISITANTE</Text>
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
              <Text style={styles.label}>CPF</Text>
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
              <Text style={styles.label}>DATA</Text>
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
            style={[styles.mainButton, loading && { opacity: 0.7 }]}
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
              <View style={styles.historyAvatar}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.historyName, { color: theme.text }]}>{item.nome_visitante}</Text>
                <Text style={[styles.historyMeta, { color: theme.subText }]}>{item.cpf_visitante} • {item.data_prevista}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
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
  scrollContent: { paddingBottom: 50 },
  header: { paddingHorizontal: 25, marginVertical: 20 },
  title: { fontSize: 30, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 5 },
  formCard: { marginHorizontal: 20, padding: 20, borderRadius: 25, borderWidth: 1, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  label: { color: COLORS.primary, fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  inputWrapper: { borderRadius: 12, borderWidth: 1, height: 50, paddingHorizontal: 15, justifyContent: 'center', marginBottom: 15 },
  input: { flex: 1, fontSize: 14 },
  row: { flexDirection: 'row' },
  mainButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
  historySection: { paddingHorizontal: 25, marginTop: 30 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 18, marginBottom: 10, borderWidth: 1 },
  historyAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(45, 121, 243, 0.1)', justifyContent: 'center', alignItems: 'center' },
  historyName: { fontSize: 15, fontWeight: 'bold' },
  historyMeta: { fontSize: 12, marginTop: 2 }
});