import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';
import { useAppTheme } from "@/context/ThemeContext"; // Importando o hook do tema global

const CATEGORIAS = [
  { id: '1', nome: 'Reformas', icon: 'construct' },
  { id: '2', nome: 'Aulas', icon: 'school' },
  { id: '3', nome: 'Pets', icon: 'paw' },
  { id: '4', nome: 'Culinária', icon: 'restaurant' },
  { id: '5', nome: 'Outros', icon: 'ellipsis-horizontal' },
];

export default function NovoServico() {
  const { theme } = useAppTheme(); // Injetando o cérebro do tema global de forma reativa
  const [loading, setLoading] = useState(false);
  const [categoriaSel, setCategoriaSel] = useState('1');
  
  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');

  // Apenas o certificado/comprovante é necessário por anúncio
  const [certificadoUrl, setCertificadoUrl] = useState('');

  const handleSimularCertificado = () => {
    Alert.alert("Validação de Anúncio", "Comprovante técnico/certificado anexado com sucesso!");
    setCertificadoUrl("https://supabase.storage/certificados/morador_verificado.pdf");
  };

  async function handleSalvarServico() {
    if (!titulo || !preco || !descricao) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      // Valida se o usuário é realmente um morador do condomínio
      const { data: moradorData } = await supabase
        .from("tb_morador")
        .select("id_morador")
        .eq("id_morador", user.id)
        .maybeSingle();

      if (!moradorData) {
        Alert.alert(
          "Acesso Restrito", 
          "Apenas moradores cadastrados podem criar anúncios no Marketplace do condomínio."
        );
        return;
      }

      // Cadastro com foco na moderação interna do condomínio
      const { error } = await supabase
        .from("tb_servico")
        .insert([
          {
            id_morador: user.id, 
            nome_servico: titulo,
            valor_estimado: parseFloat(preco.replace("R$", "").replace(",", ".").trim()) || 0,
            descricao_servico: descricao,
            categoria: CATEGORIAS.find(c => c.id === categoriaSel)?.nome || "Outros",
            status_servico: "Ativo",
            
            // Novos campos de validação interna
            certificado_url: certificadoUrl,
            status_verificacao: "pendente" // Aguarda moderação do síndico/portaria
          }
        ]);

      if (error) throw error;

      router.push({
        pathname: "/(main)/(modal)/sucesso",
        params: { mensagem: "Anúncio enviado! Para manter a segurança do condomínio, a administração revisará a publicação antes de ativar seu QR Code." }
      });

    } catch (error: any) {
      Alert.alert("Sistema em Atualização", "Ocorreu um erro ao salvar seu serviço. Tente novamente.");
      console.log("Erro Supabase:", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.title, { color: theme.text }]}>Oferecer Serviço</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: theme.subText }]}>QUAL O SERVIÇO?</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.card || theme.input, color: theme.text, borderColor: theme.border }]}
          placeholder="Ex: Aulas de violão, Limpeza de AC..."
          placeholderTextColor="#555"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={[styles.label, { color: theme.subText }]}>CATEGORIA</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => setCategoriaSel(cat.id)}
              style={[
                styles.catItem, 
                { backgroundColor: theme.card, borderColor: categoriaSel === cat.id ? COLORS.primary : theme.border }
              ]}
            >
              <Ionicons 
                name={cat.icon as any} 
                size={20} 
                color={categoriaSel === cat.id ? COLORS.primary : theme.subText} 
              />
              <Text style={[styles.catText, { color: categoriaSel === cat.id ? COLORS.primary : theme.subText }]}>
                {cat.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.subText }]}>VALOR ESTIMADO</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.card || theme.input, color: theme.text, borderColor: theme.border }]}
          placeholder="Ex: 50.00"
          keyboardType="numeric"
          placeholderTextColor="#555"
          value={preco}
          onChangeText={setPreco}
        />

        <Text style={[styles.label, { color: theme.subText }]}>DESCRIÇÃO</Text>
        <TextInput 
          style={[styles.input, styles.textArea, { backgroundColor: theme.card || theme.input, color: theme.text, borderColor: theme.border }]}
          placeholder="Conte detalhes do que você oferece..."
          placeholderTextColor="#555"
          multiline
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* ================= SEÇÃO DE REGULAMENTAÇÃO INTERNA (TCC) ================= */}
        <View style={styles.securitySection}>
          <Text style={styles.securityTitle}>🛡️ Moderação de Conteúdo e Segurança</Text>
          <Text style={styles.securitySubtitle}>
            Para serviços que exijam certificação técnica (aulas, reformas, culinária), anexe um comprovante para acelerar a liberação do anúncio pela administração.
          </Text>

          <TouchableOpacity style={[styles.fileButton, { backgroundColor: theme.bg }]} onPress={handleSimularCertificado}>
            <Ionicons 
              name={certificadoUrl ? "checkmark-circle" : "document-attach-outline"} 
              size={20} 
              color={certificadoUrl ? "#28B446" : "#ff8c00"} 
            />
            <Text style={[styles.fileButtonText, { color: theme.text }]}>
              {certificadoUrl ? "Certificado Anexado!" : "Anexar Comprovante Técnico (Opcional)"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* ========================================================================= */}

        <View style={styles.qrInfo}>
          <Ionicons name="qr-code-outline" size={24} color="#ff8c00" />
          <Text style={styles.qrText}>
            Após a aprovação do anúncio pela administração, seu QR Code do Marketplace ficará visível para os vizinhos.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.mainButton, loading && { opacity: 0.7 }]}
          onPress={handleSalvarServico}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.mainButtonText}>SOLICITAR ATIVAÇÃO DO ANÚNCIO</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 25, paddingBottom: 50 },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1.5 },
  input: { borderRadius: 15, padding: 18, marginBottom: 25, borderWidth: 1, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  catItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', flexDirection: 'row', gap: 8 },
  catText: { fontSize: 13, fontWeight: 'bold' },
  
  securitySection: {
    backgroundColor: "rgba(255, 140, 0, 0.03)",
    borderWidth: 1,
    borderColor: "#ff8c00",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  securityTitle: { color: "#ff8c00", fontSize: 15, fontWeight: "bold" },
  securitySubtitle: { fontSize: 12, marginTop: 4, marginBottom: 10, lineHeight: 16 },
  fileButton: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ff8c00"
  },
  fileButtonText: { fontWeight: "bold", fontSize: 13, marginLeft: 8 },

  qrInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 140, 0, 0.1)', 
    padding: 18, 
    borderRadius: 15,
    marginBottom: 35
  },
  qrText: { fontSize: 12, marginLeft: 12, flex: 1, color: '#b0b0b0', lineHeight: 18 },
  mainButton: { backgroundColor: "#2d79f3", padding: 20, borderRadius: 15, alignItems: "center", elevation: 4 },
  mainButtonText: { color: "white", fontWeight: "bold", letterSpacing: 1, fontSize: 14 },
});