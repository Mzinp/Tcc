// importante esse 

import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';

interface BotaoVoltarProps {
  cor?: string;
  rota?: string; 
}

export default function BotaoVoltar({ cor = "#ffffff", rota }: BotaoVoltarProps) {
  const navigation = useNavigation();

  const navegar = () => {
    // 1. Se você passou uma rota específica, ele vai para ela
    if (rota) {
      router.push(rota as any);
      return;
    }

    // 2. Verifica se existe histórico para voltar (evita o erro 'GO_BACK')
    if (navigation.canGoBack()) {
      router.back();
    } else {
      // 3. Se não houver histórico, manda para a tela inicial (index) por segurança
      router.replace("/");
    }
  };

  return (
    <TouchableOpacity 
      onPress={navegar} 
      style={styles.button}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={28} color={cor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginTop: Platform.OS === 'ios' ? 50 : 30, 
    marginLeft: 15,
    alignSelf: 'flex-start',
    zIndex: 10,
  },
});