import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';

// Interface para garantir que o TypeScript entenda as propriedades
interface BotaoVoltarProps {
  cor?: string;
  rota?: string; 
}

export default function BotaoVoltar({ cor = "#ffffff", rota }: BotaoVoltarProps) {
  const navigation = useNavigation();

  const navegar = () => {
    // 1. Se você passou uma rota específica (ex: "/home"), ele força a ida para lá
    if (rota) {
      router.push(rota as any);
      return;
    }

    // 2. Verifica se existe histórico (evita travar o app se abrir direto em uma tela interna)
    if (navigation.canGoBack()) {
      router.back();
    } else {
      // 3. Segurança: Se não puder voltar, vai para a raiz do app
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
    // Ajuste de margem para não bater na barra de status do Android/iOS
    marginTop: Platform.OS === 'ios' ? 50 : 30, 
    marginLeft: 15,
    alignSelf: 'flex-start',
    zIndex: 10, // Garante que o botão fique em cima de outros elementos
  },
});