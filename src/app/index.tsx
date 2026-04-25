import React, { useState } from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "@/consts/colors";

export default function Index() {
  const [isDark, setIsDark] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        const salvo = await AsyncStorage.getItem('@vizzo_theme');
        if (salvo !== null) setIsDark(salvo === 'dark');
      };
      carregarTema();
    }, [])
  );
  
  const theme = {
    bg: isDark ? "rgba(15, 17, 17, 0.85)" : "rgba(255, 255, 255, 0.92)",
    text: isDark ? "#ffffff" : COLORS.light.text,
    secondaryBtn: isDark ? "rgba(255, 255, 255, 0.05)" : "#f0f0f0",
    border: isDark ? "#353838" : "#cccccc"
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.bg : COLORS.light.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" }}
        style={styles.heroImage}
      >
        <View style={[styles.overlay, { backgroundColor: theme.bg }]}>
          
          <Text style={styles.heroTag}>VIZZO CONDOMÍNIOS</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Conectando você aos serviços do seu <Text style={styles.italicText}>vizinho</Text>.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={() => router.push("/(auth)/cadastro")}
            >
              <Text style={styles.mainButtonText}>CRIAR CONTA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor: theme.secondaryBtn, borderColor: theme.border }]} 
              onPress={() => router.push("/(auth)/login")}
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
  heroTag: { color: COLORS.orange, letterSpacing: 3, fontSize: 12, fontWeight: "700", marginBottom: 15 },
  heroTitle: { fontSize: 40, fontWeight: "800", lineHeight: 46, marginBottom: 50 },
  italicText: { fontStyle: "italic", color: COLORS.primary },
  buttonContainer: { gap: 15 },
  mainButton: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 12, alignItems: "center" },
  mainButtonText: { color: "white", fontWeight: "bold", letterSpacing: 1.5, fontSize: 13 },
  secondaryButton: { borderWidth: 1.5, padding: 20, borderRadius: 12, alignItems: "center" },
  secondaryButtonText: { fontWeight: "bold", letterSpacing: 1.5, fontSize: 13 },
});