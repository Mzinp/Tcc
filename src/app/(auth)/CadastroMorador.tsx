import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, StyleProp, TextStyle } from 'react-native';
import { supabase } from '../../lib/supabase';

// 1. Criamos a Interface das Props para o TypeScript aceitar o estilo vindo de fora
interface FormularioProps {
  estiloInputExterno?: StyleProp<TextStyle>; // O ponto de interrogação indica que é opcional
}

// 2. Passamos a prop dentro dos parênteses do componente
export default function FormularioSelecaoNative({ estiloInputExterno }: FormularioProps) {
  const [opcoes, setOpcoes] = useState<string[]>([]); 
  const [codigoCondominio, setCodigoCondominio] = useState(''); 
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function buscarDados() {
      const { data, error } = await supabase
        .from('tb_condominio') 
        .select('codigo_acesso');    

      if (error) {
        console.error('Erro ao buscar dados:', error.message);
      } else if (data) {
        const listaNomes = data.map(item => item.codigo_acesso);
        setOpcoes(listaNomes);
      }
    }
    buscarDados();
  }, []);

  const lidarComEnvio = () => {
    const valido = opcoes.includes(codigoCondominio);

    if (!valido) {
      setErro('Por favor, selecione uma opção válida diretamente da lista.');
      return;
    }

    setErro('');
    Alert.alert("Sucesso!", `Opção selecionada e validada: ${codigoCondominio}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Digite e selecione uma opção:</Text>

      {/* 3. Injetamos o estilo recebido por Prop junto com a cor da borda fixa */}
      <TextInput
        style={[estiloInputExterno, { borderColor: "#2d79f3" }]} 
        placeholder="Ex: VIZZO-0001"
        placeholderTextColor="#666"
        value={codigoCondominio}
        onChangeText={setCodigoCondominio}
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.botao} onPress={lidarComEnvio}>
        <Text style={styles.textoBotao}>Enviar</Text>
      </TouchableOpacity>

      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  botao: { backgroundColor: '#2d79f3', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  textoErro: { color: 'red', marginTop: 10, fontSize: 14 },
});