import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [isDark, setIsDark] = useState(true);
  const [categoriaSel, setCategoriaSel] = useState('1');
  
  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    const carregarTema = async () => {
      const salvo = await AsyncStorage.getItem('@vizzo_theme');
      if (salvo !== null) setIsDark(salvo === 'dark');
    };
    carregarTema();
  }, []);

  const theme = {
    bg: isDark ? COLORS.dark.bg : "#f5f5f5",
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    inputBg: isDark ? "#252828" : "#eeeeee",
    border: isDark ? "#353838" : "#dddddd",
    label: isDark ? COLORS.dark.subText : "#666666"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
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
                color={categoriaSel === cat.id ? COLORS.primary : theme.label} 
              />
              <Text style={[styles.catText, { color: categoriaSel === cat.id ? COLORS.primary : theme.label }]}>
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
          numberOfLines={4}
          value={descricao}
          onChangeText={setDescricao}
        />

        <View style={styles.qrInfo}>
          <Ionicons name="qr-code-outline" size={24} color={COLORS.orange} />
          <Text style={[styles.qrText, { color: theme.label }]}>
            Ao finalizar, um QR Code será gerado para que seus vizinhos possam te contratar rapidamente.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => router.push({
            pathname: "/(main)/(modal)/sucesso",
            params: { mensagem: "Serviço cadastrado! Seu QR Code de prestador já está ativo." }
          })}
        >
          <Text style={styles.mainButtonText}>CRIAR ANÚNCIO E GERAR QR CODE</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 25 },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  input: { 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 25, 
    borderWidth: 1,
    fontSize: 15
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  catItem: { 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    borderWidth: 1, 
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  catText: { fontSize: 12, fontWeight: 'bold' },
  qrInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 140, 0, 0.1)', 
    padding: 15, 
    borderRadius: 12,
    marginBottom: 30
  },
  qrText: { fontSize: 11, marginLeft: 10, flex: 1, lineHeight: 16 },
  mainButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 15, alignItems: "center" },
  mainButtonText: { color: "white", fontWeight: "bold", letterSpacing: 1 },
});