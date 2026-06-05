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

  // Pega a data de hoje no formato YYYY-MM-DD
  const hojeString = new Date().toLocaleDateString('en-CA');

  // Busca as áreas atreladas ao condomínio do usuário
  async function carregarDados() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) return;

      let idCondominioUsuario = null;
      let isAdmin = false;

      // 1. Verifica se o usuário é Síndico (Administrador)
      const { data: admin } = await supabase
        .from("tb_administrador")
        .select("id_administrador, id_condominio")
        .eq("id_administrador", user.id)
        .maybeSingle();

      if (admin) {
        isAdmin = true;
        idCondominioUsuario = admin.id_condominio;
      } else {
        // 2. Se não for síndico, busca como Morador
        const { data: morador } = await supabase
          .from("tb_morador")
          .select("id_morador, id_condominio")
          .eq("id_morador", user.id)
          .maybeSingle();
        
        if (morador) {
          isAdmin = false;
          idCondominioUsuario = morador.id_condominio;
        }
      }

      setUserType(isAdmin ? "admin" : "user");

      if (!idCondominioUsuario) {
        setLoading(false);
        return;
      }

      // 3. Puxa as áreas de lazer exclusivas daquele condomínio
      const { data: areasData, error } = await supabase
        .from("tb_area_comum")
        .select("*")
        .eq("id_condominio", idCondominioUsuario)
        .order("nome", { ascending: true });

      if (error) throw error;

      // 4. Busca as reservas DE HOJE no banco
      const { data: reservasHoje } = await supabase
        .from("tb_reserva")
        .select("id_area")
        .eq("id_condominio", idCondominioUsuario)
        .eq("data_reserva", hojeString)
        .neq("status", "Recusado"); // Não conta se foi rejeitada

      // 5. Mescla as áreas com a informação de ocupação
      const areasComStatus = (areasData || []).map((area) => {
        const reservada = reservasHoje?.some((reserva) => reserva.id_area === area.id_area);
        return {
          ...area,
          isOcupadaHoje: !!reservada, // true se estiver reservada hoje, false se não
        };
      });

      setAreas(areasComStatus);
      
    } catch (error) {
      console.log("Erro ao carregar áreas:", error);
    } finally {
      setLoading(false);
    }
  }

  // Recarrega os dados toda vez que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topHeader}>
        <ArrowBack cor={theme.text} />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Áreas de Lazer
        </Text>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  userType === "admin" ? theme.primary : COLORS.green,
              },
            ]}
          >
            <Text style={styles.roleText}>
              {userType === "admin" ? "SÍNDICO" : "MORADOR"}
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: isDark ? theme.primary : "#1e5bb8" }]}>
            {userType === "admin"
              ? "Gestão de Espaços"
              : "Disponibilidade em tempo real"}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {areas.length === 0 && (
            <Text style={{ color: theme.subText, textAlign: "center", marginTop: 20 }}>
              Nenhuma área cadastrada pelo síndico.
            </Text>
          )}

          {areas.map((area) => (
            <View
              key={area.id_area}
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.iconArea}>
                <Ionicons
                  name={(area.icone || "business") as any}
                  size={24}
                  color={theme.primary}
                />
              </View>

              <View style={styles.info}>
                <Text style={[styles.areaName, { color: theme.text }]}>
                  {area.nome}
                </Text>
                <View style={styles.statusRow}>
                  <Text style={[styles.priceText, { color: theme.subText }]}>
                    Taxa:{" "}
                    <Text style={{ color: COLORS.green, fontWeight: "bold" }}>
                      R$ {area.valor_reserva ? area.valor_reserva.toFixed(2) : "0.00"}
                    </Text>
                  </Text>
                </View>
                
                {/* MARCADOR DE DISPONIBILIDADE NO BANCO DE DADOS */}
                <Text style={{ 
                  fontSize: 10, 
                  marginTop: 4, 
                  fontWeight: "bold", 
                  color: area.isOcupadaHoje ? COLORS.red : COLORS.green 
                }}>
                  {area.isOcupadaHoje ? "🔴 OCUPADA HOJE" : "🟢 LIVRE HOJE"}
                </Text>
              </View>

              {userType === "admin" ? (
                // BOTÃO DO SÍNDICO (Ajustar valor/nome da área)
                <TouchableOpacity
                  style={[
                    styles.adminBtn,
                    { backgroundColor: "rgba(45, 121, 243, 0.1)" },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/(main)/(stack)/gestaoarea",
                      params: {
                        idArea: area.id_area,
                        nomeArea: area.nome,
                        valorAtual: area.valor_reserva ? area.valor_reserva.toString() : "0",
                      },
                    })
                  }
                >
                  <Text style={[styles.adminBtnText, { color: theme.primary }]}>
                    AJUSTAR
                  </Text>
                </TouchableOpacity>
              ) : (
                // BOTÃO DO MORADOR (Trava se estiver ocupado)
                <TouchableOpacity
                  style={[
                    styles.reservaBtn, 
                    { backgroundColor: area.isOcupadaHoje ? theme.border : theme.primary }
                  ]}
                  disabled={area.isOcupadaHoje}
                  onPress={() =>
                    router.push({
                      pathname: "/(main)/(stack)/cadastroreserva",
                      params: { areaNome: area.nome, areaId: area.id_area },
                    })
                  }
                >
                  <Text style={[styles.reservaBtnText, { color: area.isOcupadaHoje ? theme.subText : "white" }]}>
                    {area.isOcupadaHoje ? "INDISPONÍVEL" : "RESERVAR"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Botão Flutuante (FAB) para o Admin cadastrar novas áreas */}
      {userType === "admin" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/(main)/(stack)/gestaoarea")}
        >
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
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  roleText: { color: "white", fontSize: 10, fontWeight: "900" },
  subtitle: { fontSize: 12, fontWeight: "500" },
  content: { padding: 25, paddingBottom: 100 }, 
  card: {
    padding: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconArea: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(45, 121, 243, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 15 },
  areaName: { fontSize: 16, fontWeight: "bold" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  priceText: { fontSize: 12 },
  adminBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  adminBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  reservaBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  reservaBtnText: { color: "white", fontSize: 10, fontWeight: "bold" },
  fab: {
    position: "absolute",
    right: 25,
    bottom: 30, 
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});