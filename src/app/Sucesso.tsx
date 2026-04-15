import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Sucesso() {
  const { mensagem, proximaTela } = useLocalSearchParams(); // Pegando a rota dinâmica
  const [isDark, setIsDark] = useState(true);
  
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current; // Para a barra de progresso

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema");
        }
      };
      carregarTema();
    }, [])
  );

  useEffect(() => {
    // 1. Animações de entrada
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
      // 2. Animação da barra de progresso (enchendo em 3 segundos)
      Animated.timing(progressValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false, // width não suporta native driver
      })
    ]).start();

    // 3. Redirecionamento inteligente
    const timer = setTimeout(() => {
      const destino = (proximaTela as string) || "/home";
      router.replace(destino as any);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const theme = {
    bg: isDark ? "#0f1111" : "#ffffff",
    text: isDark ? "white" : "#0f1111",
    subtitle: isDark ? "#8b8e98" : "#666666",
    footer: isDark ? "#353838" : "#aaaaaa"
  };

  // Interpolação para a largura da barra
  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      
      <Animated.View style={[
        styles.iconCircle, 
        { 
          transform: [{ scale: scaleValue }], 
          opacity: opacityValue,
          shadowColor: "#4caf50",
        }
      ]}>
        <View style={styles.whiteRing}>
            <Ionicons name="checkmark-sharp" size={70} color="white" />
        </View>
      </Animated.View>
      
      <Animated.View style={{ opacity: opacityValue, alignItems: 'center' }}>
        <Text style={[styles.title, { color: theme.text }]}>Tudo certo!</Text>
        <View style={styles.divider} />
        <Text style={[styles.subtitle, { color: theme.subtitle }]}>
          {mensagem || "Sua solicitação foi processada com sucesso."}
        </Text>
      </Animated.View>
      
      <View style={styles.loaderContainer}>
         <Text style={[styles.footer, { color: theme.footer }]}>
            {proximaTela === "/Login" ? "INDO PARA O LOGIN" : "VOLTANDO PARA A HOME"}
         </Text>
         <View style={[styles.progressBar, { backgroundColor: isDark ? '#1a1d1d' : '#f0f0f0' }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconCircle: { 
    width: 140, height: 140, borderRadius: 70, 
    backgroundColor: '#4caf50', justifyContent: 'center', alignItems: 'center',
    marginBottom: 40, elevation: 15, shadowOpacity: 0.3, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }
  },
  whiteRing: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center'
  },
  title: { fontSize: 32, fontWeight: 'bold', letterSpacing: -1 },
  divider: { width: 40, height: 4, backgroundColor: '#4caf50', borderRadius: 2, marginVertical: 15 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  loaderContainer: { position: 'absolute', bottom: 60, alignItems: 'center', width: '100%' },
  footer: { fontSize: 10, letterSpacing: 2, fontWeight: '800', marginBottom: 15 },
  progressBar: { width: 150, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4caf50' }
});