// src/context/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definição exata das paletas de cores (Dark padrão e Light para acessibilidade)
export const CoresTema = {
  dark: {
    bg: "#0f1111",
    card: "#1a1d1d",
    input: "#252828",
    border: "#353838",
    text: "#ffffff",
    subText: "#b0b0b0",
    primary: "#2d79f3",
    accent: "#ff8c00",
  },
  light: {
    bg: "#f5f6f8",
    card: "#ffffff",
    input: "#eef0f2",
    border: "#dcdfe3",
    text: "#111619",
    subText: "#6c757d",
    primary: "#2d79f3",
    accent: "#ff8c00",
  }
};

type ThemeType = 'dark' | 'light';

interface ThemeContextData {
  theme: typeof CoresTema.dark;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark');

  // Busca no armazenamento local do celular se o usuário já tinha escolhido o modo claro antes
  useEffect(() => {
    async function carregarTemaSalvo() {
      const temaSalvo = await AsyncStorage.getItem('@vizzo:theme');
      if (temaSalvo === 'light' || temaSalvo === 'dark') {
        setCurrentTheme(temaSalvo);
      }
    }
    carregarTemaSalvo();
  }, []);

  // Inverte o tema e grava a preferência do morador
  const toggleTheme = async () => {
    const proximoTema = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(proximoTema);
    await AsyncStorage.setItem('@vizzo:theme', proximoTema);
  };

  return (
    <ThemeContext.Provider value={{
      theme: CoresTema[currentTheme],
      isDark: currentTheme === 'dark',
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook mágico para usar em qualquer lugar do app com uma linha
export function useAppTheme() {
  return useContext(ThemeContext);
}