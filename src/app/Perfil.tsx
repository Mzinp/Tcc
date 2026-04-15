import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import Navegacao from "@/components/Navegacao";

const { width } = Dimensions.get('window');

export default function Perfil() {
  const [isDark, setIsDark] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // Estado para abrir o QR Code

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema no Perfil");
        }
      };
      carregarTema();
    }, [])
  );

  const handleLogout = async () => {
    router.replace("/");
  };

  const theme = {
    bg: isDark ? "#0f1111" : "#ffffff",
    text: isDark ? "#ffffff" : "#0f1111",
    subText: isDark ? "#8b8e98" : "#666666",
    border: isDark ? "#1a1d1d" : "#f0f0f0",
    card: isDark ? "#1a1d1d" : "#f9f9f9",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.avatarBorder, { borderColor: "#2d79f3" }]}>
            <Image source={{ uri: 'https://github.com/gustavosilva.png' }} style={styles.avatar} />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>Gustavo Silva</Text>
          <Text style={[styles.userInfo, { color: theme.subText }]}>Bloco A - Apto 52</Text>

          {/* BOTÃO DO QR CODE CORRIGIDO - AGORA ABRE O MODAL */}
          <TouchableOpacity 
            style={[styles.qrShortcut, { backgroundColor: isDark ? theme.card : "#2d79f3" }]}
            onPress={() => setModalVisible(true)} // Abre a janelinha
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code" size={20} color="white" />
            <Text style={styles.qrShortcutText}>MEU QR CODE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {[
            { icon: 'person-outline', label: 'Meus Dados' },
            { icon: 'notifications-outline', label: 'Notificações' },
            { icon: 'shield-checkmark-outline', label: 'Privacidade' },
            { icon: 'help-circle-outline', label: 'Ajuda e Suporte' },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuItem, { borderBottomColor: theme.border }]} 
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={22} color="#2d79f3" />
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#353838" : "#ccc"} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.logoutBtn} 
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* JANELA DO QR CODE (Aparece por cima) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#1a1d1d" : "#ffffff" }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Acesso Vizzo</Text>
            
            <View style={styles.qrArea}>
                <Ionicons name="qr-code" size={200} color={isDark ? "white" : "black"} />
            </View>

            <Text style={[styles.modalInfo, { color: theme.subText }]}>Apresente este código no leitor</Text>
            
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtnText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Navegacao />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 150 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 30 },
  avatarBorder: { padding: 4, borderRadius: 60, borderWidth: 2 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  userInfo: { fontSize: 14, marginBottom: 20 },
  
  qrShortcut: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  qrShortcutText: { color: 'white', fontWeight: 'bold', marginLeft: 10, fontSize: 12, letterSpacing: 1 },

  menu: { paddingHorizontal: 25 },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18, 
    borderBottomWidth: 1 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16 },
  logoutBtn: { marginTop: 40, alignItems: 'center', paddingBottom: 20 },
  logoutText: { color: '#f44336', fontWeight: 'bold', letterSpacing: 1 },

  // Estilos do Modal corrigido
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: width * 0.8, 
    padding: 30, 
    borderRadius: 30, 
    alignItems: 'center',
    elevation: 20 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  qrArea: { padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  modalInfo: { fontSize: 12, marginTop: 20, fontWeight: '600' },
  closeBtn: { marginTop: 30, padding: 10 },
  closeBtnText: { color: '#2d79f3', fontWeight: 'bold', letterSpacing: 1 }
});