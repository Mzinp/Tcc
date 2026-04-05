import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Sucesso() {
  const { mensagem } = useLocalSearchParams();
  const [isDark, setIsDark] = useState(true);
  const scaleValue = new Animated.Value(0);

  // 1. Carregar o tema assim que a tela foca
  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema no Sucesso");
        }
      };
      carregarTema();
    }, [])
  );

  // 2. Lógica de animação e redirecionamento
  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      router.replace("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const theme = {
    bg: isDark ? "#0f1111" : "#f5f5f5",
    text: isDark ? "white" : "#0f1111",
    subtitle: isDark ? "#8b8e98" : "#666666",
    footer: isDark ? "#353838" : "#cccccc"
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Animated.View style={[
        styles.iconCircle, 
        { transform: [{ scale: scaleValue }], shadowColor: "#4caf50" }
      ]}>
        <Ionicons name="checkmark" size={60} color="white" />
      </Animated.View>
      
      <Text style={[styles.title, { color: theme.text }]}>Sucesso!</Text>
      <Text style={[styles.subtitle, { color: theme.subtitle }]}>
        {mensagem || "Sua solicitação foi processada com sucesso."}
      </Text>
      
      <Text style={[styles.footer, { color: theme.footer }]}>REDIRECIONANDO...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 30
  },
  iconCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#4caf50', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 30,
    elevation: 10,
    shadowOpacity: 0.4,
    shadowRadius: 15
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  footer: { fontSize: 10, marginTop: 60, letterSpacing: 3, fontWeight: '700' }
});