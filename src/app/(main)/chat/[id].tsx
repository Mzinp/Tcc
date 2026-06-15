import { useAppTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const palavrasProibidas = [
  "safada",
  "safado",
  "gostosa",
  "gostoso",
  "linda",
  "lindo",
  "nudes",
  "nude",
  "porra",
  "poha",
  "prra",
  "caralho",
  "crl",
  "crlh",
  "kralho",
  "carai",
  "caraio",
  "foda",
  "fodase",
  "foder",
  "fdp",
  "fudido",
  "fudida",
  "merda",
  "mrda",
  "bosta",
  "buceta",
  "bct",
  "xoxota",
  "xereca",
  "pepeca",
  "cacete",
  "cct",
  "kct",
  "puta",
  "puto",
  "pqp",
  "putinha",
  "putaria",
  "cu",
  "tnc",
  "vtnc",
  "tomarnocu",
  "arrombado",
  "arrombada",
  "piranha",
  "vadia",
  "vagabunda",
  "vagabundo",
  "quenga",
  "kenga",
  "corno",
  "corna",
  "chifrudo",
  "tesao",
  "pau",
  "rola",
  "piroca",
  "pinto",
  "benga",
  "caceta",
  "gozar",
  "gozada",
  "esperma",
  "boquete",
  "punheta",
  "siririca",
  "pelada",
  "pelado",
  "sexo",
  "transar",
  "suruba",
  "orgia",
  "vsf",
  "tmnc",
  "pnc",
];

const contemPalavraProibida = (texto: string) => {
  if (!texto) return false;
  const textoNormalizado = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const palavrasDigitadas = textoNormalizado.split(/[^a-z0-9]+/);
  return palavrasDigitadas.some((palavra) =>
    palavrasProibidas.includes(palavra),
  );
};

export default function TelaChat() {
  const { id } = useLocalSearchParams();
  const { theme } = useAppTheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [meuId, setMeuId] = useState<string | null>(null);
  const [outroUsuario, setOutroUsuario] = useState({
    nome: "Vizinho",
    foto: null,
  });

  useEffect(() => {
    inicializarChat();
    const intervalo = setInterval(() => {
      if (meuId) atualizarHistoricoMensagens(meuId);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [meuId]);

  const inicializarChat = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setMeuId(user.id);
    const { data: conversa } = await supabase
      .from("tb_conversas")
      .select("*")
      .eq("id_conversa", id)
      .single();
    if (conversa) {
      const idOutro =
        conversa.id_solicitante === user.id
          ? conversa.id_prestador
          : conversa.id_solicitante;
      const { data: morador } = await supabase
        .from("tb_morador")
        .select("nome, foto_url")
        .eq("id_morador", idOutro)
        .maybeSingle();
      if (morador)
        setOutroUsuario({ nome: morador.nome, foto: morador.foto_url });
      await atualizarHistoricoMensagens(user.id, idOutro);
    }
  };

  const atualizarHistoricoMensagens = async (
    meuUid: string,
    idOutroFixo?: string,
  ) => {
    let idOutro = idOutroFixo;
    if (!idOutro) {
      const { data: conversa } = await supabase
        .from("tb_conversas")
        .select("*")
        .eq("id_conversa", id)
        .single();
      if (!conversa) return;
      idOutro =
        conversa.id_solicitante === meuUid
          ? conversa.id_prestador
          : conversa.id_solicitante;
    }
    const { data } = await supabase
      .from("tb_mensagens")
      .select("*")
      .or(
        `and(id_enviou.eq.${meuUid},id_destino.eq.${idOutro}),and(id_enviou.eq.${idOutro},id_destino.eq.${meuUid})`,
      )
      .order("data_envio", { ascending: true });
    if (data) setMensagens(data);
  };

  const handleEnviarMensagem = async () => {
    if (!novoTexto.trim() || !meuId) return;
    if (contemPalavraProibida(novoTexto)) {
      Alert.alert("Atenção", "Mensagem imprópria.");
      return;
    }
    try {
      const textoEnviar = novoTexto.trim();
      setNovoTexto("");

      // Busca a conversa no Supabase
      const { data: conversa } = await supabase
        .from("tb_conversas")
        .select("id_solicitante, id_prestador, status_conversa")
        .eq("id_conversa", id)
        .single();

      // VERIFICAÇÃO DE SEGURANÇA: Só acessa se 'conversa' não for null
      if (conversa) {
        // 1. Atualiza status se estiver pendente
        if (conversa.status_conversa === "pendente") {
          await supabase
            .from("tb_conversas")
            .update({ status_conversa: "ativa" })
            .eq("id_conversa", id);
        }

        // 2. Define o ID do destinatário
        const idOutro =
          conversa.id_solicitante === meuId
            ? conversa.id_prestador
            : conversa.id_solicitante;

        // 3. Insere a mensagem
        await supabase.from("tb_mensagens").insert([
          {
            id_enviou: meuId,
            id_destino: idOutro,
            texto: textoEnviar,
            data_envio: new Date().toISOString(),
            status: "aceito",
          },
        ]);

        await atualizarHistoricoMensagens(meuId, idOutro);
      } else {
        Alert.alert("Erro", "Conversa não encontrada.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.btnVoltar}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.nomeHeader, { color: theme.text }]}>
          {outroUsuario.nome}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={mensagens}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 15 }}
        keyExtractor={(item) => item.id_mensagem.toString()}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.containerBalao,
              item.id_enviou === meuId
                ? styles.alinharDireita
                : styles.alinharEsquerda,
            ]}
          >
            <View
              style={[
                styles.balao,
                item.id_enviou === meuId
                  ? { backgroundColor: theme.primary }
                  : { backgroundColor: theme.card },
              ]}
            >
              <Text
                style={{
                  color: item.id_enviou === meuId ? "white" : theme.text,
                  fontSize: 15,
                }}
              >
                {item.texto}
              </Text>
            </View>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.card, borderTopColor: theme.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.bg },
            ]}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.subText}
            value={novoTexto}
            onChangeText={setNovoTexto}
            multiline
          />
          <TouchableOpacity
            style={[styles.btnEnviar, { backgroundColor: theme.primary }]}
            onPress={handleEnviarMensagem}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  btnVoltar: { marginRight: 10 },
  nomeHeader: { fontSize: 18, fontWeight: "bold" },
  containerBalao: { flexDirection: "row", marginBottom: 10, width: "100%" },
  alinharDireita: { justifyContent: "flex-end" },
  alinharEsquerda: { justifyContent: "flex-start" },
  balao: { maxWidth: "75%", padding: 12, borderRadius: 18 },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    paddingBottom: 110,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  btnEnviar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
