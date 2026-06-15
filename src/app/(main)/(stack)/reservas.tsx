import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { COLORS } from "@/consts/colors";
import ArrowBack from "@/components/ArrowVoltar";
import { supabase } from "@/lib/supabase";
import { useAppTheme } from "@/context/ThemeContext";

export default function Reservas() {
  const router = useRouter();
  const { theme, isDark } = useAppTheme();
  
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"admin" | "user">("user");
  const [areas, setAreas] = useState<any[]>([]);

  // Formato YYYY-MM-DD para comparar com o banco
  const hojeString = new Date().toISOString().split('T')[0];

  async function carregarDados() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let idCondominioUsuario = null;
      let isAdmin = false;

      const { data: admin } = await supabase
        .from("tb_administrador")
        .select("id_condominio")
        .eq("id_administrador", user.id)
        .maybeSingle();

      if (admin) {
        isAdmin = true;
        idCondominioUsuario = admin.id_condominio;
      } else {
        const { data: morador } = await supabase
          .from("tb_morador")
          .select("id_condominio")
          .eq("id_morador", user.id)
          .maybeSingle();
        
        if (morador) {
          idCondominioUsuario = morador.id_condominio;
        }
      }

      setUserType(isAdmin ? "admin" : "user");
      if (!idCondominioUsuario) { setLoading(false); return; }

      // 1. Busca todas as áreas do condomínio
      const { data: areasData } = await supabase
        .from("tb_area_comum")
        .select("*")
        .eq("id_condominio", idCondominioUsuario)
        .order("nome", { ascending: true });

      // 2. Busca apenas as reservas ATIVAS de hoje
      const { data: reservasHoje } = await supabase
        .from("tb_reserva")
        .select("id_area")
        .eq("id_condominio", idCondominioUsuario)
        .eq("data_reserva", hojeString)
        .in("status", ["Pendente", "Confirmado"]); // Considera ocupado se estiver pendente ou confirmado

      // 3. Mescla as informações
      const areasComStatus = (areasData || []).map((area) => {
        const reservada = reservasHoje?.some((r) => r.id_area === area.id_area);
        return { ...area, isOcupadaHoje: !!reservada };
      });

      setAreas(areasComStatus);
      
    } catch (error) {
      console.log("Erro ao carregar áreas:", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { carregarDados(); }, []));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topHeader}>
        <ArrowBack cor={theme.text} />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Áreas de Lazer</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: userType === "admin" ? theme.primary : COLORS.green }]}>
            <Text style={styles.roleText}>{userType === "admin" ? "SÍNDICO" : "MORADOR"}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {areas.map((area) => (
            <View key={area.id_area} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.iconArea}>
                <Ionicons name={(area.icone || "business") as any} size={24} color={theme.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.areaName, { color: theme.text }]}>{area.nome}</Text>
                <Text style={{ fontSize: 10, marginTop: 4, fontWeight: "bold", color: area.isOcupadaHoje ? COLORS.red : COLORS.green }}>
                  {area.isOcupadaHoje ? "🔴 OCUPADA HOJE" : "🟢 LIVRE HOJE"}
                </Text>
              </View>
              
              {userType === "admin" ? (
                <TouchableOpacity style={styles.adminBtn} onPress={() => router.push({ pathname: "/(main)/(stack)/gestaoarea", params: { idArea: area.id_area, nomeArea: area.nome, valorAtual: area.valor_reserva } })}>
                  <Text style={[styles.adminBtnText, { color: theme.primary }]}>AJUSTAR</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.reservaBtn, { backgroundColor: area.isOcupadaHoje ? theme.border : theme.primary }]} 
                  disabled={area.isOcupadaHoje}
                  onPress={() => router.push({ pathname: "/(main)/(stack)/cadastroreserva", params: { areaNome: area.nome, areaId: area.id_area } })}
                >
                  <Text style={styles.reservaBtnText}>{area.isOcupadaHoje ? "INDISPONÍVEL" : "RESERVAR"}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {userType === "admin" && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => router.push("/(main)/(stack)/gestaoarea")}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingTop: 60, paddingHorizontal: 15 },
  header: { paddingHorizontal: 25, marginTop: 15, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "bold" },
  badgeRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roleText: { color: "white", fontSize: 10, fontWeight: "900" },
  content: { padding: 25, paddingBottom: 120 },
  card: { padding: 15, borderRadius: 20, flexDirection: "row", alignItems: "center", marginBottom: 15, borderWidth: 1 },
  iconArea: { width: 50, height: 50, borderRadius: 15, backgroundColor: "rgba(45, 121, 243, 0.1)", justifyContent: "center", alignItems: "center" },
  info: { flex: 1, marginLeft: 15 },
  areaName: { fontSize: 16, fontWeight: "bold" },
  adminBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  adminBtnText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  reservaBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  reservaBtnText: { color: "white", fontSize: 10, fontWeight: "bold" },
  fab: { position: "absolute", right: 25, bottom: 90, width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 8, zIndex: 100 },
});