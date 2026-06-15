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
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from 'expo-router';
import { supabase } from "@/lib/supabase"; 
import ArrowBack from '@/components/ArrowVoltar';
import { useAppTheme } from "@/context/ThemeContext"; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from "@/consts/colors";

export default function Visitantes() {
  const { theme } = useAppTheme(); 
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  
  // States do formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState(""); 
  const [tipoVisita, setTipoVisita] = useState<"Visita" | "Serviço" | "Delivery">("Visita");
  
  // States do Calendário
  const [dataObjeto, setDataObjeto] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      buscarHistorico();
    }, [])
  );

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

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowCalendar(Platform.OS === "ios"); 
    if (selectedDate) setDataObjeto(selectedDate);
  };

  async function buscarHistorico() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: morador } = await supabase
        .from('tb_morador')
        .select('id_morador')
        .eq('id_morador', user.id)
        .single();

      if (!morador) return;

      const { data, error } = await supabase
        .from("tb_visitante")
        .select("*")
        .eq("id_morador", morador.id_morador)
        .order("data_prevista", { ascending: false })
        .limit(10);

      if (data) setHistorico(data);
      if (error) throw error;
    } catch (error) {
      console.log("Erro ao buscar histórico:", error);
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
      if (!user) throw new Error("Sessão expirada");

      // 1. Pega os dados completos do morador (precisamos do id_condominio!)
      const { data: morador, error: errMorador } = await supabase
        .from('tb_morador')
        .select('id_morador, id_condominio')
        .eq('id_morador', user.id)
        .single();

      if (errMorador || !morador) {
        Alert.alert("Erro", "Apenas moradores podem liberar acessos.");
        setLoading(false);
        return;
      }

      // Prepara a data para o banco
      const dataParaBanco = dataObjeto.toISOString().split('T')[0];
      // Gera uma senha aleatória de 4 dígitos para a portaria
      const codigoAcesso = Math.floor(1000 + Math.random() * 9000).toString();

      // 2. Insere no banco
      const { error } = await supabase
        .from("tb_visitante")
        .insert([{
          id_morador: morador.id_morador,
          id_condominio: morador.id_condominio,
          nome_visitante: nome,
          cpf_visitante: cpf,
          data_prevista: dataParaBanco,
          tipo_visita: tipoVisita,
          codigo_acesso: codigoAcesso,
          status: "Autorizado"
        }]);

      if (error) throw error;

      // Sucesso!
      Alert.alert(
        "Acesso Liberado!", 
        `Código para portaria: #${codigoAcesso}\nAlerte seu visitante.`,
        [{ text: "OK", onPress: () => {
            setNome("");
            setCpf("");
            setDataObjeto(new Date());
            buscarHistorico();
            router.push({ pathname: "/(main)/(modal)/sucesso", params: { mensagem: "Visitante registrado com sucesso!" } });
        }}]
      );

    } catch (error: any) {
      Alert.alert("Erro no Banco", "Manda um salve pro Mateus verificar as colunas novas da tabela tb_visitante!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Helpers para o visual
  const dataExibicao = dataObjeto.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getTipoColor = (tipo: string) => {
    if (tipo === "Delivery") return COLORS.orange || "#FF9500";
    if (tipo === "Serviço") return COLORS.purple || "#5856D6";
    return theme.primary; // Visita
  };

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
            <Ionicons name="person-add-outline" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nova Autorização</Text>
          </View>

          {/* Seleção de Categoria */}
          <View style={styles.categoryRow}>
            {["Visita", "Delivery", "Serviço"].map((cat) => (
              <TouchableOpacity 
                key={cat}
                style={[
                  styles.categoryPill, 
                  tipoVisita === cat ? { backgroundColor: getTipoColor(cat) } : { backgroundColor: theme.input || theme.border }
                ]}
                onPress={() => setTipoVisita(cat as any)}
              >
                <Text style={[
                  styles.categoryText, 
                  { color: tipoVisita === cat ? "white" : theme.subText }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.primary }]}>NOME DO VISITANTE</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.input || theme.border, borderColor: theme.border }]}>
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
              <Text style={[styles.label, { color: theme.primary }]}>CPF</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.input || theme.border, borderColor: theme.border }]}>
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
              <Text style={[styles.label, { color: theme.primary }]}>DATA</Text>
              <TouchableOpacity 
                style={[styles.inputWrapper, { backgroundColor: theme.input || theme.border, borderColor: theme.border, justifyContent: 'center' }]}
                onPress={() => setShowCalendar(true)}
              >
                <Text style={{ color: theme.text, fontSize: 14 }}>{dataExibicao}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showCalendar && (
            <DateTimePicker
              value={dataObjeto}
              mode="date"
              minimumDate={new Date()}
              display="default"
              onChange={onChangeDate}
            />
          )}

          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
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
          
          {historico.length === 0 && (
            <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 10 }}>Nenhum acesso recente.</Text>
          )}

          {historico.map((item) => (
            <View key={item.id_visitante} style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.historyAvatar, { backgroundColor: "rgba(45, 121, 243, 0.1)" }]}>
                <Ionicons 
                  name={item.tipo_visita === 'Delivery' ? 'fast-food' : item.tipo_visita === 'Serviço' ? 'hammer' : 'person'} 
                  size={20} 
                  color={getTipoColor(item.tipo_visita || 'Visita')} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.historyName, { color: theme.text }]} numberOfLines={1}>
                    {item.nome_visitante}
                  </Text>
                  {item.codigo_acesso && (
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.primary }}>#{item.codigo_acesso}</Text>
                  )}
                </View>
                <Text style={[styles.historyMeta, { color: theme.subText }]}>
                  {item.tipo_visita || 'Visita'} • {new Date(item.data_prevista).toLocaleDateString('pt-BR')}
                </Text>
              </View>
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
  header: { paddingHorizontal: 25, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  formCard: { marginHorizontal: 20, padding: 22, borderRadius: 28, borderWidth: 1, elevation: 5, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginLeft: 10 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  categoryPill: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  categoryText: { fontSize: 12, fontWeight: 'bold' },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1.2 },
  inputWrapper: { borderRadius: 15, borderWidth: 1, height: 55, paddingHorizontal: 15, marginBottom: 18 },
  input: { flex: 1, fontSize: 15 },
  row: { flexDirection: 'row' },
  mainButton: { padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
  historySection: { paddingHorizontal: 25, marginTop: 30 },
  historyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, marginBottom: 12, borderWidth: 1 },
  historyAvatar: { width: 45, height: 45, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  historyName: { fontSize: 16, fontWeight: 'bold', flex: 1, paddingRight: 10 },
  historyMeta: { fontSize: 12, marginTop: 3 }
});