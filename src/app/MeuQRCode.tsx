import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import QRCode from 'react-native-qrcode-svg'; // Precisa instalar: npx expo install react-native-qrcode-svg
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BotaoVoltar from "@/components/ArrowVoltar";

export default function MeuQRCode() {
  const [isDark, setIsDark] = useState(true);
  
  // Simulando dados que viriam do perfil do usuário ou do banco
  const dadosUsuario = {
    id: "user_9921",
    nome: "Gustavo",
    apto: "Apto 102 - Bloco B",
    servico: "Manutenção de Computadores",
    valor: "R$ 100,00"
  };

  // Transformamos os dados em uma String para o QR Code
  const qrValor = JSON.stringify(dadosUsuario);

  useEffect(() => {
    const carregarTema = async () => {
      const salvo = await AsyncStorage.getItem('@vizzo_theme');
      if (salvo !== null) setIsDark(salvo === 'dark');
    };
    carregarTema();
  }, []);

  const theme = {
    bg: isDark ? "#0f1111" : "#ffffff",
    card: isDark ? "#1a1d1d" : "#f9f9f9",
    text: isDark ? "#ffffff" : "#0f1111",
    subText: isDark ? "#8b8e98" : "#666666",
    border: isDark ? "#252828" : "#eeeeee"
  };

  // Função para compartilhar o código (Opcional, mas dá nota no TCC!)
  const onShare = async () => {
    try {
      await Share.share({
        message: `Olá! Este é meu perfil de prestador no Vizzo para o serviço: ${dadosUsuario.servico}.`,
      });
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <BotaoVoltar cor={theme.text} />
        <Text style={[styles.title, { color: theme.text }]}>Meu QR Code</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.infoText, { color: theme.subText }]}>
          Apresente este código para que um vizinho possa contratar seu serviço instantaneamente.
        </Text>

        {/* CARD DO QR CODE */}
        <View style={[styles.qrCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValor}
              size={200}
              color={isDark ? "#ffffff" : "#0f1111"}
              backgroundColor="transparent"
            />
          </View>
          
          <Text style={[styles.userName, { color: theme.text }]}>{dadosUsuario.nome}</Text>
          <Text style={[styles.userApto, { color: "#2d79f3" }]}>{dadosUsuario.apto}</Text>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <Text style={[styles.serviceTitle, { color: theme.subText }]}>SERVIÇO OFERECIDO</Text>
          <Text style={[styles.serviceName, { color: theme.text }]}>{dadosUsuario.servico}</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
          <Ionicons name="share-social-outline" size={20} color="white" />
          <Text style={styles.shareText}>Compartilhar Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 30, alignItems: 'center' },
  infoText: { textAlign: 'center', marginBottom: 30, fontSize: 14, lineHeight: 20 },
  qrCard: { 
    width: '100%', 
    padding: 30, 
    borderRadius: 25, 
    alignItems: 'center', 
    borderWidth: 1,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  qrWrapper: { padding: 15, backgroundColor: 'white', borderRadius: 15, marginBottom: 20 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userApto: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  divider: { height: 1, width: '100%', marginVertical: 20 },
  serviceTitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  serviceName: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  shareBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#2d79f3', 
    padding: 18, 
    borderRadius: 15, 
    marginTop: 40, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  shareText: { color: 'white', fontWeight: 'bold', marginLeft: 10 }
});