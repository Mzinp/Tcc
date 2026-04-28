import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from 'expo-router';
import { COLORS } from "@/consts/colors";

export default function Mensagens() {
  
  // Forçamos o padrão visual do app (Full Black)
  const theme = {
    bg: "#0f1111",
    card: "#1a1d1d",
    text: "#ffffff",
    subText: "#8b8e98",
    border: "#252828",
    accent: "#2d79f3",
    whatsapp: "#25D366"
  };

  function handleRota(){
    router.push('/(main)/(modal)/test-chat');
  }

  const abrirWhats = (numero: string) => {
    const url = `whatsapp://send?phone=55${numero}`;
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
          onPress={handleRota}
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
        
        {[
          { id: '1', nome: 'Portaria 24h', cargo: 'Atendimento e Segurança', icon: 'business', tel: '11999999999' },
          { id: '2', nome: 'Síndico Rodrigo', cargo: 'Administrativo', icon: 'person-circle', tel: '11988888888' },
          { id: '3', nome: 'Zelador Marcos', cargo: 'Manutenção', icon: 'build', tel: '11977777777' },
        ].map((contato) => (
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
        ))}

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