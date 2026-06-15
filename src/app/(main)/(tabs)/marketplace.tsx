import { useAppTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getIconeParaServico = (nome: string) => {
  const n = nome.toLowerCase();
  if (n.includes("aula") || n.includes("estudo") || n.includes("ensino"))
    return "book-outline";
  if (n.includes("limpeza") || n.includes("faxina") || n.includes("limpar"))
    return "brush-outline";
  if (n.includes("conserto") || n.includes("reparo") || n.includes("eletric"))
    return "build-outline";
  if (n.includes("entrega") || n.includes("frete") || n.includes("transporte"))
    return "car-outline";
  if (n.includes("pet") || n.includes("cachorro") || n.includes("gato"))
    return "paw-outline";
  if (
    n.includes("culinaria") ||
    n.includes("cozinha") ||
    n.includes("bolo") ||
    n.includes("comida")
  )
    return "restaurant-outline";
  return "briefcase-outline";
};

export default function Marketplace() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [abaAtiva, setAbaAtiva] = useState("comprar");
  const [servicos, setServicos] = useState<any[]>([]);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregarServicos() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setMeuId(user.id);

      const { data: moradorData } = await supabase
        .from("tb_morador")
        .select("id_condominio")
        .eq("id_morador", user.id)
        .single();

      if (!moradorData?.id_condominio) {
        setServicos([]);
        return;
      }

      const { data } = await supabase
        .from("tb_servico")
        .select(
          `
          id_servico, nome_servico, valor_estimado, descricao_servico, id_morador, certificado_url, tipo_cobranca,
          tb_morador ( nome, apartamento, telefone )
        `,
        )
        .eq("id_condominio", moradorData.id_condominio);

      if (data) {
        const formatados = data.map((s: any) => ({
          id: s.id_servico?.toString(),
          nome: s.nome_servico,
          prestador: s.tb_morador
            ? `${s.tb_morador.nome.split(" ")[0]} (Apto ${s.tb_morador.apartamento})`
            : "Vizinho",
          preco: `R$ ${s.valor_estimado}`,
          tipo_cobranca: s.tipo_cobranca || "Diária",
          id_morador: s.id_morador,
          descricao: s.descricao_servico,
          certificado_url: s.certificado_url,
          icone: getIconeParaServico(s.nome_servico),
        }));
        setServicos(formatados);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  const excluirServico = async (idServico: string) => {
    Alert.alert(
      "Excluir Anúncio",
      "Tem certeza que deseja remover este anúncio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("tb_servico")
              .delete()
              .eq("id_servico", idServico);
            if (error) Alert.alert("Erro", "Não foi possível excluir.");
            else carregarServicos();
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      carregarServicos();
    }, []),
  );

  const dadosAtuais =
    abaAtiva === "comprar"
      ? servicos
      : servicos.filter((s) => s.id_morador === meuId);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={theme.bg === "#000" ? "light-content" : "dark-content"}
      />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Marketplace</Text>
        <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              abaAtiva === "comprar" && { backgroundColor: theme.border },
            ]}
            onPress={() => setAbaAtiva("comprar")}
          >
            <Text
              style={{
                color: abaAtiva === "comprar" ? theme.primary : theme.subText,
                fontWeight: "900",
              }}
            >
              CONTRATAR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              abaAtiva === "vender" && { backgroundColor: theme.border },
            ]}
            onPress={() => setAbaAtiva("vender")}
          >
            <Text
              style={{
                color: abaAtiva === "vender" ? theme.primary : theme.subText,
                fontWeight: "900",
              }}
            >
              MEUS ANÚNCIOS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} />
      ) : (
        <FlatList
          data={dadosAtuais}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 25, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icone} size={28} color={theme.primary} />
              </View>

              <View style={styles.info}>
                <Text style={[styles.serviceName, { color: theme.text }]}>
                  {item.nome}
                </Text>
                {item.certificado_url && (
                  <View style={styles.badge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={10}
                      color="#28B446"
                    />
                    <Text style={styles.badgeText}>LICENCIADO</Text>
                  </View>
                )}
                <Text style={{ color: theme.subText, fontSize: 12 }}>
                  {item.prestador}
                </Text>
                <Text style={[styles.price, { color: theme.primary }]}>
                  {item.preco}
                </Text>
              </View>

              {abaAtiva === "vender" ? (
                <TouchableOpacity
                  onPress={() => excluirServico(item.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.hireBtn, { backgroundColor: theme.primary }]}
                  onPress={() =>
                    router.push({
                      pathname: "/(main)/(stack)/detalhe-servico",
                      params: { ...item },
                    })
                  }
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Pedir
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/(main)/(stack)/novo-servico")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 65, paddingBottom: 15 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 25 },
  tabBar: { flexDirection: "row", borderRadius: 18, padding: 5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 14 },
  card: {
    padding: 18,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 20,
    backgroundColor: "rgba(45, 121, 243, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 15 },
  serviceName: { fontWeight: "bold", fontSize: 17 },
  price: { fontWeight: "800", marginTop: 5 },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    zIndex: 100,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#28B446",
    marginLeft: 3,
  },
  actionBtn: { padding: 10 },
  hireBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
});
