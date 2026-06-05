import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from 'expo-router';
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';
import { supabase } from "@/lib/supabase"; 
import { useAppTheme } from "@/context/ThemeContext";
import QRCode from 'react-native-qrcode-svg';

export default function Encomendas() {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [encomendas, setEncomendas] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("Pendentes");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  async function carregarEncomendas() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: admin } = await supabase.from('tb_administrador').select('id_condominio').eq('id_administrador', user.id).single();
      let query = supabase.from('tb_encomendas').select('*');
      
      if (admin) {
        query = query.eq('id_condominio', admin.id_condominio);
      } else {
        const { data: morador } = await supabase.from('tb_morador').select('id_morador').eq('id_morador', user.id).single();
        if (morador) query = query.eq('id_morador', morador.id_morador);
      }
      
      const { data, error } = await query.order('data_recebimento', { ascending: false });
      if (error) throw error;
      setEncomendas(data || []);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar encomendas.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { carregarEncomendas(); }, []));

  // Filtro de encomendas
  const encomendasFiltradas = encomendas.filter(e => {
    if (filtro === "Todos") return true;
    return e.status === filtro;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topHeader}><ArrowBack cor={theme.text} /></View>

      <View style={styles.headerInfo}>
        <Text style={[styles.title, { color: theme.text }]}>Encomendas</Text>
        
        {/* Filtros Funcionais */}
        <View style={styles.filterRow}>
          {["Todos", "Pendentes", "Retirado"].map((f) => (
            <TouchableOpacity key={f} onPress={() => setFiltro(f)} style={[styles.filterBtn, filtro === f && { backgroundColor: theme.primary }]}>
              <Text style={{ color: filtro === f ? 'white' : theme.subText, fontSize: 12, fontWeight: 'bold' }}>{f.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator size="large" color={theme.primary} /> : (
          encomendasFiltradas.map((item) => (
            <TouchableOpacity 
              key={item.id_encomenda} 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => item.status === 'Pendentes' && setSelectedItem(item) || setModalVisible(true)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.status === 'Retirado' ? theme.border : 'rgba(45, 121, 243, 0.1)' }]}>
                <Ionicons name={item.status === 'Retirado' ? "mail-open-outline" : "cube"} size={24} color={item.status === 'Retirado' ? theme.subText : theme.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.objetoText, { color: theme.text }]}>{item.descricao}</Text>
                <Text style={[styles.detailText, { color: theme.subText }]}>{new Date(item.data_recebimento).toLocaleDateString('pt-BR')}</Text>
              </View>
              {item.status === 'Pendentes' && <Ionicons name="qr-code-outline" size={20} color={theme.primary} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal QR Code */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: theme.text }}>Retirada</Text>
                {selectedItem && <QRCode value={selectedItem.id_encomenda.toString()} size={200} />}
                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}><Text style={{ color: 'white' }}>FECHAR</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingTop: 60, paddingHorizontal: 15 },
  headerInfo: { paddingHorizontal: 25, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', marginTop: 15 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#ccc' },
  content: { paddingBottom: 50 },
  card: { marginHorizontal: 20, padding: 15, borderRadius: 22, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  iconBox: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  objetoText: { fontSize: 16, fontWeight: 'bold' },
  detailText: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 30, borderRadius: 25, alignItems: 'center' },
  closeBtn: { marginTop: 20, backgroundColor: COLORS.red, padding: 10, borderRadius: 10 }
});