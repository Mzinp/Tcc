import { COLORS } from "@/consts/colors";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
  const [isDark, setIsDark] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("Carregando...");
  const [nomeCondominio, setNomeCondominio] = useState("Carregando...");
  const [isAdmin, setIsAdmin] = useState(false);

  async function carregarPerfil() {
    try {
      // 1. Pega o usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      let nomeFinal = user.user_metadata?.nome || "Usuário";
      let adminFinal = user.user_metadata?.cargo ? true : false;
      let idCondominioUsuario = null; // Vamos guardar o ID aqui para buscar o nome depois

      // 2. Busca segura na tabela de Administrador usando maybeSingle()
      const { data: adminData } = await supabase
        .from("tb_administrador")
        .select("*")
        .eq("id_administrador", user.id)
        .maybeSingle();

      if (adminData) {
        //  BLOQUEIO DE SEGURANÇA 
        if (!adminData.id_condominio) {
          router.replace("/CriarCondominio");
          return;
        }

        nomeFinal = adminData.nome || nomeFinal;
        adminFinal = true;
        idCondominioUsuario = adminData.id_condominio; // Guarda o ID do condomínio
      } else {
        // 3. Se não achou no Admin, tenta no Morador
        const { data: moradorData } = await supabase
          .from("tb_morador")
          .select("*")
          .eq("id_morador", user.id)
          .maybeSingle();

        if (moradorData) {
          nomeFinal = moradorData.nome || nomeFinal;
          adminFinal = false;
          idCondominioUsuario = moradorData.id_condominio; // Guarda o ID do condomínio
        }
      }

     // 4. Busca o nome real do Condomínio usando o ID que encontramos
      let nomeCondominioFinal = "Vizzo"; // Fallback caso dê erro
      
      if (idCondominioUsuario) {
        const { data: condominioData, error: condominioError } = await supabase
          .from("tb_condominio")
          .select("nome_condominio") // <-- AJUSTADO AQUI
          .eq("id_condominio", idCondominioUsuario)
          .maybeSingle();

        if (condominioData && condominioData.nome_condominio) { // <-- AJUSTADO AQUI
          nomeCondominioFinal = condominioData.nome_condominio; // <-- AJUSTADO AQUI
        } else if (condominioError) {
          console.log("Erro ao buscar nome do condomínio:", condominioError);
        }
      }

      // 5. Atualiza a tela (Garante que o "Carregando..." vai sumir!)
      setNomeUsuario(nomeFinal.split(" ")[0]); // Pega só o primeiro nome
      setNomeCondominio(nomeCondominioFinal); // Usa o nome que pegamos do banco
      setIsAdmin(adminFinal);

    } catch (error) {
      console.log("Erro ao carregar dados:", error);
      // Se a internet cair, não deixa a tela travada:
      setNomeUsuario("Vizinho");
      setNomeCondominio("Vizzo");
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem("@vizzo_theme");
          if (salvo !== null) setIsDark(salvo === "dark");
        } catch (e) {
          console.log("Erro ao carregar tema");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subtitle: isDark ? COLORS.dark.subText : COLORS.light.subText,
    border: isDark ? COLORS.dark.border : COLORS.light.border,
  };

  const SERVICOS_RAPIDOS = isAdmin
    ? [
        {
          name: "Assembleia Geral",
          icon: "megaphone",
          color: "#3b82f6",
          route: "/(main)/(stack)/comunicados",
        },
        {
          name: "Ocorrências",
          icon: "warning",
          color: COLORS.red,
          route: "/(main)/(stack)/ocorrencias",
        },
        {
          name: "Gestão Reservas",
          icon: "calendar",
          color: COLORS.orange,
          route: "/(main)/(stack)/reservas",
        },
        {
          name: "Encomendas",
          icon: "cube",
          color: COLORS.primary,
          route: "/(main)/(stack)/encomendas",
        },
        {
          name: "Visitantes",
          icon: "people",
          color: COLORS.green,
          route: "/(main)/(stack)/visitantes",
        },
        {
          name: "Lista Moradores",
          icon: "list", // Ícone diferente para não confundir com visitantes
          color: "#059669", // Um verde mais escuro
          route: "/(main)/(stack)/moradores", // <-- Rota nova!
        },
        {
          name: "Gestão de Áreas",
          icon: "business",
          color: "#8b5cf6",
          route: "/(main)/(stack)/gestaoarea",
        },
      ]
    : [
        {
          name: "Assembleia Geral",
          icon: "megaphone",
          color: "#3b82f6", 
          route: "/(main)/(stack)/comunicados",
        },
        {
          name: "Ocorrências",
          icon: "warning",
          color: COLORS.red,
          route: "/(main)/(stack)/ocorrencias",
        },
        {
          name: "Reservas",
          icon: "calendar",
          color: COLORS.orange,
          route: "/(main)/(stack)/reservas",
        },
        {
          name: "Visitantes",
          icon: "people",
          color: COLORS.green,
          route: "/(main)/(stack)/visitantes",
        },
      ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Olá, {nomeUsuario} {isAdmin && "(ADM)"}
          </Text>
          <Text style={[styles.subGreeting, { color: theme.subtitle }]}>
            {nomeCondominio}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.menuTrigger}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={isDark ? "#ffffff" : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.menuPopUp,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setMenuVisible(false);
                await supabase.auth.signOut();
                router.replace("/login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                Sair
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.mainCard,
            { backgroundColor: isAdmin ? COLORS.orange : COLORS.primary },
          ]}
        >
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>
              {isAdmin ? "Painel do Síndico" : "Assembleia Geral"}
            </Text>
            <Text style={styles.cardDesc}>
              {isAdmin
                ? "Existem novas solicitações para analisar."
                : "Verifique os novos comunicados do seu condomínio."}
            </Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text
                style={[
                  styles.cardButtonText,
                  { color: isAdmin ? COLORS.orange : COLORS.primary },
                ]}
              >
                {isAdmin ? "Gerenciar" : "Ver Detalhes"}
              </Text>
            </TouchableOpacity>
          </View>
          <Ionicons
            name={isAdmin ? "stats-chart" : "notifications"}
            size={50}
            color="rgba(255,255,255,0.3)"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Serviços Rápidos
        </Text>
        <View style={styles.grid}>
          {SERVICOS_RAPIDOS.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              style={[
                styles.gridItem,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={item.icon as any}
                  size={28}
                  color={item.color}
                />
              </View>
              <Text style={[styles.gridText, { color: theme.text }]}>
                {item.name}
              </Text>
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
  greeting: { fontSize: 24, fontWeight: "bold", color: COLORS.primary },
  subGreeting: { fontSize: 14 },
  menuTrigger: { padding: 5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)" },
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