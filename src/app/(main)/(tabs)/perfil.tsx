import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Dimensions, ActivityIndicator, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router'; 
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";
import * as ImagePicker from 'expo-image-picker'; 
import { useAppTheme } from "@/context/ThemeContext"; // Importação limpa usando @/

const { width } = Dimensions.get('window');

export default function Perfil() {
  const { theme, isDark, toggleTheme } = useAppTheme(); // Puxando o tema global do cérebro do app
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); 
  
  const [nome, setNome] = useState("Usuário");
  const [infoExtra, setInfoExtra] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null); 
  const [dadosCompletos, setDadosCompletos] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
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
        setFotoUrl(admin.foto_url || null);
        setDadosCompletos({ ...admin, email: user.email, tipo: 'ADM' });
      } else {
        const { data: morador } = await supabase
          .from("tb_morador")
          .select("*")
          .eq("id_morador", user.id)
          .maybeSingle();

        if (morador) {
          setNome(morador.Nome || morador.nome);
          setInfoExtra(`Bloco ${morador.Bloco || ''} - Apto ${morador.Apartamento || morador.num_apartamento || ''}`);
          setFotoUrl(morador.foto_url || null);
          setDadosCompletos({ ...morador, tipo: 'MORADOR' });
        }
      }
    } catch (error) {
      console.log("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  async function alterarFotoPerfil() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos para alterar a imagem de perfil.");
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, 
        aspect: [1, 1],
        quality: 0.7, 
      });

      if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) {
        return; 
      }

      const imagemSelecionada = resultado.assets[0];
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const formData = new FormData();
      const nomeArquivo = `${user.id}-${Date.now()}.jpg`; 

      formData.append('file', {
        uri: imagemSelecionada.uri,
        name: nomeArquivo,
        type: 'image/jpeg',
      } as any);

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(nomeArquivo, formData, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(nomeArquivo);

      if (dadosCompletos?.tipo === 'ADM') {
        await supabase
          .from("tb_administrador")
          .update({ foto_url: publicUrl })
          .eq("id_administrador", user.id);
      } else {
        await supabase
          .from("tb_morador")
          .update({ foto_url: publicUrl })
          .eq("id_morador", user.id);
      }

      setFotoUrl(publicUrl);
      Alert.alert("Sucesso", "Sua foto de perfil foi atualizada com sucesso!");

    } catch (error: any) {
      console.log("Erro no upload:", error);
      Alert.alert("Erro no Servidor", "Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  const verMeusDados = () => {
    router.push({
      pathname: "/(main)/(stack)/meus-dados",
      params: { cache: 'true' }
    });
  };

  const handleSuporteEmail = () => {
    const email = "SuporteVizzoEquipeAllSet@gmail.com";
    const subject = "Suporte App Vizzo";
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); 
  };

  const uriFotoFinal = fotoUrl 
    ? fotoUrl 
    : `https://ui-avatars.com/api/?name=${nome}&background=2d79f3&color=fff`;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          
          <TouchableOpacity 
            style={[styles.avatarBorder, { borderColor: theme.primary }]} 
            onPress={alterarFotoPerfil}
            activeOpacity={0.8}
            disabled={uploading}
          >
            {uploading ? (
              <View style={[styles.avatar, styles.loadingAvatarContainer]}>
                <ActivityIndicator color="white" size="large" />
              </View>
            ) : (
              <View>
                <Image source={{ uri: uriFotoFinal }} style={styles.avatar} />
                <View style={[styles.editIconBadge, { backgroundColor: theme.primary, borderColor: theme.bg }]}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
          ) : (
            <>
              <Text style={[styles.userName, { color: theme.text }]}>{nome}</Text>
              <Text style={[styles.userInfo, { color: theme.subText }]}>{infoExtra}</Text>
            </>
          )}

          <TouchableOpacity 
            style={[styles.qrShortcut, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="qr-code" size={20} color="white" />
            <Text style={styles.qrShortcutText}>MEU QR CODE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {[
            { icon: 'person-outline', label: 'Meus Dados', action: verMeusDados },
            { icon: 'color-filter-outline', label: isDark ? 'Modo Claro (Acessibilidade)' : 'Modo Escuro (Padrão)', action: toggleTheme },
            { icon: 'notifications-outline', label: 'Notificações', action: () => {} },
            { icon: 'shield-checkmark-outline', label: 'Privacidade', action: () => {} },
            { icon: 'help-circle-outline', label: 'Ajuda e Suporte', action: handleSuporteEmail }, // Função de e-mail aqui!
          ].map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuItem, { borderBottomColor: theme.border }]} 
              onPress={item.action}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={22} color={theme.primary} />
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.border} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent visible={modalVisible}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Acesso Vizzo</Text>
            <Ionicons name="qr-code" size={200} color={theme.text} />
            <Text style={[styles.modalInfo, { color: theme.subText }]}>Apresente este código no leitor</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeBtnText, { color: theme.primary }]}>FECHAR</Text>
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
  avatarBorder: { padding: 4, borderRadius: 60, borderWidth: 2, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  loadingAvatarContainer: { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
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
  closeBtnText: { fontWeight: 'bold' }
});