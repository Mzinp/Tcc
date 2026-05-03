import { COLORS } from "@/consts/colors";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Moradores() {
  const [isDark, setIsDark] = useState(true);
  const [listaMoradores, setListaMoradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarLista() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      let idCondominioUsuario = null;

      const { data: adminData } = await supabase
        .from("tb_administrador")
        .select("id_condominio")
        .eq("id_administrador", user.id)
        .maybeSingle();

      if (adminData && adminData.id_condominio) {
        idCondominioUsuario = adminData.id_condominio;
      } else {
        const { data: moradorData } = await supabase
          .from("tb_morador")
          .select("id_condominio")
          .eq("id_morador", user.id)
          .maybeSingle();

        if (moradorData && moradorData.id_condominio) {
          idCondominioUsuario = moradorData.id_condominio;
        }
      }

      if (!idCondominioUsuario) {
        setLoading(false);
        return;
      }

      const { data: admins } = await supabase
        .from("tb_administrador")
        .select("id_administrador, nome, num_apartamento, bloco")
        .eq("id_condominio", idCondominioUsuario);

      const { data: moradores } = await supabase
        .from("tb_morador")
        .select("id_morador, nome, num_apartamento, bloco")
        .eq("id_condominio", idCondominioUsuario);

      const listaAdmins = (admins || []).map((a) => ({
        id: a.id_administrador,
        nome: a.nome || "Administrador",
        apto: a.num_apartamento || "N/A",
        bloco: a.bloco || "N/A",
        isAdmin: true,
      }));

      const listaMoradoresNormal = (moradores || []).map((m) => ({
        id: m.id_morador,
        nome: m.nome || "Morador",
        apto: m.num_apartamento || "N/A",
        bloco: m.bloco || "N/A",
        isAdmin: false,
      }));

      const listaFinal = [...listaAdmins, ...listaMoradoresNormal].sort(
        (a, b) => a.nome.localeCompare(b.nome)
      );

      setListaMoradores(listaFinal);
    } catch (error) {
      console.log("Erro ao carregar lista:", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarLista();
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

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={20} color={item.isAdmin ? COLORS.primary : COLORS.dark.subText} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.nome, { color: theme.text }]}>
            {item.nome}
            {item.isAdmin ? <Text style={styles.tagAdmin}> (ADM)</Text> : null}
          </Text>
          <Text style={[styles.detalhes, { color: theme.subtitle }]}>
            Apto: {item.apto} | Bloco: {item.bloco}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Lista de Moradores</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : listaMoradores.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={50} color={theme.subtitle} />
          <Text style={[styles.emptyText, { color: theme.subtitle }]}>Nenhum morador encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={listaMoradores}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(139, 142, 152, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoContainer: { flex: 1 },
  nome: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  tagAdmin: { color: COLORS.primary, fontSize: 14, fontWeight: "600" },
  detalhes: { fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 10, fontSize: 16 },
});