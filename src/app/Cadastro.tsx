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
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BotaoVoltar from '@/components/ArrowVoltar';
import { Ionicons } from "@expo/vector-icons";

export default function Cadastro() {
  const [isDark, setIsDark] = useState(true);
  const params = useLocalSearchParams(); 

  useEffect(() => {
    const carregarTema = async () => {
      const salvo = await AsyncStorage.getItem('@vizzo_theme');
      if (salvo !== null) setIsDark(salvo === 'dark');
    };
    carregarTema();
  }, []);

  const theme = {
    bg: isDark ? "#0f1111" : "#ffffff",
    inputBg: isDark ? "#1a1d1d" : "#ffffff",
    border: isDark ? "#353838" : "#eeeeee",
    text: isDark ? "#ffffff" : "#0f1111",
    label: isDark ? "#e0e0e0" : "#444444"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topRow}>
          <BotaoVoltar cor={theme.text} />
        </View>
        
        <View style={styles.logoContainer}>
          <Image 
            source={require("../assets/img/logo.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>

        <Text style={[styles.cadastroTitle, { color: theme.text }]}>Criar nova conta no Vizzo</Text>
        
        <View style={styles.form}>
          {/* SELEÇÃO DE CONDOMÍNIO */}
          <Text style={[styles.inputLabel, { color: theme.label }]}>MEU CONDOMÍNIO</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push("/LocalizarCondominio")}
            style={[styles.inputContainer, { 
              backgroundColor: theme.inputBg, 
              borderColor: params.condonome ? "#2d79f3" : theme.border,
              borderWidth: params.condonome ? 2 : 1.5,
              borderStyle: params.condonome ? 'solid' : 'dashed' 
            }]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: params.condonome ? theme.text : "#888", flex: 1, fontSize: 14 }}>
                    {params.condonome || "Clique para localizar seu prédio"}
                </Text>
                <Ionicons name="business" size={18} color={params.condonome ? "#2d79f3" : "#555"} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.inputLabel, { color: theme.label }]}>NOME COMPLETO</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput placeholder="Digite seu nome" placeholderTextColor="#888" style={[styles.textInput, { color: theme.text }]} />
          </View>

          {/* NOVO CAMPO: CPF */}
          <Text style={[styles.inputLabel, { color: theme.label }]}>CPF</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput 
                placeholder="000.000.000-00" 
                placeholderTextColor="#888" 
                keyboardType="numeric"
                style={[styles.textInput, { color: theme.text }]} 
            />
          </View>

          <View style={styles.row}>
             <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.inputLabel, { color: theme.label }]}>BLOCO</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <TextInput placeholder="Ex: A" placeholderTextColor="#888" style={[styles.textInput, { color: theme.text }]} />
                </View>
             </View>
             <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.label }]}>APTO</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <TextInput placeholder="102" keyboardType="numeric" placeholderTextColor="#888" style={[styles.textInput, { color: theme.text }]} />
                </View>
             </View>
          </View>

          <Text style={[styles.inputLabel, { color: theme.label }]}>E-MAIL</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput placeholder="email@exemplo.com" autoCapitalize="none" placeholderTextColor="#888" style={[styles.textInput, { color: theme.text }]} />
          </View>

          <Text style={[styles.inputLabel, { color: theme.label }]}>SENHA</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput placeholder="••••••••" secureTextEntry placeholderTextColor="#888" style={[styles.textInput, { color: theme.text }]} />
          </View>

          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={() => router.push({
              pathname: "/Sucesso",
              params: { 
                mensagem: "Conta criada com sucesso! Faça seu login para entrar.",
                proximaTela: "/Login" // Instrução para a tela de sucesso
              }
            })}
          >
            <Text style={styles.mainButtonText}>FINALIZAR CADASTRO</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContent: { flexGrow: 1, padding: 30, paddingTop: 20 },
  topRow: { paddingTop: 40, marginBottom: -20 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 140, height: 70 },
  cadastroTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  form: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 10, fontWeight: "700", marginBottom: 8, letterSpacing: 1 },
  inputContainer: { borderWidth: 1.5, borderRadius: 12, height: 55, paddingHorizontal: 15, justifyContent: 'center', marginBottom: 15 },
  textInput: { flex: 1, fontSize: 14 },
  mainButton: { backgroundColor: "#2d79f3", padding: 18, borderRadius: 15, alignItems: "center", marginTop: 20, elevation: 4 },
  mainButtonText: { color: "white", fontWeight: "bold", letterSpacing: 1 },
});