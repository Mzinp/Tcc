import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  StatusBar,
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from 'expo-router';
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";

export default function Mensagens() {
  const [loading, setLoading] = useState(true);
  const [contatos, setContatos] = useState<any[]>([]);

  const theme = {
    bg: "#0f1111",
    card: "#1a1d1d",
    text: "#ffffff",
    subText: "#8b8e98",
    border: "#252828",
    accent: "#2d79f3",
    whatsapp: "#25D366"
  };

  useFocusEffect(
    useCallback(() => {
      buscarContatosDoCondominio();
    }, [])
  );

  async function buscarContatosDoCondominio() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Descobrir o condomínio do usuário (seja ele admin ou morador)
      let idCondo = null;

      const { data: adm } = await supabase.from("tb_administrador").select("id_condominio").eq("id_administrador", user.id).maybeSingle();
      if (adm) {
        idCondo = adm.id_condominio;
      } else {
        const { data: mor } = await supabase.from("tb_morador").select("id_condominio").eq("id_morador", user.id).maybeSingle();
        idCondo = mor?.id_condominio;
      }

      if (!idCondo) {
        setLoading(false);
        return;
      }

      // 2. Buscar administradores/prestadores desse condomínio
      const { data: equipe, error } = await supabase
        .from("tb_administrador")
        .select("nome, cargo, telefone")
        .eq("id_condominio", idCondo);

      if (equipe) {
        // Mapeia os dados do banco para o formato do card
        const formatados = equipe.map((func, index) => ({
          id: index.toString(),
          nome: func.nome,
          cargo: func.cargo || "Equipe Administrativa",
          tel: func.telefone || "",
          icon: func.cargo?.toLowerCase().includes("zelador") ? "build" : 
                func.cargo?.toLowerCase().includes("portaria") ? "business" : "person-circle"
        }));
        setContatos(formatados);
      }
    } catch (err) {
      console.log("Erro ao carregar contatos:", err);
    } finally {
      setLoading(false);
    }
  }

  const abrirWhats = (numero: string) => {
    if (!numero) {
      alert("Este contato não possui telefone cadastrado.");
      return;
    }
    const limpo = numero.replace(/\D/g, "");
    const url = `whatsapp://send?phone=55${limpo}`;
    Linking.openURL(url).catch(() => {
      alert("Certifique-se de que o WhatsApp está instalado.");
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mensagens</Text>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={20} color={theme.subText} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>COMUNIDADE</Text>
        
        <TouchableOpacity 
          style={[styles.mainChatCard, { backgroundColor: theme.accent }]}
          activeOpacity={0.9}
          onPress={() => router.push('/(main)/(modal)/test-chat')}
        >
          <View style={styles.chatIconCircle}>
            <Ionicons name="people" size={28} color="white" />
          </View>
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>Chat Geral - Vizzo</Text>
            <Text style={styles.chatLastMsg}>Toque para entrar na conversa</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>!</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 40 }]}>CONTATOS DIRETOS</Text>
        
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
        ) : contatos.length > 0 ? (
          contatos.map((contato) => (
            <View key={contato.id} style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
              <View style={[styles.contactIcon, { backgroundColor: theme.bg }]}>
                <Ionicons name={contato.icon as any} size={24} color={theme.accent} />
              </View>
              
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: theme.text }]}>{contato.nome}</Text>
                <Text style={[styles.contactCargo, { color: theme.subText }]}>{contato.cargo}</Text>
              </View>

              <TouchableOpacity 
                onPress={() => abrirWhats(contato.tel)}
                style={[styles.whatsBtn, { backgroundColor: theme.whatsapp }]}
              >
                <Ionicons name="logo-whatsapp" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={[styles.contactCard, { backgroundColor: theme.card, justifyContent: 'center', padding: 20 }]}>
             <Text style={{ color: theme.subText, textAlign: 'center', fontSize: 13 }}>
                Nenhum contato direto cadastrado para este condomínio.
             </Text>
          </View>
        )}

        <View style={styles.securityBox}>
            <Ionicons name="lock-closed" size={12} color={theme.subText} />
            <Text style={[styles.securityText, { color: theme.subText }]}>
                Criptografia Vizzo: Suas conversas estão seguras.
            </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 65, 
    paddingHorizontal: 25,
    marginBottom: 20
  },
  title: { fontSize: 30, fontWeight: 'bold' },
  searchBtn: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 120 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 15 },
  mainChatCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 22, 
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#2d79f3",
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  chatIconCircle: { width: 55, height: 55, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatName: { color: 'white', fontSize: 19, fontWeight: 'bold' },
  chatLastMsg: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 },
  badge: { backgroundColor: '#ff5252', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2d79f3' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  contactCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 22, 
    marginBottom: 15, 
  },
  contactIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1, marginLeft: 15 },
  contactName: { fontSize: 17, fontWeight: 'bold' },
  contactCargo: { fontSize: 13, marginTop: 2 },
  whatsBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  securityBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 50, opacity: 0.6 },
  securityText: { fontSize: 11, marginLeft: 8, fontWeight: '600' }
});