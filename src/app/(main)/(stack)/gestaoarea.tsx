import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/consts/colors";
import { useAppTheme } from "@/context/ThemeContext";

import ArrowBack from '@/components/ArrowVoltar';
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";

export default function GestaoArea() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  
  const [loading, setLoading] = useState(false);
  
  // Estados para os novos campos
  const [nome, setNome] = useState((params.nomeArea as string) || "");
  const [preco, setPreco] = useState((params.valorAtual as string) || "");
  const [capacidade, setCapacidade] = useState("");
  const [tipoCobranca, setTipoCobranca] = useState("Diária");
  const [taxaLimpeza, setTaxaLimpeza] = useState("0.00");
  const [regras, setRegras] = useState("");

  async function handleSalvarAlteracoes() {
    if (!nome || !preco) {
      Alert.alert("Erro", "Preencha pelo menos Nome e Preço.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: adminData } = await supabase
        .from("tb_administrador")
        .select("id_condominio")
        .eq("id_administrador", user.id)
        .maybeSingle();

      const idCondominio = adminData?.id_condominio;
      if (!idCondominio) {
        Alert.alert("Erro", "Condomínio não encontrado.");
        setLoading(false);
        return;
      }

      const dadosParaSalvar = {
        nome: nome,
        valor_reserva: parseFloat(preco.replace(',', '.')),
        capacidade: parseInt(capacidade) || 0,
        tipo_cobranca: tipoCobranca,
        taxa_limpeza: parseFloat(taxaLimpeza.replace(',', '.')),
        regras: regras,
        id_condominio: idCondominio
      };

      if (params.idArea) {
        const { error } = await supabase
          .from('tb_area_comum')
          .update(dadosParaSalvar)
          .eq('id_area', params.idArea);
        if (error) throw error;
        Alert.alert("Sucesso", "Área atualizada!");
      } else {
        const { error } = await supabase
          .from('tb_area_comum')
          .insert(dadosParaSalvar);
        if (error) throw error;
        Alert.alert("Sucesso", "Nova área cadastrada!");
      }

      router.back();
    } catch (error: any) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Configurar Espaço</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <InputField label="NOME DA ÁREA" value={nome} onChangeText={setNome} icon="business-outline" />
        <InputField label="VALOR BASE (R$)" value={preco} onChangeText={setPreco} keyboardType="numeric" icon="cash-outline" />
        <InputField label="CAPACIDADE (PESSOAS)" value={capacidade} onChangeText={setCapacidade} keyboardType="numeric" icon="people-outline" />
        <InputField label="TIPO COBRANÇA" value={tipoCobranca} onChangeText={setTipoCobranca} placeholder="Hora ou Diária" icon="calendar-number-outline" />
        <InputField label="TAXA DE LIMPEZA (R$)" value={taxaLimpeza} onChangeText={setTaxaLimpeza} keyboardType="numeric" icon="brush-outline" />
        <InputField label="REGRAS DE USO" value={regras} onChangeText={setRegras} icon="document-text-outline" multiline />

        <View style={{ marginTop: 20, marginBottom: 50 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <PrimaryButton title="SALVAR ALTERAÇÕES" onPress={handleSalvarAlteracoes} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 25, paddingBottom: 100 }
});