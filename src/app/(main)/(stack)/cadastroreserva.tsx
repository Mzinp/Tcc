import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/consts/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Seus componentes
import ArrowBack from '@/components/ArrowVoltar';
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";

export default function CadastroReserva() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Recebe o nome da área vindo da tela anterior
  
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Estados do formulário
  const [dataReserva, setDataReserva] = useState("");
  const [horario, setHorario] = useState("");
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    const carregarTema = async () => {
      const salvo = await AsyncStorage.getItem('@vizzo_theme');
      if (salvo !== null) setIsDark(salvo === 'dark');
    };
    carregarTema();
  }, []);

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
  };

  async function handleSalvarReserva() {
  if (!dataReserva || !horario) {
    Alert.alert("Atenção", "Preencha a data e o horário.");
    return;
  }

  setLoading(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. VERIFICAÇÃO DE DISPONIBILIDADE (O Bloqueio)
    const { data: conflito } = await supabase
      .from('tb_reserva')
      .select('id_reserva')
      .eq('id_area', params.areaId) // Filtra pela área específica
      .eq('data_reserva', dataReserva) // Mesma data
      .neq('status', 'Recusado') // Só bloqueia se não estiver recusada
      .single();

    if (conflito) {
      Alert.alert("Data Ocupada", "Já existe uma reserva ou solicitação para este dia.");
      setLoading(false);
      return;
    }

    // 2. BUSCA O PREÇO DEFINIDO PELO ADMIN
    const { data: areaInfo } = await supabase
      .from('tb_area_comum')
      .select('valor_reserva, id_condominio')
      .eq('id_area', params.areaId)
      .single();

    // 3. SALVA A RESERVA COM O VALOR DA ÉPOCA
    const { error } = await supabase.from('tb_reserva').insert([{
      id_morador: user?.id, // ID do Morador
      id_condominio: areaInfo?.id_condominio,
      id_area: params.areaId,
      area_comum: params.areaNome, 
      data_reserva: dataReserva,
      horario: horario,
      valor_total: areaInfo?.valor_reserva || 0, // Salva o preço que o admin definiu
      status: 'Pendente'
    }]);

    if (error) throw error;

    Alert.alert("Sucesso", `Reserva solicitada! Valor: R$ ${areaInfo?.valor_reserva}`);
    router.back();

  } catch (error) {
    console.log(error);
    Alert.alert("Erro", "Falha na comunicação com o servidor.");
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
          <Text style={styles.label}>ESPAÇO SELECIONADO</Text>
          <View style={styles.areaBadge}>
            <Text style={styles.areaText}>{params.areaNome || "Área Comum"}</Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <InputField 
            label="DATA (DD/MM/AAAA)"
            placeholder="Ex: 25/12/2026"
            value={dataReserva}
            onChangeText={setDataReserva}
            icon="calendar-outline"
          />

          <InputField 
            label="HORÁRIO"
            placeholder="Ex: 14:00 às 22:00"
            value={horario}
            onChangeText={setHorario}
            icon="time-outline"
          />

          <InputField 
            label="OBSERVAÇÕES (OPCIONAL)"
            placeholder="Ex: Aniversário de 15 anos..."
            value={observacao}
            onChangeText={setObservacao}
            icon="document-text-outline"
            multiline
          />
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

        <Text style={styles.footerNote}>
          *A reserva está sujeita a aprovação do síndico e às normas do regimento interno.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 10
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 25 },
  infoBox: { marginBottom: 10 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.primary, marginBottom: 8, letterSpacing: 1 },
  areaBadge: { 
    backgroundColor: 'rgba(45, 121, 243, 0.1)', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.primary 
  },
  areaText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  footerNote: { 
    textAlign: 'center', 
    color: '#8b8e98', 
    fontSize: 12, 
    marginTop: 25, 
    lineHeight: 18,
    paddingHorizontal: 10
  }
});