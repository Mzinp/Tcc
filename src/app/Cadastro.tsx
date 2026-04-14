import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  ScrollView, 
  TextInput, 
  Platform, 
  Image 
} from "react-native";
import { router, useLocalSearchParams } from "expo-router"; // Importado useLocalSearchParams
import AsyncStorage from '@react-native-async-storage/async-storage';
import BotaoVoltar from '@/components/ArrowVoltar';

export default function Cadastro() {
  const [isDark, setIsDark] = useState(true);
  const params = useLocalSearchParams(); // Pega o nome do condomínio vindo da busca

  // Função para salvar o tema
  const salvarTema = async (valor: boolean) => {
    try {
      setIsDark(valor);
      await AsyncStorage.setItem('@vizzo_theme', valor ? 'dark' : 'light');
    } catch (e) {
      console.log("Erro ao salvar tema");
    }
  };

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    inputBg: isDark ? "#1a1d1d" : "#ffffff",
    border: isDark ? "#353838" : "#dddddd",
    text: isDark ? "#ffffff" : "#0f1111",
    label: isDark ? "#e0e0e0" : "#444444"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.themeContainer}>
          <Text style={{ color: theme.label, fontSize: 10, fontWeight: 'bold' }}>PREFERÊNCIA DE TEMA</Text>
          <TouchableOpacity 
            style={styles.themeToggle} 
            onPress={() => salvarTema(!isDark)}
          >
            <Text style={{ color: "#2d79f3", fontWeight: 'bold' }}>
              {isDark ? "🌙 MODO ESCURO" : "☀️ MODO CLARO"}
            </Text>
          </TouchableOpacity>
        </View>

        <BotaoVoltar cor={isDark ? "#ffffff" : "#0f1111"} />
        
        <View style={styles.logoContainer}>
          <Image 
            source={require("../assets/img/logo.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>

        <Text style={[styles.cadastroTitle, { color: theme.text }]}>Criar nova conta no Vizzo</Text>
        
        <View style={styles.form}>
          {/* CAMPO DE CONDOMÍNIO ADICIONADO AQUI */}
          <Text style={[styles.inputLabel, { color: theme.label }]}>MEU CONDOMÍNIO</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push("/LocalizarCondominio")}
            style={[styles.inputContainer, { 
              backgroundColor: theme.inputBg, 
              borderColor: params.condonome ? "#2d79f3" : theme.border,
              borderStyle: params.condonome ? 'solid' : 'dashed' 
            }]}
          >
            <Text style={{ color: params.condonome ? theme.text : "#555" }}>
              {params.condonome || "Clique para selecionar seu condomínio"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.inputLabel, { color: theme.label }]}>NOME COMPLETO</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput placeholder="Digite seu nome" placeholderTextColor="#555" style={{ color: theme.text }} />
          </View>

          <Text style={[styles.inputLabel, { color: theme.label }]}>CPF</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput placeholder="000.000.000-00" keyboardType="numeric" placeholderTextColor="#555" style={{ color: theme.text }} />
          </View>

          <Text style={[styles.inputLabel, { color: theme.label }]}>E-MAIL</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput placeholder="email@exemplo.com" autoCapitalize="none" placeholderTextColor="#555" style={{ color: theme.text }} />
          </View>

          <View style={styles.row}>
             <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.inputLabel, { color: theme.label }]}>BLOCO</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <TextInput placeholder="Ex: A" placeholderTextColor="#555" style={{ color: theme.text }} />
                </View>
             </View>
             <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.label }]}>APTO</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <TextInput placeholder="102" keyboardType="numeric" placeholderTextColor="#555" style={{ color: theme.text }} />
                </View>
             </View>
          </View>

          <Text style={[styles.inputLabel, { color: theme.label }]}>SENHA</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput placeholder="••••••••" secureTextEntry placeholderTextColor="#555" style={{ color: theme.text }} />
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={() => router.push("/Login")}>
            <Text style={styles.mainButtonText}>FINALIZAR CADASTRO</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContent: { flexGrow: 1, padding: 30, paddingTop: 50 },
  themeContainer: { alignItems: 'center', marginBottom: 20 },
  themeToggle: { marginTop: 5, padding: 8, backgroundColor: 'rgba(45, 121, 243, 0.1)', borderRadius: 10 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 150, height: 80 },
  cadastroTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  form: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 10, fontWeight: "700", marginBottom: 8, letterSpacing: 1 },
  inputContainer: { borderWidth: 1.5, borderRadius: 12, height: 55, paddingHorizontal: 15, justifyContent: 'center', marginBottom: 15 },
  mainButton: { backgroundColor: "#2d79f3", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 20 },
  mainButtonText: { color: "white", fontWeight: "bold", letterSpacing: 1 },
});