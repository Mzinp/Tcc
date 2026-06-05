import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';
import { supabase } from "@/lib/supabase"; 
import { useAppTheme } from "@/context/ThemeContext"; 
import * as ImagePicker from 'expo-image-picker';

export default function CadastroOcorrencia() {
  const { theme } = useAppTheme(); 
  const [loading, setLoading] = useState(false);
  
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null); // Novo estado para a foto

  // ABRIR CÂMERA
  async function abrirCamera() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão Necessária", "Precisamos de acesso à câmera para registrar a foto da ocorrência.");
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7, 
      });

      if (!resultado.canceled && resultado.assets) {
        setFotoUri(resultado.assets[0].uri);
      }
    } catch (error) {
      console.log("Erro ao abrir câmera:", error);
    }
  }

  // ALERTA LEGAL
  const handleVerificarTermosMidia = () => {
    const mensagemAlert = "De acordo com o Art. 20 do Código Civil e as normas da LGPD, é expressamente proibido registrar, expor ou compartilhar imagens e vídeos de outros moradores, funcionários ou terceiros sem autorização prévia por escrito.\n\nAo continuar, você assume total responsabilidade civil e criminal pelo conteúdo anexado, garantindo que ele possui fins exclusivamente de registro administrativo e segurança interna.";

    if (Platform.OS === 'web') {
      const aceitou = window.confirm(`⚖️ Restrição Legal de Imagem\n\n${mensagemAlert}\n\nDeseja aceitar e continuar?`);
      if (aceitou) {
        abrirCamera(); // Se web, tenta abrir seletor
      }
      return;
    }

    Alert.alert(
      "⚖️ Restrição Legal de Imagem",
      mensagemAlert,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Aceitar e Câmera", 
          onPress: abrirCamera 
        }
      ],
      { cancelable: false }
    );
  };

  // ENVIAR PARA O SUPABASE
  async function handleEnviar() {
    if (!titulo || !descricao) {
      Alert.alert("Atenção", "Por favor, preencha o assunto e a descrição.");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: morador } = await supabase
        .from('tb_morador')
        .select('id_morador, id_condominio')
        .eq('id_morador', user.id)
        .single();

      if (!morador) throw new Error("Perfil de morador não encontrado");

      let fotoUrlFinal = null;

      // Se o usuário tirou foto, fazemos o upload primeiro
      if (fotoUri) {
        const nomeArquivo = `ocorrencia-${user.id}-${Date.now()}.jpg`;
        
        const respostaFetch = await fetch(fotoUri);
        const blob = await respostaFetch.blob();

        const { error: storageError } = await supabase.storage
          .from('ocorrencias')
          .upload(nomeArquivo, blob, {
            contentType: 'image/jpeg',
          });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage
          .from('ocorrencias')
          .getPublicUrl(nomeArquivo);

        fotoUrlFinal = publicUrl;
      }

      // Inserimos na tabela com ou sem foto
      const { error } = await supabase
        .from('tb_ocorrencias')
        .insert([{
          id_condominio: morador.id_condominio,
          id_morador: morador.id_morador,
          titulo: titulo,
          descricao: descricao,
          status: 'Aberto',
          foto_url: fotoUrlFinal // Mandando a URL da foto para o banco
        }]);

      if (error) throw error;

      router.push({
        pathname: "/(main)/(modal)/sucesso",
        params: { mensagem: "Sua ocorrência foi enviada ao síndico com sucesso!" }
      });

    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível enviar sua ocorrência agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ArrowBack cor={theme.text} />
          <Text style={[styles.title, { color: theme.text }]}>Registrar Ocorrência</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Relate problemas ou incidentes no condomínio</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>ASSUNTO</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input || theme.border, borderColor: theme.border }]}>
            <TextInput 
              style={[styles.input, { color: theme.text }]} 
              placeholder="Ex: Vazamento no corredor, Barulho excessivo..." 
              placeholderTextColor={theme.subText}
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          <Text style={styles.label}>DESCRIÇÃO DETALHADA</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input || theme.border, borderColor: theme.border, height: 150 }]}>
            <TextInput 
              style={[styles.input, { color: theme.text, textAlignVertical: 'top', paddingTop: 15 }]} 
              multiline 
              numberOfLines={6}
              placeholder="Descreva o que aconteceu com o máximo de detalhes possível..." 
              placeholderTextColor={theme.subText} 
              value={descricao}
              onChangeText={setDescricao}
            />
          </View>

          {/* PREVIEW DA FOTO SE EXISTIR, OU BOTÃO DE ANEXAR */}
          {fotoUri ? (
            <View style={[styles.previewContainer, { borderColor: theme.border }]}>
              <Image source={{ uri: fotoUri }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeImageBtn} 
                onPress={() => setFotoUri(null)}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.removeImageText}>Remover Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.attachButton, { borderColor: theme.border, borderStyle: 'dashed' }]}
              onPress={handleVerificarTermosMidia}
            >
              <Ionicons name="camera-outline" size={24} color={COLORS.red} />
              <Text style={[styles.attachText, { color: theme.text }]}>Anexar Foto (Câmera)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.mainButton, loading && { opacity: 0.7 }]}
            onPress={handleEnviar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="white" />
                <Text style={styles.buttonText}>ENVIAR AO SÍNDICO</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.warningText, { color: theme.subText }]}>
            Sua ocorrência será registrada com seu nome e unidade para que o síndico possa entrar em contato.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  header: { paddingHorizontal: 25, paddingTop: 60, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', marginTop: 15 },
  subtitle: { fontSize: 14, marginTop: 5 },
  form: { padding: 25 },
  label: { color: COLORS.red, fontSize: 11, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  inputContainer: { 
    borderWidth: 1, 
    borderRadius: 15, 
    marginBottom: 20,
    paddingHorizontal: 15,
    minHeight: 55 
  },
  input: { flex: 1, fontSize: 15 },
  attachButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 2, 
    marginBottom: 30 
  },
  attachText: { marginLeft: 10, fontWeight: 'bold', fontSize: 14 },
  previewContainer: {
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#000'
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  removeImageText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5
  },
  mainButton: { 
    backgroundColor: COLORS.red, 
    padding: 18, 
    borderRadius: 15, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4
  },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
  warningText: { textAlign: 'center', fontSize: 12, marginTop: 20, lineHeight: 18 }
});