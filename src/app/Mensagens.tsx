import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Linking 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import Navegacao from "@/components/Navegacao";

export default function Mensagens() {
  const [isDark, setIsDark] = useState(true);

  function handleRota(){
    router.push('/TestChatGeral');
  }
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

  const theme = {
    bg: isDark ? "#0f1111" : "#ffffff",
    card: isDark ? "#1a1d1d" : "#f5f5f5",
    text: isDark ? "#ffffff" : "#0f1111",
    subText: isDark ? "#8b8e98" : "#666666",
    border: isDark ? "#252828" : "#eeeeee",
    accent: "#2d79f3",
    whatsapp: "#25D366"
  };

  // Função para simular abertura do WhatsApp
  const abrirWhats = (numero: string) => {
    const url = `whatsapp://send?phone=55${numero}`;
    Linking.openURL(url).catch(() => {
      alert("Certifique-se de que o WhatsApp está instalado.");
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mensagens</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={20} color={theme.subText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SEÇÃO: CHAT GERAL DO CONDOMÍNIO */}
        <Text style={[styles.sectionTitle, { color: theme.subText }]}>COMUNIDADE</Text>
        <TouchableOpacity 
          style={[styles.mainChatCard, { backgroundColor: theme.accent }]}
          activeOpacity={0.9}
          onPress={handleRota}
        >
          <View style={styles.chatIconCircle}>
            <Ionicons name="people" size={28} color="white" />
          </View>
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>Chat Geral - Vizzo</Text>
            <Text style={styles.chatLastMsg}>Vizinho: Alguém viu my carteira?</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>12</Text>
          </View>
        </TouchableOpacity>

        {/* SEÇÃO: CONTATOS ÚTEIS (ESTILO WHATSAPP) */}
        <Text style={[styles.sectionTitle, { color: theme.subText, marginTop: 30 }]}>CONTATOS DIRETOS</Text>
        
        {[
          { id: '1', nome: 'Portaria 24h', cargo: 'Atendimento', icon: 'business', tel: '11999999999' },
          { id: '2', nome: 'Síndico Rodrigo', cargo: 'Administrativo', icon: 'person-circle', tel: '11988888888' },
          { id: '3', nome: 'Zelador Marcos', cargo: 'Manutenção', icon: 'build', tel: '11977777777' },
        ].map((contato) => (
          <View key={contato.id} style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.contactIcon, { backgroundColor: isDark ? "#252828" : "#e0e0e0" }]}>
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
        ))}

        {/* FEEDBACK DE SEGURANÇA */}
        <View style={styles.securityBox}>
            <Ionicons name="lock-closed" size={12} color={theme.subText} />
            <Text style={[styles.securityText, { color: theme.subText }]}>
                As conversas são privadas e seguras.
            </Text>
        </View>

      </ScrollView>

      <Navegacao />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 25,
    marginBottom: 20
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  searchBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(120,120,120,0.1)' },
  
  scrollContent: { paddingHorizontal: 25, paddingBottom: 120 },
  sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },

  // Chat Geral Card
  mainChatCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#2d79f3",
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  chatIconCircle: { width: 55, height: 55, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  chatLastMsg: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  badge: { backgroundColor: '#ff5252', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2d79f3' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  // Contact Cards
  contactCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 12, 
    borderWidth: 1 
  },
  contactIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1, marginLeft: 15 },
  contactName: { fontSize: 16, fontWeight: 'bold' },
  contactCargo: { fontSize: 12, marginTop: 2 },
  whatsBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2 },

  securityBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40, opacity: 0.5 },
  securityText: { fontSize: 11, marginLeft: 6, fontWeight: '600' }
});