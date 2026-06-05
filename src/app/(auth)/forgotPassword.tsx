import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import ArrowBack from '@/components/ArrowVoltar';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRecuperar() {
    if (!email) return Alert.alert("Atenção", "Digite seu e-mail.");
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'vizzo://redefinir-senha' 
    });

    setLoading(false);
    if (error) Alert.alert("Erro", error.message);
    else Alert.alert("Sucesso", "Verifique seu e-mail para redefinir a senha.");
  }

  return (
    <View style={styles.container}>
      <ArrowBack cor="#fff" />
      <View style={styles.content}>
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>Enviaremos um link de recuperação para o seu e-mail cadastrado.</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="seu@email.com" 
          placeholderTextColor="#8b8e98"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        
        <TouchableOpacity style={styles.button} onPress={handleRecuperar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ENVIAR</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1111", padding: 25, paddingTop: 60 },
  content: { marginTop: 50 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { color: "#8b8e98", marginBottom: 30 },
  input: { backgroundColor: "#252828", padding: 18, borderRadius: 10, color: "#fff", marginBottom: 20 },
  button: { backgroundColor: "#ff8c00", padding: 18, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" }
});