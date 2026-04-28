import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/consts/colors";

export default function Sucesso() {
  const { mensagem, proximaTela } = useLocalSearchParams();
  
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  // Forçamos o padrão Full Black para o TCC
  const theme = {
    bg: "#0f1111",
    text: "#ffffff",
    subtitle: "#8b8e98",
    footer: "#353838",
    accent: "#2ecc71" // Verde para sucesso
  };

  useEffect(() => {
    // Inicia as animações
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(progressValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ]).start();

    // Timer para redirecionamento automático
    const timer = setTimeout(() => {
      // Ajuste de rota: Se não vier destino, volta para a aba Home
      const destino = (proximaTela as string) || "/(main)/(tabs)/home";
      router.replace(destino as any);
    }, 3500);

    return () => clearTimeout(timer);
  }, [proximaTela]);

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const getFooterText = () => {
    if (proximaTela === "/(auth)/login") return "INDO PARA O LOGIN";
    if (proximaTela?.includes("marketplace")) return "VOLTANDO AO MARKETPLACE";
    if (proximaTela?.includes("visitantes")) return "VOLTANDO AOS VISITANTES";
    return "VOLTANDO PARA A HOME";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[
        styles.iconCircle, 
        { 
          transform: [{ scale: scaleValue }], 
          opacity: opacityValue,
          backgroundColor: theme.accent,
          shadowColor: theme.accent,
        }
      ]}>
        <View style={styles.whiteRing}>
            <Ionicons name="checkmark-sharp" size={70} color="white" />
        </View>
      </Animated.View>
      
      <Animated.View style={{ opacity: opacityValue, alignItems: 'center' }}>
        <Text style={[styles.title, { color: theme.text }]}>Tudo certo!</Text>
        <View style={[styles.divider, { backgroundColor: theme.accent }]} />
        <Text style={[styles.subtitle, { color: theme.subtitle }]}>
          {mensagem || "Sua solicitação foi processada com sucesso."}
        </Text>
      </Animated.View>
      
      <View style={styles.loaderContainer}>
          <Text style={[styles.footer, { color: theme.footer }]}>
            {getFooterText()}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: "#1a1d1d" }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: theme.accent }]} />
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconCircle: { 
    width: 140, height: 140, borderRadius: 70, 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 40, elevation: 20, shadowOpacity: 0.4, shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 }
  },
  whiteRing: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center'
  },
  title: { fontSize: 34, fontWeight: 'bold', letterSpacing: -1 },
  divider: { width: 45, height: 5, borderRadius: 3, marginVertical: 18 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 15 },
  loaderContainer: { position: 'absolute', bottom: 60, alignItems: 'center', width: '100%' },
  footer: { fontSize: 11, letterSpacing: 2, fontWeight: '900', marginBottom: 15 },
  progressBar: { width: 160, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%' }
});