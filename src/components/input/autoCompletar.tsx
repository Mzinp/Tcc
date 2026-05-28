import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, StyleProp, TextStyle } from 'react-native';
import { supabase } from '../../lib/supabase';

// Definimos tudo o que o componente precisa receber de fora
interface FormularioProps {
  estiloInputExterno?: StyleProp<TextStyle>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function FormularioSelecaoNative({ 
  estiloInputExterno,
  value,
  onChangeText,
  placeholder = "", // valor padrão se não enviar nada
  placeholderTextColor = "",   // valor padrão
  autoCapitalize = "characters"     // valor padrão
}: FormularioProps) {
  
  const [opcoes, setOpcoes] = useState<string[]>([]); 
  const [erro, setErro] = useState('');

  // Busca os dados do Supabase
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
    // Valida usando o 'value' que veio lá de fora
    const valido = opcoes.includes(value);

    if (!valido) {
      setErro('Por favor, selecione uma opção válida diretamente da lista.');
      return;
    }

    setErro('');
    Alert.alert("Sucesso!", `Opção selecionada e validada: ${value}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Digite e selecione uma opção:</Text>

      {/* Aplicando todas as propriedades recebidas dinamicamente */}
      <TextInput
        style={[estiloInputExterno, { borderColor: "#2d79f3" }]} 
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
      />

      <TouchableOpacity style={styles.botao} onPress={lidarComEnvio}>
        <Text style={styles.textoBotao}>Enviar</Text>
      </TouchableOpacity>

      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  botao: { backgroundColor: '#2d79f3', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  textoErro: { color: 'red', marginTop: 10, fontSize: 14 },
});