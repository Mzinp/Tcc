import ArrowBack from "@/components/ArrowVoltar";
import { COLORS } from "@/consts/colors";
import { useAppTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIAS = [
  { id: "1", nome: "Reformas", icon: "construct" },
  { id: "2", nome: "Aulas", icon: "school" },
  { id: "3", nome: "Pets", icon: "paw" },
  { id: "4", nome: "Culinária", icon: "restaurant" },
  { id: "5", nome: "Outros", icon: "ellipsis-horizontal" },
];

export default function NovoServico() {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [categoriaSel, setCategoriaSel] = useState("1");
  const [tipoCob, setTipoCob] = useState("Hora"); // Novo: Hora ou Dia
  const [localizacao, setLocalizacao] = useState("Presencial"); // Novo: Presencial ou Remoto
  
  const [form, setForm] = useState({ titulo: "", preco: "", descricao: "" });
  const [certificadoNome, setCertificadoNome] = useState("");

  const handleSelecionarArquivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (!result.canceled) setCertificadoNome(result.assets[0].name);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível abrir o arquivo.");
    }
  };

  async function handleSalvarServico() {
    if (!form.titulo || !form.preco || !form.descricao) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfilData } = await supabase
        .from("tb_morador")
        .select("id_condominio")
        .eq("id_morador", user.id)
        .single();

      const { error } = await supabase.from("tb_servico").insert([
        {
          id_morador: user.id,
          id_condominio: perfilData?.id_condominio,
          nome_servico: form.titulo,
          valor_estimado: parseFloat(form.preco.replace(",", ".")) || 0,
          descricao_servico: form.descricao,
          categoria: CATEGORIAS.find((c) => c.id === categoriaSel)?.nome,
          tipo_cobranca: tipoCob, // Salva se é por hora ou dia
          modo_execucao: localizacao, // Salva se é presencial ou remoto
          certificado_url: certificadoNome ? "pendente_upload" : null,
          status_verificacao: "pendente",
        },
      ]);

      if (error) throw error;
      router.push({ pathname: "/(main)/(modal)/sucesso" as any, params: { mensagem: "Anúncio publicado!" } });
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar anúncio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.title, { color: theme.text }]}>Novo Anúncio</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Título do Serviço" placeholderTextColor={theme.subText} onChangeText={(t) => setForm({ ...form, titulo: t })} />

        <Text style={[styles.label, { color: theme.subText }]}>CATEGORIA</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity key={cat.id} onPress={() => setCategoriaSel(cat.id)} style={[styles.catItem, { borderColor: categoriaSel === cat.id ? COLORS.primary : theme.border }]}>
              <Ionicons name={cat.icon as any} size={20} color={categoriaSel === cat.id ? COLORS.primary : theme.subText} />
              <Text style={{ color: categoriaSel === cat.id ? COLORS.primary : theme.subText }}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          {["Hora", "Dia"].map((t) => (
            <TouchableOpacity key={t} style={[styles.toggleBtn, { backgroundColor: tipoCob === t ? COLORS.primary : theme.card }]} onPress={() => setTipoCob(t)}>
              <Text style={{ color: tipoCob === t ? "white" : theme.text }}>Por {t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Preço (Ex: 50.00)" keyboardType="numeric" placeholderTextColor={theme.subText} onChangeText={(t) => setForm({ ...form, preco: t })} />
        
        <TextInput style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]} placeholder="Descreva seu serviço detalhadamente..." multiline placeholderTextColor={theme.subText} onChangeText={(t) => setForm({ ...form, descricao: t })} />

        <TouchableOpacity style={[styles.fileButton, { borderColor: theme.subText }]} onPress={handleSelecionarArquivo}>
          <Text style={{ color: certificadoNome ? COLORS.primary : theme.text }}>{certificadoNome || "📎 Anexar certificado ou portfólio (PDF)"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary }]} onPress={handleSalvarServico}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", fontWeight: "bold" }}>PUBLICAR ANÚNCIO</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 60, paddingHorizontal: 15 },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  content: { padding: 25, paddingBottom: 100 },
  label: { fontSize: 10, fontWeight: "bold", marginBottom: 10, marginTop: 10 },
  input: { borderRadius: 15, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: "#ccc" },
  textArea: { height: 100, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  catItem: { padding: 10, borderRadius: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  row: { flexDirection: "row", gap: 10, marginBottom: 20 },
  toggleBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: "center" },
  fileButton: { padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", alignItems: "center", marginBottom: 20 },
  mainButton: { padding: 20, borderRadius: 15, alignItems: "center" },
});