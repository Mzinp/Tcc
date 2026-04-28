import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Dimensions, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router'; // 'router' já está importado aqui
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";

const { width } = Dimensions.get('window');

export default function Perfil() {
  const [isDark, setIsDark] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States para os dados do banco
  const [nome, setNome] = useState("Usuário");
  const [infoExtra, setInfoExtra] = useState("");
  const [dadosCompletos, setDadosCompletos] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      setIsDark(true); 
      buscarDadosUsuario();
    }, [])
  );

  async function buscarDadosUsuario() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: admin } = await supabase
        .from("tb_administrador")
        .select("*")
        .eq("id_administrador", user.id)
        .maybeSingle();

      if (admin) {
        setNome(admin.nome);
        setInfoExtra("Administrador do Sistema");
        setDadosCompletos({ ...admin, email: user.email, tipo: 'ADM' });
      } else {
        const { data: morador } = await supabase
          .from("tb_morador")
          .select("*")
          .eq("id_morador", user.id)
          .maybeSingle();

        if (morador) {
          setNome(morador.Nome || morador.nome);
          setInfoExtra(`Bloco ${morador.Bloco} - Apto ${morador.Apartamento}`);
          setDadosCompletos({ ...morador, tipo: 'MORADOR' });
        }
      }
    } catch (error) {
      console.log("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  // MUDANÇA AQUI: Agora navega em vez de mostrar Alert
  const verMeusDados = () => {
    router.push({
      pathname: "/(main)/(stack)/meus-dados",
      params: { cache: 'true' } // Opcional: sinaliza que já temos dados
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); 
  };

  const theme = {
    bg: "#0f1111",
    text: "#ffffff",
    subText: "#b0b0b0",
    border: "#1a1d1d",
    card: "#1a1d1d",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.avatarBorder, { borderColor: "#2d79f3" }]}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${nome}&background=2d79f3&color=fff` }} 
              style={styles.avatar} 
            />
          </View>

          {loading ? (
            <ActivityIndicator color="#2d79f3" style={{ marginTop: 20 }} />
          ) : (
            <>
              <Text style={[styles.userName, { color: theme.text }]}>{nome}</Text>
              <Text style={[styles.userInfo, { color: theme.subText }]}>{infoExtra}</Text>
            </>
          )}

          <TouchableOpacity 
            style={[styles.qrShortcut, { backgroundColor: "#2d79f3" }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="qr-code" size={20} color="white" />
            <Text style={styles.qrShortcutText}>MEU QR CODE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {[
            { icon: 'person-outline', label: 'Meus Dados', action: verMeusDados },
            { icon: 'notifications-outline', label: 'Notificações', action: () => {} },
            { icon: 'shield-checkmark-outline', label: 'Privacidade', action: () => {} },
            { icon: 'help-circle-outline', label: 'Ajuda e Suporte', action: () => {} },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuItem, { borderBottomColor: theme.border }]} 
              onPress={item.action}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={22} color="#2d79f3" />
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#353838" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent visible={modalVisible}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: "#1a1d1d" }]}>
            <Text style={[styles.modalTitle, { color: 'white' }]}>Acesso Vizzo</Text>
            <Ionicons name="qr-code" size={200} color="white" />
            <Text style={[styles.modalInfo, { color: '#ccc' }]}>Apresente este código no leitor</Text>
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
  qrShortcut: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30 },
  qrShortcutText: { color: 'white', fontWeight: 'bold', marginLeft: 10, fontSize: 12 },
  menu: { paddingHorizontal: 25 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16 },
  logoutBtn: { marginTop: 40, alignItems: 'center' },
  logoutText: { color: "#ff5252", fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 30, borderRadius: 30, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalInfo: { fontSize: 12, marginTop: 20 },
  closeBtn: { marginTop: 30 },
  closeBtnText: { color: "#2d79f3", fontWeight: 'bold' }
});