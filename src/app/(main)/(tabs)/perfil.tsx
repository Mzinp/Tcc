import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";

const { width } = Dimensions.get('window');

export default function Perfil() {
  const [isDark, setIsDark] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States para os dados do banco
  const [nome, setNome] = useState("Carregando...");
  const [infoExtra, setInfoExtra] = useState("");

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
      buscarDadosUsuario(); // Busca os dados sempre que a tela focar
    }, [])
  );

  async function buscarDadosUsuario() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Busca na tabela de Morador
      const { data: morador } = await supabase
        .from("tb_morador")
        .select("nome_morador, num_apartamento, bloco")
        .eq("id_morador", user.id)
        .single();

      if (morador) {
        setNome(morador.nome_morador);
        setInfoExtra(`Bloco ${morador.bloco} - Apto ${morador.num_apartamento}`);
      } else {
        // Se não for morador, busca na tabela de Administrador
        const { data: admin } = await supabase
          .from("tb_administrador")
          .select("nome_administrador")
          .eq("id_administrador", user.id)
          .single();

        if (admin) {
          setNome(admin.nome_administrador);
          setInfoExtra("Administrador do Sistema");
        }
      }
    } catch (error) {
      console.log("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/Login"); 
  };

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    border: isDark ? "#1a1d1d" : COLORS.light.border,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.avatarBorder, { borderColor: COLORS.primary }]}>
            {/* Mantive a imagem fixa, mas você pode integrar com storage depois */}
            <Image source={{ uri: 'https://ui-avatars.com/api/?name=' + nome + '&background=2d79f3&color=fff' }} style={styles.avatar} />
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <>
              <Text style={[styles.userName, { color: theme.text }]}>{nome}</Text>
              <Text style={[styles.userInfo, { color: theme.subText }]}>{infoExtra}</Text>
            </>
          )}

          <TouchableOpacity 
            style={[styles.qrShortcut, { backgroundColor: isDark ? theme.card : COLORS.primary }]}
            onPress={() => setModalVisible(true)}
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
                <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
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
          <View style={[styles.modalContent, { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.bg }]}>
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
  logoutText: { color: "#ff5252", fontWeight: 'bold', letterSpacing: 1 },
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
  closeBtnText: { color: COLORS.primary, fontWeight: 'bold', letterSpacing: 1 }
});