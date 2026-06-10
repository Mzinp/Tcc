import { COLORS } from "@/consts/colors";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useAppTheme } from "@/context/ThemeContext"; 
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const { theme, isDark } = useAppTheme(); 
  
  const [menuVisible, setMenuVisible] = useState(false);
  
  // NOVOS ESTADOS PARA O AVISO
  const [avisoVisible, setAvisoVisible] = useState(false);
  const [ultimoAviso, setUltimoAviso] = useState("Carregando avisos...");
  
  const [nomeUsuario, setNomeUsuario] = useState("Carregando...");
  const [nomeCondominio, setNomeCondominio] = useState("Carregando...");
  const [isAdmin, setIsAdmin] = useState(false);

  async function carregarPerfil() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      let nomeFinal = user.user_metadata?.nome || "Usuário";
      let adminFinal = user.user_metadata?.cargo ? true : false;
      let idCondominioUsuario = null;

      const { data: adminData } = await supabase
        .from("tb_administrador")
        .select("*")
        .eq("id_administrador", user.id)
        .maybeSingle();

      if (adminData) {
        if (!adminData.id_condominio) {
          router.replace("/CriarCondominio");
          return;
        }

        nomeFinal = adminData.nome || nomeFinal;
        adminFinal = true;
        idCondominioUsuario = adminData.id_condominio;
      } else {
        const { data: moradorData } = await supabase
          .from("tb_morador")
          .select("*")
          .eq("id_morador", user.id)
          .maybeSingle();

        if (moradorData) {
          nomeFinal = moradorData.nome || nomeFinal;
          adminFinal = false;
          idCondominioUsuario = moradorData.id_condominio;
        }
      }

      let nomeCondominioFinal = "Vizzo";
      
      if (idCondominioUsuario) {
        const { data: condominioData, error: condominioError } = await supabase
          .from("tb_condominio")
          .select("nome_condominio")
          .eq("id_condominio", idCondominioUsuario)
          .maybeSingle();

        if (condominioData && condominioData.nome_condominio) {
          nomeCondominioFinal = condominioData.nome_condominio;
        }

        // ---------------------------------------------------------
        // DICA: Aqui o Mateus pode fazer o Select na tabela de comunicados
        // buscando o aviso mais recente usando o 'idCondominioUsuario'
        // ---------------------------------------------------------
        // Exemplo:
        // const { data: aviso } = await supabase.from('tb_comunicados').select('titulo').eq('id_condominio', idCondominioUsuario).order('created_at', { ascending: false }).limit(1).maybeSingle();
        // if(aviso) setUltimoAviso(aviso.titulo);
        // else setUltimoAviso("Tudo tranquilo! Nenhum aviso recente.");
        // ---------------------------------------------------------
        
        // Simulação enquanto não liga no banco:
        setUltimoAviso("Não Há Avisos Disponíveis, Aguarde o Administrador do condomínio.");
      }

      setNomeUsuario(nomeFinal.split(" ")[0]); 
      setNomeCondominio(nomeCondominioFinal);
      setIsAdmin(adminFinal);

    } catch (error) {
      console.log("Erro ao carregar dados:", error);
      setNomeUsuario("Vizinho");
      setNomeCondominio("Vizzo");
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

  const SERVICOS_RAPIDOS = isAdmin
    ? [
        { name: "Assembleia Geral", icon: "megaphone", color: "#3b82f6", route: "/(main)/(stack)/comunicados" },
        { name: "Ocorrências", icon: "warning", color: COLORS.red, route: "/(main)/(stack)/ocorrencias" },
        { name: "Gestão Reservas", icon: "calendar", color: COLORS.orange, route: "/(main)/(stack)/reservas" },
        { name: "Encomendas", icon: "cube", color: COLORS.primary, route: "/(main)/(stack)/encomendas" },
        { name: "Visitantes", icon: "people", color: COLORS.green, route: "/(main)/(stack)/visitantes" },
        { name: "Lista Moradores", icon: "list", color: "#059669", route: "/(main)/(stack)/moradores" },
        { name: "Gestão de Áreas", icon: "business", color: "#8b5cf6", route: "/(main)/(stack)/gestaoarea" },
      ]
    : [
        { name: "Assembleia Geral", icon: "megaphone", color: "#3b82f6", route: "/(main)/(stack)/comunicados" },
        { name: "Ocorrências", icon: "warning", color: COLORS.red, route: "/(main)/(stack)/ocorrencias" },
        { name: "Reservas", icon: "calendar", color: COLORS.orange, route: "/(main)/(stack)/reservas" },
        { name: "Encomendas", icon: "cube", color: COLORS.primary, route: "/(main)/(stack)/encomendas" },
        { name: "Visitantes", icon: "people", color: COLORS.green, route: "/(main)/(stack)/visitantes" },
      ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.primary }]}>
            Olá, {nomeUsuario} {isAdmin && "(ADM)"}
          </Text>
          <Text style={[styles.subGreeting, { color: theme.subText }]}>
            {nomeCondominio}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuTrigger} onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color={isDark ? "#ffffff" : theme.primary} />
        </TouchableOpacity>
      </View>

      {/* MODAL DE MENU (SAIR) */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuPopUp, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setMenuVisible(false);
                await supabase.auth.signOut();
                router.replace("/login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
              <Text style={[styles.menuItemText, { color: theme.text }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* MODAL DO BALÃO DE AVISO */}
      <Modal transparent visible={avisoVisible} animationType="fade">
        <View style={styles.modalAvisoOverlay}>
          <View style={[styles.modalAvisoContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalAvisoHeader}>
              <View style={styles.iconAvisoContainer}>
                <Ionicons name="notifications" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.modalAvisoTitle, { color: theme.text }]}>Último Aviso</Text>
            </View>
            
            <Text style={[styles.modalAvisoText, { color: theme.text }]}>
              {ultimoAviso}
            </Text>

            <View style={styles.modalAvisoButtons}>
              <TouchableOpacity 
                style={[styles.btnAvisoClose, { borderColor: theme.border }]} 
                onPress={() => setAvisoVisible(false)}
              >
                <Text style={[styles.btnAvisoCloseText, { color: theme.subText }]}>Fechar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btnAvisoIr, { backgroundColor: theme.primary }]} 
                onPress={() => {
                  setAvisoVisible(false);
                  router.push("/(main)/(stack)/comunicados");
                }}
              >
                <Text style={styles.btnAvisoIrText}>Ir para o Quadro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainCard, { backgroundColor: isAdmin ? COLORS.orange : theme.primary }]}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>
              {isAdmin ? "Painel do Síndico" : "Assembleia Geral"}
            </Text>
            <Text style={styles.cardDesc}>
              {isAdmin
                ? "Existem novas solicitações para analisar."
                : "Você tem notificações pendentes do seu condomínio."}
            </Text>
            
            {/* AQUI FOI ADICIONADA A CHAMADA DO MODAL NO BOTÃO */}
            <TouchableOpacity style={styles.cardButton} onPress={() => setAvisoVisible(true)}>
              <Text style={[styles.cardButtonText, { color: isAdmin ? COLORS.orange : theme.primary }]}>
                {isAdmin ? "Ver Avisos" : "Ler Aviso"}
              </Text>
            </TouchableOpacity>
          </View>
          <Ionicons name={isAdmin ? "stats-chart" : "notifications"} size={50} color="rgba(255,255,255,0.3)" />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Serviços Rápidos</Text>
        <View style={styles.grid}>
          {SERVICOS_RAPIDOS.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={[styles.gridText, { color: theme.text }]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 24, fontWeight: "bold" },
  subGreeting: { fontSize: 14 },
  menuTrigger: { padding: 5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  menuPopUp: {
    position: "absolute",
    top: 60,
    right: 25,
    width: 150,
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuItemText: { marginLeft: 12, fontSize: 14, fontWeight: "600" },
  
  // ESTILOS DO MODAL DE AVISO
  modalAvisoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalAvisoContent: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalAvisoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconAvisoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 142, 152, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalAvisoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  modalAvisoText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },
  modalAvisoButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnAvisoClose: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    marginRight: 10,
  },
  btnAvisoCloseText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  btnAvisoIr: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnAvisoIrText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  content: { padding: 25 },
  mainCard: {
    padding: 20,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 35,
    elevation: 8,
  },
  cardInfo: { flex: 1 },
  cardTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  cardDesc: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginVertical: 10,
  },
  cardButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  cardButtonText: { fontWeight: "bold", fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "47%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 18,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(139, 142, 152, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridText: { fontWeight: "700", fontSize: 14 },
});