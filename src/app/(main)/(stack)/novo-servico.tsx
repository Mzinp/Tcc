import React, { useState, useEffect } from "react";
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

const CATEGORIAS = [
  { id: '1', nome: 'Reformas', icon: 'construct' },
  { id: '2', nome: 'Aulas', icon: 'school' },
  { id: '3', nome: 'Pets', icon: 'paw' },
  { id: '4', nome: 'Culinária', icon: 'restaurant' },
  { id: '5', nome: 'Outros', icon: 'ellipsis-horizontal' },
];

export default function NovoServico() {
  const [loading, setLoading] = useState(false);
  const [categoriaSel, setCategoriaSel] = useState('1');
  
  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');

  // Estilo fixo Full Black
  const theme = {
    bg: "#0f1111",
    card: "#1a1d1d",
    text: "#ffffff",
    inputBg: "#252828",
    border: "#353838",
    label: "#8b8e98"
  };

  async function handleSalvarServico() {
    if (!titulo || !preco || !descricao) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      // O comando de Insert que a Isa vai validar depois:
      const { error } = await supabase
        .from("tb_servico")
        .insert([
          {
            id_morador: user.id,
            nome_servico: titulo,
            valor_estimado: preco.replace("R$", "").trim(),
            descricao_servico: descricao,
            categoria: CATEGORIAS.find(c => c.id === categoriaSel)?.nome || "Outros",
            status_servico: "Ativo"
          }
        ]);

      if (error) throw error;

      router.push({
        pathname: "/(main)/(modal)/sucesso",
        params: { mensagem: "Serviço cadastrado! Seu QR Code de prestador já está ativo." }
      });

    } catch (error: any) {
      // Se der erro de "tabela não encontrada", é porque a Isa ainda não criou
      Alert.alert("Sistema em Atualização", "O banco de dados ainda está sendo configurado. Tente novamente em breve.");
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

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: theme.label }]}>QUAL O SERVIÇO?</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
          placeholder="Ex: Aulas de violão, Limpeza de AC..."
          placeholderTextColor="#555"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={[styles.label, { color: theme.label }]}>CATEGORIA</Text>
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
                color={categoriaSel === cat.id ? COLORS.primary : "#8b8e98"} 
              />
              <Text style={[styles.catText, { color: categoriaSel === cat.id ? COLORS.primary : "#8b8e98" }]}>
                {cat.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.label }]}>VALOR ESTIMADO</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
          placeholder="R$ 0,00"
          keyboardType="numeric"
          placeholderTextColor="#555"
          value={preco}
          onChangeText={setPreco}
        />

        <Text style={[styles.label, { color: theme.label }]}>DESCRIÇÃO</Text>
        <TextInput 
          style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
          placeholder="Conte detalhes do que você oferece..."
          placeholderTextColor="#555"
          multiline
          value={descricao}
          onChangeText={setDescricao}
        />

        <View style={styles.qrInfo}>
          <Ionicons name="qr-code-outline" size={24} color="#ff8c00" />
          <Text style={styles.qrText}>
            Ao finalizar, um QR Code será gerado para que seus vizinhos possam te contratar rapidamente.
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
            <Text style={styles.mainButtonText}>CRIAR ANÚNCIO E GERAR QR CODE</Text>
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