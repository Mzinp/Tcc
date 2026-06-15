import { useAppTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatIndex() {
  const [conversas, setConversas] = useState<any[]>([]);
  const [aba, setAba] = useState<"recebidas" | "enviadas" | "andamento">(
    "andamento",
  );
  const [loading, setLoading] = useState(true);

  const { theme } = useAppTheme();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      carregarConversas();
    }, [aba]),
  );

  const carregarConversas = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase.from("tb_conversas").select("*");

      if (aba === "recebidas") {
        query = query
          .eq("id_prestador", user.id)
          .eq("status_conversa", "pendente");
      } else if (aba === "enviadas") {
        query = query
          .eq("id_solicitante", user.id)
          .eq("status_conversa", "pendente");
      } else {
        // BUSCA ATIVAS E FILTRA POR PARTICIPANTE
        query = query
          .eq("status_conversa", "ativa")
          .or(`id_solicitante.eq.${user.id},id_prestador.eq.${user.id}`);
      }

      const { data, error } = await query.order("data_criacao", {
        ascending: false,
      });
      if (error) throw error;

      if (data) {
        const listaComDetalhes = await Promise.all(
          data.map(async (conv) => {
            const idOutro =
              conv.id_solicitante === user.id
                ? conv.id_prestador
                : conv.id_solicitante;
            const { data: morador } = await supabase
              .from("tb_morador")
              .select("nome, foto_url")
              .eq("id_morador", idOutro)
              .maybeSingle();
            return {
              ...conv,
              nome_outro: morador?.nome || "Vizinho",
              foto_outro: morador?.foto_url,
            };
          }),
        );
        setConversas(listaComDetalhes);
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const responderSolicitacao = async (
    idConversa: string,
    acao: "aceitar" | "recusar",
  ) => {
    try {
      setLoading(true);
      const novoStatus = acao === "aceitar" ? "ativa" : "recusada";
      const { error } = await supabase
        .from("tb_conversas")
        .update({ status_conversa: novoStatus })
        .eq("id_conversa", idConversa);

      if (error) throw error;

      if (acao === "aceitar") {
        router.push(`/chat/${idConversa}` as any);
      } else {
        await carregarConversas();
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível processar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: theme.text }]}>
          Chat e Solicitações
        </Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { id: "andamento", label: "Andamento" },
          { id: "recebidas", label: "Recebidas" },
          { id: "enviadas", label: "Enviadas" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setAba(tab.id as any)}
            style={[
              styles.tab,
              aba === tab.id && { borderBottomColor: theme.primary },
            ]}
          >
            <Text
              style={{
                color: aba === tab.id ? theme.primary : theme.subText,
                fontWeight: "bold",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={conversas}
          keyExtractor={(item) => item.id_conversa}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={[styles.vazioText, { color: theme.subText }]}>
              Nenhuma conversa encontrada nesta aba.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() =>
                aba !== "recebidas" &&
                router.push(`/chat/${item.id_conversa}` as any)
              }
              disabled={aba === "recebidas"}
            >
              <Image
                source={{
                  uri:
                    item.foto_outro ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(item.nome_outro),
                }}
                style={styles.avatar}
              />
              <View style={styles.cardInfo}>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {item.nome_outro}
                </Text>
                <Text style={{ color: theme.subText, fontSize: 13 }}>
                  {aba === "recebidas"
                    ? "Quer contratar o seu serviço."
                    : "Toque para abrir a conversa"}
                </Text>
                {aba === "recebidas" && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() =>
                        responderSolicitacao(item.id_conversa, "aceitar")
                      }
                      style={[styles.btnAcao, { backgroundColor: "#28a745" }]}
                    >
                      <Text style={styles.btnTexto}>Aceitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        responderSolicitacao(item.id_conversa, "recusar")
                      }
                      style={[styles.btnAcao, { backgroundColor: "#dc3545" }]}
                    >
                      <Text style={styles.btnTexto}>Recusar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginTop: 60, marginBottom: 20 },
  titulo: { fontSize: 26, fontWeight: "bold" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flex: 1,
    alignItems: "center",
  },
  card: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    marginBottom: 12,
    elevation: 1,
  },
  avatar: { width: 55, height: 55, borderRadius: 27.5, marginRight: 15 },
  cardInfo: { flex: 1 },
  vazioText: { textAlign: "center", marginTop: 60, fontSize: 15 },
  actionButtons: { flexDirection: "row", marginTop: 12, gap: 10 },
  btnAcao: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  btnTexto: { color: "white", fontWeight: "bold", fontSize: 13 },
});
