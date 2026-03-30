import React, { useState } from "react";

import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

import { router } from 'expo-router'

import ButtonVoltar from '@/components/ButtonVoltar'



export default function Login() {
  const [isDark, setIsDark] = useState(true);

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    card: isDark ? "#1a1d1d" : "#ffffff",
    input: isDark ? "#252828" : "#ffffff",
    border: isDark ? "#353838" : "#dddddd",
    text: isDark ? "#ffffff" : "#0f1111"
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={styles.centerContent}>
        <TouchableOpacity style={styles.themeToggle} onPress={() => setIsDark(!isDark)}>
          <Text style={{ color: "#2d79f3", fontWeight: 'bold' }}>{isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro"}</Text>
        </TouchableOpacity>

        <View style={[styles.loginForm, { backgroundColor: theme.card }]}>
          <Text style={styles.brandTitle}>VIZZO</Text>
          <Text style={[styles.loginTitle, { color: theme.text }]}>Login de Acesso</Text>
          

          <Text style={[styles.inputLabel, { color: isDark ? "#e0e0e0" : "#444444" }]}>E-MAIL</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput style={{ color: theme.text }} placeholder="seu@email.com" placeholderTextColor="#8b8e98" />
          </View>

          <Text style={[styles.inputLabel, { color: isDark ? "#e0e0e0" : "#444444" }]}>SENHA</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput style={{ color: theme.text }} placeholder="••••••••" secureTextEntry placeholderTextColor="#8b8e98" />
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={() => {router.push("/home")}}>
            <Text style={styles.mainButtonText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
  themeToggle: { alignSelf: 'center', marginBottom: 20 },
  loginForm: { padding: 35, borderRadius: 20, borderTopWidth: 6, borderTopColor: "#ff8c00", elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  brandTitle: { color: "#ff8c00", fontSize: 14, fontWeight: "800", letterSpacing: 4, textAlign: "center", marginBottom: 5 },
  loginTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  inputContainer: { borderWidth: 1.5, borderRadius: 10, height: 55, paddingHorizontal: 15, justifyContent: "center", marginBottom: 20 },
  mainButton: { backgroundColor: "#2d79f3", padding: 18, borderRadius: 10, alignItems: "center" },
  mainButtonText: { color: "white", fontWeight: "bold" },
});