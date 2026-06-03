import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/consts/colors";
import DateTimePicker from '@react-native-community/datetimepicker'; // Importando o Calendário
import { useAppTheme } from "@/context/ThemeContext"; // Importando o hook do tema global

// Seus componentes
import ArrowBack from '@/components/ArrowVoltar';
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";

export default function CadastroReserva() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const { theme } = useAppTheme(); // Injetando o cérebro do tema global de forma reativa
  
  const [loading, setLoading] = useState(false);
  const [precoArea, setPrecoArea] = useState(0);
  
  // Estados do formulário
  const [dataObjeto, setDataObjeto] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [dataFormatada, setDataFormatada] = useState("");
  
  const [horario, setHorario] = useState("");
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    // Busca Preço Real da Área no Banco
    try {
        const { data, error } = await supabase
            .from('tb_area_comum')
            .select('valor_reserva')
            .eq('id_area', params.areaId)
            .single();
        
        if (data) setPrecoArea(data.valor_reserva || 0);
    } catch (e) {
        console.log("Erro ao buscar preço");
    }
  }

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowCalendar(false); // Fecha o calendário
    if (selectedDate) {
      setDataObjeto(selectedDate);
      // Formata para exibição visual (DD/MM/AAAA)
      const dia = String(selectedDate.getDate()).padStart(2, '0');
      const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const ano = selectedDate.getFullYear();
      setDataFormatada(`${dia}/${mes}/${ano}`);
    }
  };

  async function handleSalvarReserva() {
    if (!dataFormatada || !horario) {
      Alert.alert("Atenção", "Preencha a data e o horário.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. VERIFICAÇÃO DE DISPONIBILIDADE
      const dataParaBanco = dataObjeto.toISOString().split('T')[0]; // Converte para YYYY-MM-DD

      const { data: conflito } = await supabase
        .from('tb_reserva')
        .select('id_reserva')
        .eq('id_area', params.areaId)
        .eq('data_reserva', dataParaBanco)
        .neq('status', 'Recusado')
        .maybeSingle();

      if (conflito) {
        Alert.alert("Data Ocupada", "Este espaço já está reservado para este dia.");
        setLoading(false);
        return;
      }

      // 2. BUSCA ID DO CONDOMÍNIO
      const { data: areaInfo } = await supabase
        .from('tb_area_comum')
        .select('id_condominio')
        .eq('id_area', params.areaId)
        .single();

      // 3. SALVA A RESERVA
      const { error } = await supabase.from('tb_reserva').insert([{
        id_morador: user?.id,
        id_condominio: areaInfo?.id_condominio,
        id_area: params.areaId,
        area_comum: params.areaNome, 
        data_reserva: dataParaBanco,
        horario: horario,
        valor_total: precoArea, 
        status: 'Pendente'
      }]);

      if (error) throw error;

      Alert.alert("Sucesso", "Sua reserva foi enviada para aprovação!");
      router.back();

    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao salvar reserva.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Nova Reserva</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>ESPAÇO SELECIONADO</Text>
          <View style={styles.areaBadge}>
            <Text style={styles.areaText}>{params.areaNome || "Área Comum"}</Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          {/* CAMPO DE DATA COM CALENDÁRIO */}
          <Text style={styles.label}>DATA DA RESERVA</Text>
          <TouchableOpacity 
            style={[styles.calendarTrigger, { backgroundColor: theme.card || theme.input, borderColor: theme.border }]} 
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.calendarText, { color: dataFormatada ? theme.text : theme.subText }]}>
              {dataFormatada || "Selecionar data no calendário"}
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <DateTimePicker
              value={dataObjeto}
              mode="date"
              display="calendar"
              minimumDate={new Date()} // Não permite reservar datas passadas
              onChange={onChangeDate}
            />
          )}

          <InputField 
            label="HORÁRIO"
            placeholder="Ex: 14:00 às 22:00"
            value={horario}
            onChangeText={setHorario}
            icon="time-outline"
          />

          <InputField 
            label="OBSERVAÇÕES (OPCIONAL)"
            placeholder="Ex: Aniversário..."
            value={observacao}
            onChangeText={setObservacao}
            icon="document-text-outline"
            multiline
          />
        </View>

        {/* RESUMO DO PREÇO DINÂMICO */}
        <View style={[styles.priceCard, { backgroundColor: theme.card || theme.input, borderColor: theme.border }]}>
            <View>
                <Text style={[styles.priceLabel, { color: theme.subText }]}>Valor do Espaço</Text>
                <Text style={[styles.priceValue, { color: COLORS.primary }]}>R$ {precoArea.toFixed(2)}</Text>
            </View>
            <Ionicons name="cash-outline" size={30} color={COLORS.primary} />
        </View>

        <View style={{ marginTop: 30 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <PrimaryButton 
              title="CONFIRMAR RESERVA" 
              onPress={handleSalvarReserva} 
            />
          )}
        </View>

        <Text style={[styles.footerNote, { color: theme.subText }]}>
          *A reserva está sujeita a aprovação do síndico. O valor será incluído no próximo boleto do condomínio.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 25 },
  infoBox: { marginBottom: 10 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.primary, marginBottom: 8, letterSpacing: 1 },
  areaBadge: { backgroundColor: 'rgba(45, 121, 243, 0.1)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  areaText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  
  // Estilos do acionador do calendário
  calendarTrigger: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 15, 
    borderWidth: 1, 
    marginBottom: 25 
  },
  calendarText: { marginLeft: 12, fontSize: 16 },

  // Card de Preço
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10
  },
  priceLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  priceValue: { fontSize: 22, fontWeight: 'bold' },

  footerNote: { textAlign: 'center', fontSize: 12, marginTop: 25, lineHeight: 18, paddingHorizontal: 10 }
});