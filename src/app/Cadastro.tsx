import React, { useState } from "react";
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

import ButtonVoltar from '@/components/ButtonVoltar';

export default function Cadastro() {
  const [isDark, setIsDark] = useState(true);

  // Paleta de Cores: Dark vs Light
  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5", // Fundo profundo vs Claro
    inputBg: isDark ? "#1a1d1d" : "#ffffff", // Fundo do input
    border: isDark ? "#353838" : "#dddddd",  // Borda suave
    text: isDark ? "#ffffff" : "#0f1111",     // Texto principal
    label: isDark ? "#e0e0e0" : "#444444"    // Label secundário
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }} // Fundo Dinâmico da Tela
    >
      <ScrollView contentContainerStyle={styles.centerContent}>
        
        {/* Alternador de Tema (Pequeno no topo) */}
        <TouchableOpacity style={styles.themeToggle} onPress={() => setIsDark(!isDark)}>
          <Text style={{ color: "#2d79f3", fontWeight: 'bold', fontSize: 12 }}>
            {isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
          </Text>
        </TouchableOpacity>

        <ButtonVoltar cor={isDark ? "#ffffff" : "#0f1111"} />
        
        {/* LOGO CENTRALIZADA NO EIXO DA TELA */}
        <View style={styles.logoContainer}>
          <Image 
            source={require("../assets/img/vizzo.svg")} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <Text style={[styles.cadastroTitle, { color: theme.text }]}>Criar nova conta no Vizzo</Text>
        
        {/* NOME COMPLETO */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>NOME COMPLETO</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput 
            style={{ color: theme.text }} 
            placeholder="Digite seu nome" 
            placeholderTextColor="#8b8e98" 
          />
        </View>

        {/* CPF */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>CPF</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput 
            style={{ color: theme.text }} 
            placeholder="000.000.000-00" 
            placeholderTextColor="#8b8e98"
            keyboardType="numeric"
          />
        </View>

        {/* E-MAIL */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>E-MAIL</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput 
            style={{ color: theme.text }} 
            placeholder="exemplo@email.com" 
            placeholderTextColor="#8b8e98"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* TELEFONE */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>TELEFONE</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput 
            style={{ color: theme.text }} 
            placeholder="(11) 99999-9999" 
            placeholderTextColor="#8b8e98"
            keyboardType="phone-pad"
          />
        </View>

        {/* SENHA */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>SENHA</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput 
            style={{ color: theme.text }} 
            placeholder="••••••••" 
            placeholderTextColor="#8b8e98"
            secureTextEntry
          />
        </View>

        {/* Botão Finalizar */}
        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.mainButtonText}>FINALIZAR CADASTRO</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContent: { 
    flexGrow: 1, 
    justifyContent: "center", // Garante centralização vertical
    alignItems: "stretch",    // Preenche a largura
    padding: 30,
    paddingVertical: 50
  },
  themeToggle: { 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30, // Espaço após a logo
    width: '100%',
  },
  logo: {
    width: 200, // Ajuste para a logo aparecer bem no centro
    height: 100,
  },
  cadastroTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  inputLabel: { 
    fontSize: 10, 
    fontWeight: "700", 
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  inputContainer: { 
    borderWidth: 1.5, 
    borderRadius: 12, // Arredondamento moderno (12px)
    height: 55,       // Mais alto para facilitar o clique
    paddingHorizontal: 15, 
    justifyContent: 'center', 
    marginBottom: 15 
  },
  mainButton: { 
    backgroundColor: "#2d79f3", // Azul Vizzo
    padding: 20, 
    borderRadius: 12, 
    alignItems: "center",
    marginTop: 20,
    elevation: 5,
    shadowColor: "#2d79f3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  mainButtonText: { 
    color: "white", 
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1
  },
});