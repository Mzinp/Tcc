import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/consts/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

import ArrowBack from '@/components/ArrowVoltar';
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";

export default function GestaoArea() {
  const router = useRouter();
  const { idArea, nomeArea, valorAtual } = useLocalSearchParams();
  
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [nome, setNome] = useState(nomeArea as string || "");
  const [preco, setPreco] = useState(valorAtual as string || "");

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
  };

  async function handleSalvarAlteracoes() {
    if (!nome || !preco) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tb_area_comum')
        .update({
          nome: nome,
          valor_reserva: parseFloat(preco.replace(',', '.'))
        })
        .eq('id_area', idArea);

      if (error) throw error;

      Alert.alert("Sucesso", "Configurações da área atualizadas!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
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

      <ScrollView contentContainerStyle={styles.content}>
        <InputField 
          label="NOME DA ÁREA"
          value={nome}
          onChangeText={setNome}
          icon="business-outline"
        />

        <InputField 
          label="VALOR DA RESERVA (R$)"
          placeholder="Ex: 150.00"
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
          icon="cash-outline"
        />

        <View style={{ marginTop: 20 }}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
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
  content: { padding: 25 }
});