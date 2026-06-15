import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  Platform 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/consts/colors";
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { useAppTheme } from "@/context/ThemeContext"; 
import ArrowBack from '@/components/ArrowVoltar';
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";

export default function CadastroReserva() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const { theme } = useAppTheme(); 
  
  const [loading, setLoading] = useState(false);
  const [detalhesArea, setDetalhesArea] = useState<any>(null);
  
  // Data e Horários
  const [dataObjeto, setDataObjeto] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeInicio, setShowTimeInicio] = useState(false);
  const [showTimeFim, setShowTimeFim] = useState(false);
  
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    try {
        const { data } = await supabase
            .from('tb_area_comum')
            .select('*')
            .eq('id_area', params.areaId)
            .single();
        if (data) setDetalhesArea(data);
    } catch (e) {
        console.log("Erro ao buscar detalhes da área");
    }
  }

  // Cálculo Dinâmico
  const diffMs = horaFim.getTime() - horaInicio.getTime();
  const diffHoras = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  const valorPorHora = detalhesArea?.tipo_cobranca === 'Hora' ? (detalhesArea?.valor_reserva * diffHoras) : detalhesArea?.valor_reserva;
  const valorTotalFinal = (valorPorHora || 0) + (Number(detalhesArea?.taxa_limpeza) || 0);

  async function handleSalvarReserva() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const dataParaBanco = dataObjeto.toISOString().split('T')[0]; 
      const horarioString = `${horaInicio.getHours()}:${String(horaInicio.getMinutes()).padStart(2,'0')} às ${horaFim.getHours()}:${String(horaFim.getMinutes()).padStart(2,'0')}`;

      const { error } = await supabase.from('tb_reserva').insert([{
        id_morador: user.id,
        id_condominio: detalhesArea?.id_condominio,
        id_area: params.areaId,
        area_comum: params.areaNome, 
        data_reserva: dataParaBanco,
        horario: horarioString,
        observacao: observacao,
        valor_total: valorTotalFinal, 
        status: 'Pendente'
      }]);

      if (error) throw error;
      Alert.alert("Sucesso", "Reserva enviada para aprovação!");
      router.back();
    } catch (error) {
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>ESPAÇO</Text>
          <View style={styles.areaBadge}><Text style={styles.areaText}>{params.areaNome}</Text></View>
        </View>

        <Text style={styles.label}>DATA DA RESERVA</Text>
        <TouchableOpacity style={[styles.calendarTrigger, { backgroundColor: theme.card }]} onPress={() => setShowCalendar(true)}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={{color: theme.text, marginLeft: 10}}>{dataObjeto.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showCalendar && <DateTimePicker value={dataObjeto} mode="date" onChange={(e, d) => { setShowCalendar(false); if(d) setDataObjeto(d); }} />}

        <View style={styles.row}>
          <TouchableOpacity style={[styles.timeBox, {backgroundColor: theme.card}]} onPress={() => setShowTimeInicio(true)}>
            <Text style={styles.label}>INÍCIO</Text>
            <Text style={{color: theme.text}}>{horaInicio.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.timeBox, {backgroundColor: theme.card}]} onPress={() => setShowTimeFim(true)}>
            <Text style={styles.label}>FIM</Text>
            <Text style={{color: theme.text}}>{horaFim.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
          </TouchableOpacity>
        </View>

        {showTimeInicio && <DateTimePicker value={horaInicio} mode="time" is24Hour={true} onChange={(e, d) => { setShowTimeInicio(false); if(d) setHoraInicio(d); }} />}
        {showTimeFim && <DateTimePicker value={horaFim} mode="time" is24Hour={true} onChange={(e, d) => { setShowTimeFim(false); if(d) setHoraFim(d); }} />}

        <InputField label="OBSERVAÇÕES" value={observacao} onChangeText={setObservacao} icon="document-text-outline" multiline />

        <View style={[styles.priceCard, { backgroundColor: theme.card }]}>
            <View>
                <Text style={[styles.priceLabel, { color: theme.subText }]}>Total a Pagar ({detalhesArea?.tipo_cobranca})</Text>
                <Text style={[styles.priceValue, { color: COLORS.primary }]}>R$ {valorTotalFinal.toFixed(2)}</Text>
            </View>
        </View>

        <PrimaryButton title="CONFIRMAR RESERVA" onPress={handleSalvarReserva} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 25, paddingBottom: 100 },
  infoBox: { marginBottom: 15 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.primary, marginBottom: 8 },
  areaBadge: { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  areaText: { color: COLORS.primary, fontWeight: 'bold' },
  calendarTrigger: { flexDirection: 'row', padding: 18, borderRadius: 15, borderWidth: 1, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  timeBox: { flex: 0.48, padding: 15, borderRadius: 15, borderWidth: 1, alignItems: 'center' },
  priceCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginTop: 10, marginBottom: 20 },
  priceLabel: { fontSize: 12, fontWeight: 'bold' },
  priceValue: { fontSize: 22, fontWeight: 'bold' }
});