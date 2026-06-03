import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';
import { supabase } from "@/lib/supabase";
import { useAppTheme } from "@/context/ThemeContext"; // Importando o hook global de tema

export default function Comunicados() {
  const router = useRouter();
  const { theme } = useAppTheme(); // Consumindo o cérebro de temas do app
  const [loading, setLoading] = useState(true);
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  async function carregarDados() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Verifica perfil
      const { data: admin } = await supabase
        .from('tb_administrador')
        .select('id_condominio')
        .eq('id_administrador', user.id)
        .single();

      setIsAdmin(!!admin);

      // 2. Busca comunicados do condomínio
      const { data, error } = await supabase
        .from('tb_comunicado')
        .select('*')
        .order('data_publicacao', { ascending: false });

      if (error) throw error;
      setComunicados(data || []);

    } catch (error) {
      console.log("Erro:", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mural</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={[styles.title, { color: theme.text }]}>Comunicados</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            Fique por dentro do que acontece no condomínio
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 30 }} />
        ) : (
          <>
            {comunicados.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.subText }]}>Nenhum aviso no momento.</Text>
            ) : (
              comunicados.map((item) => (
                <View key={item.id_comunicado} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { 
                      backgroundColor: item.tipo === 'Urgente' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(45, 121, 243, 0.1)' 
                    }]}>
                      <Ionicons 
                        name={item.tipo === 'Urgente' ? "alert-circle" : "information-circle"} 
                        size={14} 
                        color={item.tipo === 'Urgente' ? COLORS.red : theme.primary} 
                      />
                      <Text style={[styles.typeText, { color: item.tipo === 'Urgente' ? COLORS.red : theme.primary }]}>
                        {item.tipo.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.subText }]}>{new Date(item.data_publicacao).toLocaleDateString('pt-BR')}</Text>
                  </View>

                  <Text style={[styles.itemTitle, { color: theme.text }]}>{item.titulo}</Text>
                  <Text style={[styles.itemContent, { color: theme.subText }]}>{item.conteudo}</Text>
                  
                  <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <Text style={[styles.authorText, { color: theme.subText }]}>Por: {item.autor || 'Administração'}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {isAdmin && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: theme.primary }]} 
          onPress={() => router.push("/(main)/(stack)/cadastrocomunicados")}
        >
          <Ionicons name="megaphone" size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 25 },
  infoBox: { marginBottom: 25 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 14 },
  card: { padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 15, elevation: 2, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
  dateText: { fontSize: 11 },
  itemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  itemContent: { fontSize: 14, lineHeight: 20 },
  footer: { marginTop: 15, paddingTop: 10, borderTopWidth: 0.5 },
  authorText: { fontSize: 11, fontStyle: 'italic' },
  fab: { position: 'absolute', right: 25, bottom: 30, width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5 }
});