import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";
import ArrowBack from "@/components/ArrowVoltar";

export default function MeuQRCode() {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [serviçoAtivo, setServiçoAtivo] = useState<any>(null);
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      
      // 1. Carregar Tema
      const salvo = await AsyncStorage.getItem('@vizzo_theme');
      if (salvo !== null) setIsDark(salvo === 'dark');

      // 2. Pegar Usuário Logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 3. Buscar Nome do Morador
      const { data: morador } = await supabase
        .from("tb_morador")
        .select("nome_morador, bloco, num_apartamento")
        .eq("id_morador", user.id)
        .single();

      if (morador) setNomeUsuario(morador.nome_morador);

      // 4. Buscar o Serviço mais recente deste morador
      const { data: servico } = await supabase
        .from("tb_servico")
        .select("*")
        .eq("id_morador", user.id)
        .eq("status_servico", "Ativo")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (servico) {
        setServiçoAtivo({
          id: servico.id_servico,
          nome: morador?.nome_morador || "Usuário",
          apto: `Bloco ${morador?.bloco} - Apt ${morador?.num_apartamento}`,
          servico: servico.nome_servico,
          valor: `R$ ${servico.valor_estimado}`
        });
      }
    } catch (error) {
      console.log("Erro ao carregar QR Code:", error);
    } finally {
      setLoading(false);
    }
  }

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    border: isDark ? COLORS.dark.border : COLORS.light.border
  };

  const onShare = async () => {
    if (!serviçoAtivo) return;
    try {
      await Share.share({
        message: `Vizzo Marketplace: Confira meu serviço de ${serviçoAtivo.servico}. Escaneie meu QR Code no app!`,
      });
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.title, { color: theme.text }]}>Meu QR Code</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.infoText, { color: theme.subText }]}>
          Apresente este código para que um vizinho possa contratar seu serviço instantaneamente.
        </Text>

        {serviçoAtivo ? (
          <View style={[styles.qrCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={JSON.stringify({ id_servico: serviçoAtivo.id, prestador: serviçoAtivo.nome })}
                size={200}
                color="black"
                backgroundColor="white"
              />
            </View>
            
            <Text style={[styles.userName, { color: theme.text }]}>{serviçoAtivo.nome}</Text>
            <Text style={[styles.userApto, { color: COLORS.primary }]}>{serviçoAtivo.apto}</Text>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <Text style={[styles.serviceTitle, { color: theme.subText }]}>SERVIÇO OFERECIDO</Text>
            <Text style={[styles.serviceName, { color: theme.text }]}>{serviçoAtivo.servico}</Text>
          </View>
        ) : (
          <View style={[styles.qrCard, { backgroundColor: theme.card, borderColor: theme.border, padding: 40 }]}>
            <Ionicons name="alert-circle-outline" size={50} color={COLORS.orange} />
            <Text style={[styles.userName, { color: theme.text, textAlign: 'center', marginTop: 10 }]}>Nenhum serviço ativo</Text>
            <Text style={[styles.infoText, { color: theme.subText, marginTop: 10 }]}>Você precisa cadastrar um serviço no Marketplace para gerar seu QR Code.</Text>
          </View>
        )}

        {serviçoAtivo && (
          <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
            <Ionicons name="share-social-outline" size={20} color="white" />
            <Text style={styles.shareText}>Compartilhar Perfil</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: COLORS.primary, 
    padding: 18, 
    borderRadius: 15, 
    marginTop: 40, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  shareText: { color: 'white', fontWeight: 'bold', marginLeft: 10 }
});