import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/consts/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Seus componentes
import ArrowBack from '@/components/ArrowVoltar';
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";

export default function CadastroComunicado() {
  const router = useRouter();
  
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Estados do formulário
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tipo, setTipo] = useState<"Informativo" | "Urgente">("Informativo");

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
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    border: isDark ? COLORS.dark.border : COLORS.light.border,
  };

  async function handleEnviar() {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert("Atenção", "Por favor, preencha o título e a mensagem do comunicado.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Busca dados do admin para pegar o nome (autor) e condomínio
      const { data: admin } = await supabase
        .from('tb_administrador')
        .select('nome, id_condominio')
        .eq('id_administrador', user.id)
        .single();

      const { error } = await supabase.from('tb_comunicado').insert([{
        id_condominio: admin?.id_condominio,
        titulo: titulo,
        conteudo: conteudo,
        autor: admin?.nome || "Administração",
        tipo: tipo,
        data_publicacao: new Date().toISOString()
      }]);

      if (error) throw error;

      Alert.alert("Sucesso", "Comunicado publicado no mural!");
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível publicar o comunicado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Novo Comunicado</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>NÍVEL DE IMPORTÂNCIA</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity 
              style={[
                styles.typeOption, 
                { borderColor: theme.border, backgroundColor: tipo === 'Informativo' ? 'rgba(45, 121, 243, 0.1)' : 'transparent' },
                tipo === 'Informativo' && { borderColor: COLORS.primary }
              ]}
              onPress={() => setTipo('Informativo')}
            >
              <Text style={[styles.typeText, { color: tipo === 'Informativo' ? COLORS.primary : theme.text }]}>Informativo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.typeOption, 
                { borderColor: theme.border, backgroundColor: tipo === 'Urgente' ? 'rgba(244, 67, 54, 0.1)' : 'transparent' },
                tipo === 'Urgente' && { borderColor: COLORS.red }
              ]}
              onPress={() => setTipo('Urgente')}
            >
              <Text style={[styles.typeText, { color: tipo === 'Urgente' ? COLORS.red : theme.text }]}>Urgente</Text>
            </TouchableOpacity>
          </View>

          <InputField 
            label="TÍTULO DO AVISO"
            placeholder="Ex: Manutenção de Elevadores"
            value={titulo}
            onChangeText={setTitulo}
            icon="megaphone-outline"
          />

          <InputField 
            label="CONTEÚDO / MENSAGEM"
            placeholder="Descreva aqui o comunicado para os moradores..."
            value={conteudo}
            onChangeText={setConteudo}
            icon="document-text-outline"
            multiline
          />

          <View style={{ marginTop: 20 }}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <PrimaryButton 
                title="PUBLICAR NO MURAL" 
                onPress={handleEnviar} 
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 25 },
  form: { marginTop: 10 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.primary, marginBottom: 12, letterSpacing: 1 },
  typeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  typeOption: { 
    flex: 0.48, 
    paddingVertical: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  typeText: { fontSize: 14, fontWeight: 'bold' }
});