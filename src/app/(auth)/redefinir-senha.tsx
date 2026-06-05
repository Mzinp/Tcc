import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'expo-router';

export default function RedefinirSenha() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRedefinir() {
    if (password.length < 6) return Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    
    setLoading(false);
    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("Sucesso", "Senha redefinida!");
      router.replace("/(auth)/login");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Senha</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Digite sua nova senha" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleRedefinir} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SALVAR SENHA</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1111", justifyContent: "center", padding: 25 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { backgroundColor: "#252828", padding: 18, borderRadius: 10, color: "#fff", marginBottom: 20 },
  button: { backgroundColor: "#2d79f3", padding: 18, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" }
});