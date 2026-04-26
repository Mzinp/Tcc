import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "@/consts/colors";

export default function Sucesso() {
  const { mensagem, proximaTela } = useLocalSearchParams();
  const [isDark, setIsDark] = useState(true);
  
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

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
      // Se não vier destino, volta para a home das tabs
      const destino = (proximaTela as string) || "/(main)/(tabs)/home";
      router.replace(destino as any);
    }, 3500);

    return () => clearTimeout(timer);
  }, [proximaTela]);

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    text: isDark ? "white" : COLORS.light.text,
    subtitle: isDark ? COLORS.dark.subText : "#666666",
    footer: isDark ? "#353838" : "#aaaaaa"
  };

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  // Função para definir o texto do rodapé dinamicamente
  const getFooterText = () => {
    if (proximaTela === "/(auth)/Login") return "INDO PARA O LOGIN";
    if (proximaTela === "/(main)/(tabs)/marketplace") return "VOLTANDO AO MARKETPLACE";
    return "VOLTANDO PARA A HOME";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      
      <Animated.View style={[
        styles.iconCircle, 
        { 
          transform: [{ scale: scaleValue }], 
          opacity: opacityValue,
          shadowColor: COLORS.green,
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
            {getFooterText()}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.input }]}>
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
    backgroundColor: COLORS.green, justifyContent: 'center', alignItems: 'center',
    marginBottom: 40, elevation: 15, shadowOpacity: 0.3, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }
  },
  whiteRing: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center'
  },
  title: { fontSize: 32, fontWeight: 'bold', letterSpacing: -1 },
  divider: { width: 40, height: 4, backgroundColor: COLORS.green, borderRadius: 2, marginVertical: 15 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  loaderContainer: { position: 'absolute', bottom: 60, alignItems: 'center', width: '100%' },
  footer: { fontSize: 10, letterSpacing: 2, fontWeight: '800', marginBottom: 15 },
  progressBar: { width: 150, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.green }
});