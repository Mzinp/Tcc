import { COLORS } from "@/consts/colors";
import { supabase } from "@/lib/supabase"; // Importando o banco
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [isDark, setIsDark] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 1. Lógica de Segurança: Verificar se já está logado ao abrir o app
  useEffect(() => {
    const verificarSessao = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Se já está logado, vai direto para a Home sem mostrar a Landing Page
        // router.replace("/(main)/(tabs)/home");
      }
      setCheckingAuth(false);
    };
    verificarSessao();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        const salvo = await AsyncStorage.getItem("@vizzo_theme");
        if (salvo !== null) setIsDark(salvo === "dark");
      };
      carregarTema();
    }, []),
  );

  const theme = {
    bg: isDark ? "rgba(15, 17, 17, 0.85)" : "rgba(255, 255, 255, 0.85)",
    text: isDark ? "#ffffff" : "#0f1111",
    secondaryBtn: isDark ? "rgba(255, 255, 255, 0.05)" : "#f0f0f0",
    cardBtn: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  };

  // Enquanto verifica se o usuário está logado, mostra um carregamento
  if (checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.dark.bg,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2d79f3" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? COLORS.dark.bg : COLORS.light.bg,
      }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.heroImage}
      >
        <View style={[styles.overlay, { backgroundColor: theme.bg }]}>
          <Text style={styles.heroTag}>VIZZO CONDOMÍNIOS</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Conectando você aos serviços do seu{" "}
            <Text style={styles.italicText}>vizinho</Text>.
          </Text>

          <View style={styles.buttonContainer}>
            <Text style={[styles.choiceLabel, { color: theme.text }]}>
              QUERO ME CADASTRAR COMO:
            </Text>

            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.choiceButton, { backgroundColor: "#2d79f3" }]}
                onPress={() => router.push("/(auth)/CadastroAdministrador")}
              >
                <Text style={styles.mainButtonText}>SÍNDICO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choiceButton, { backgroundColor: "#ff8c00" }]}
                onPress={() => router.push("/(auth)/CadastroMorador")}
              >
                <Text style={styles.mainButtonText}>MORADOR</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.separatorContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>OU</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: theme.secondaryBtn },
              ]}
              onPress={() => router.push("/(auth)/login")} // Ajustado para L minúsculo e pasta certa
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                ACESSAR MINHA CONTA
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

// ... seus estilos permanecem iguais
const styles = StyleSheet.create({
  heroImage: { flex: 1 },
  overlay: { flex: 1, justifyContent: "center", padding: "10%" },
  heroTag: {
    color: "#ff8c00",
    letterSpacing: 3,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
    marginBottom: 40,
  },
  italicText: { fontStyle: "italic", color: "#2d79f3" },
  buttonContainer: { gap: 10 },
  choiceLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 5,
    opacity: 0.7,
  },
  rowButtons: { flexDirection: "row", gap: 10, marginBottom: 10 },
  choiceButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1.5,
    fontSize: 11,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#353838",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: { fontWeight: "bold", letterSpacing: 1.5, fontSize: 13 },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: "#353838" },
  orText: {
    color: "#8b8e98",
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: "700",
  },
});
