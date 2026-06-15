import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";

export default function Sucesso() {
  const { mensagem, proximaTela } = useLocalSearchParams<{ mensagem: string; proximaTela?: string }>();

  function handleVoltar() {
    if (proximaTela) {
      router.replace(proximaTela as any);
    } else {
      router.back();
    }
  }

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={80} color={COLORS.primary} />
      <Text style={styles.title}>Tudo certo!</Text>
      <Text style={styles.message}>{mensagem}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleVoltar}
      >
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    color: "#666",
    lineHeight: 22,
  },
  button: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
