import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from 'expo-document-picker'; 
import { supabase } from "@/lib/supabase"; 
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';
import { useAppTheme } from "@/context/ThemeContext";

const CATEGORIAS = [
  { id: '1', nome: 'Reformas', icon: 'construct' },
  { id: '2', nome: 'Aulas', icon: 'school' },
  { id: '3', nome: 'Pets', icon: 'paw' },
  { id: '4', nome: 'Culinária', icon: 'restaurant' },
  { id: '5', nome: 'Outros', icon: 'ellipsis-horizontal' },
];

export default function NovoServico() {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [categoriaSel, setCategoriaSel] = useState('1');
  const [form, setForm] = useState({ titulo: '', preco: '', descricao: '' });
  const [certificadoNome, setCertificadoNome] = useState(''); 

  const handleSelecionarArquivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: 'application/pdf', 
        copyToCacheDirectory: true 
      });
      
      if (!result.canceled) {
        setCertificadoNome(result.assets[0].name); 
      }
    } catch (err) {
      Alert.alert("Erro", "Não foi possível abrir o gerenciador de arquivos.");
    }
  };

  async function handleSalvarServico() {
    if (!form.titulo || !form.preco || !form.descricao) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    // REMOVIDO: A validação que obrigava o envio do PDF foi apagada.

    try {
      setLoading(true);
      
      // 1. Pega o usuário logado no Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Busca o ID do Condomínio do usuário logado
      // IMPORTANTE: Mude 'tb_usuarios' para o nome da sua tabela de moradores
      const { data: perfilData, error: perfilError } = await supabase
        .from('tb_morador') 
        .select('id_condominio')
        .eq('id_morador', user.id) // Ajuste se a sua coluna de ligação com o auth não se chamar 'id'
        .single();

      if (perfilError || !perfilData?.id_condominio) {
        Alert.alert("Erro", "Não foi possível identificar o seu condomínio.");
        setLoading(false);
        return;
      }

      // 3. Insere o serviço já com o id_condominio vinculado
      const { error } = await supabase.from("tb_servico").insert([{
        id_morador: user.id,
        id_condominio: perfilData.id_condominio, // VINCULAÇÃO ACONTECENDO AQUI
        nome_servico: form.titulo,
        valor_estimado: parseFloat(form.preco.replace(",", ".")) || 0,
        descricao_servico: form.descricao,
        categoria: CATEGORIAS.find(c => c.id === categoriaSel)?.nome,
        certificado_url: certificadoNome ? "pendente_upload" : null,
        status_verificacao: "pendente"
      }]);

      if (error) throw error;
      router.push({ pathname: "/(main)/(modal)/sucesso", params: { mensagem: "Anúncio criado com sucesso!" } });
      
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao salvar anúncio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.bg === '#000' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}><ArrowBack cor={theme.text} /><Text style={[styles.title, { color: theme.text }]}>Novo Serviço</Text></View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Título" placeholderTextColor={theme.subText} onChangeText={(t) => setForm({...form, titulo: t})} />
        
        <Text style={[styles.label, { color: theme.subText }]}>CATEGORIA</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity key={cat.id} onPress={() => setCategoriaSel(cat.id)} style={[styles.catItem, { borderColor: categoriaSel === cat.id ? COLORS.primary : theme.border }]}>
              <Ionicons name={cat.icon as any} size={20} color={categoriaSel === cat.id ? COLORS.primary : theme.subText} />
              <Text style={{ color: categoriaSel === cat.id ? COLORS.primary : theme.subText }}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Preço (Ex: 50.00)" keyboardType="numeric" placeholderTextColor={theme.subText} onChangeText={(t) => setForm({...form, preco: t})} />
        <TextInput style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]} placeholder="Descrição..." multiline placeholderTextColor={theme.subText} onChangeText={(t) => setForm({...form, descricao: t})} />

        <TouchableOpacity style={[styles.fileButton, { borderColor: theme.subText }]} onPress={handleSelecionarArquivo}>
          <Text style={{ color: certificadoNome ? "#28B446" : theme.text }}>
            {certificadoNome ? `📄 ${certificadoNome}` : "📎 Anexar Certificado Opcional (PDF)"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary }]} onPress={handleSalvarServico}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>PUBLICAR SERVIÇO</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 25 },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  input: { borderRadius: 15, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#ccc' },
  textArea: { height: 120, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catItem: { padding: 12, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  fileButton: { padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', marginBottom: 20 },
  mainButton: { padding: 20, borderRadius: 15, alignItems: "center" }
});