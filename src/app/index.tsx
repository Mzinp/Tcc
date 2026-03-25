import React, { useState } from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { router } from "expo-router";

export default function Index() {
  const [isDark, setIsDark] = useState(true);
  
  // Cores: Preto vs Branco
  const theme = {
    bg: isDark ? "rgba(15, 17, 17, 0.85)" : "rgba(255, 255, 255, 0.85)",
    text: isDark ? "#ffffff" : "#0f1111",
    secondaryBtn: isDark ? "rgba(255, 255, 255, 0.05)" : "#f0f0f0"
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0f1111" : "#ffffff" }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" }}
        style={styles.heroImage}
      >
        <View style={[styles.overlay, { backgroundColor: theme.bg }]}>
          
          <TouchableOpacity style={styles.themeToggle} onPress={() => setIsDark(!isDark)}>
            <Text style={[styles.themeToggleText, { color: theme.text }]}>
              {isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.heroTag}>VIZZO CONDOMÍNIOS</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Conectando você aos serviços do seu <Text style={styles.italicText}>vizinho</Text>.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.mainButton} onPress={() => router.push("./Cadastro")}>
              <Text style={styles.mainButtonText}>CRIAR CONTA</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor: theme.secondaryBtn }]} 
              onPress={() => router.push("./Login")}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>ACESSAR LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: { flex: 1 },
  overlay: { flex: 1, justifyContent: "center", padding: "10%" },
  themeToggle: { position: 'absolute', top: 50, right: 20, padding: 10 },
  themeToggleText: { fontSize: 12, fontWeight: 'bold' },
  heroTag: { color: "#ff8c00", letterSpacing: 3, fontSize: 12, fontWeight: "700", marginBottom: 15 },
  heroTitle: { fontSize: 40, fontWeight: "800", lineHeight: 46, marginBottom: 50 },
  italicText: { fontStyle: "italic", color: "#2d79f3" },
  buttonContainer: { gap: 15 },
  mainButton: { backgroundColor: "#2d79f3", padding: 20, borderRadius: 12, alignItems: "center" },
  mainButtonText: { color: "white", fontWeight: "bold", letterSpacing: 1.5, fontSize: 13 },
  secondaryButton: { borderWidth: 1.5, borderColor: "#353838", padding: 20, borderRadius: 12, alignItems: "center" },
  secondaryButtonText: { fontWeight: "bold", letterSpacing: 1.5, fontSize: 13 },
});