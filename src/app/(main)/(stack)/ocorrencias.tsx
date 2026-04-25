import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';

export default function Ocorrencias() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const carregarTema = async () => {
      const salvo = await AsyncStorage.getItem('@vizzo_theme');
      if (salvo !== null) setIsDark(salvo === 'dark');
    };
    carregarTema();
  }, []);

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    input: isDark ? COLORS.dark.input : COLORS.light.input,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    border: isDark ? COLORS.dark.border : COLORS.light.border
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ArrowBack cor={theme.text} />
          <Text style={[styles.title, { color: theme.text }]}>Registrar Ocorrência</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Relate problemas ou incidentes no condomínio</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>ASSUNTO</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              style={[styles.input, { color: theme.text }]} 
              placeholder="Ex: Vazamento no corredor, Barulho excessivo..." 
              placeholderTextColor={theme.subText} 
            />
          </View>

          <Text style={styles.label}>DESCRIÇÃO DETALHADA</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border, height: 150 }]}>
            <TextInput 
              style={[styles.input, { color: theme.text, textAlignVertical: 'top', paddingTop: 15 }]} 
              multiline 
              numberOfLines={6}
              placeholder="Descreva o que aconteceu com o máximo de detalhes possível..." 
              placeholderTextColor={theme.subText} 
            />
          </View>

          <TouchableOpacity style={[styles.attachButton, { borderColor: theme.border, borderStyle: 'dashed' }]}>
            <Ionicons name="camera-outline" size={24} color={COLORS.red} />
            <Text style={[styles.attachText, { color: theme.text }]}>Anexar Foto ou Vídeo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => router.push({
              pathname: "/(main)/(modal)/sucesso",
              params: { mensagem: "Sua ocorrência foi enviada ao síndico com sucesso!" }
            })}
          >
            <Ionicons name="send" size={18} color="white" />
            <Text style={styles.buttonText}>ENVIAR AO SÍNDICO</Text>
          </TouchableOpacity>
          
          <Text style={styles.warningText}>
            Sua ocorrência será registrada com seu nome e unidade para que o síndico possa entrar em contato.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  header: { paddingHorizontal: 25, paddingTop: 60, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', marginTop: 15 },
  subtitle: { fontSize: 14, marginTop: 5 },
  form: { padding: 25 },
  label: { color: COLORS.red, fontSize: 11, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  inputContainer: { 
    borderWidth: 1, 
    borderRadius: 15, 
    marginBottom: 20,
    paddingHorizontal: 15
  },
  input: { flex: 1, fontSize: 15 },
  attachButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 2, 
    marginBottom: 30 
  },
  attachText: { marginLeft: 10, fontWeight: 'bold', fontSize: 14 },
  mainButton: { 
    backgroundColor: COLORS.red, 
    padding: 18, 
    borderRadius: 15, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4
  },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
  warningText: { textAlign: 'center', color: '#8b8e98', fontSize: 12, marginTop: 20, lineHeight: 18 }
});