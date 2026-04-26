import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/consts/colors";
import { Ionicons } from "@expo/vector-icons";

// Seus componentes personalizados
import ArrowBack from '@/components/ArrowVoltar';
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";

export default function CadastroEncomendas() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estados do Formulário
  const [busca, setBusca] = useState("");
  const [moradores, setMoradores] = useState<any[]>([]);
  const [moradorSelecionado, setMoradorSelecionado] = useState<any>(null);
  const [descricao, setDescricao] = useState("");
  const [codigoRastreio, setCodigoRastreio] = useState("");

  // Busca moradores em tempo real
  useEffect(() => {
    if (busca.length > 2 && !moradorSelecionado) {
      procurarMoradores();
    } else if (busca.length <= 2) {
      setMoradores([]);
    }
  }, [busca]);

  async function procurarMoradores() {
    try {
      const { data } = await supabase
        .from('tb_morador')
        .select('id_morador, nome, num_apartamento')
        .ilike('nome', `%${busca}%`)
        .limit(5);
      
      setMoradores(data || []);
    } catch (error) {
      console.log("Erro na busca:", error);
    }
  }

  async function handleSalvar() {
    if (!moradorSelecionado || !descricao) {
      Alert.alert("Atenção", "Selecione um morador e descreva a encomenda.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Busca o condomínio do síndico
      const { data: admin } = await supabase
        .from('tb_administrador')
        .select('id_condominio')
        .eq('id_administrador', user?.id)
        .single();

      const { error } = await supabase.from('tb_encomendas').insert([{
        id_morador: moradorSelecionado.id_morador,
        id_condominio: admin?.id_condominio,
        descricao: descricao,
        codigo_rastreio: codigoRastreio,
        status: 'Pendente'
      }]);

      if (error) throw error;

      Alert.alert("Sucesso", "Encomenda registrada! O morador será avisado.");
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao salvar no banco de dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ArrowBack cor={COLORS.primary} />
        <Text style={styles.headerTitle}>Novo Recebimento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Campo de Busca com seu novo InputField */}
        <InputField 
          label="DESTINATÁRIO (MORADOR)"
          placeholder="Digite o nome para buscar..."
          value={moradorSelecionado ? moradorSelecionado.nome : busca}
          onChangeText={(t) => {
            setBusca(t);
            if (moradorSelecionado) setMoradorSelecionado(null);
          }}
          icon="person-outline"
        />

        {/* Dropdown de resultados da busca */}
        {moradores.length > 0 && !moradorSelecionado && (
          <View style={styles.dropdown}>
            {moradores.map((m) => (
              <TouchableOpacity 
                key={m.id_morador} 
                style={styles.dropdownItem}
                onPress={() => {
                  setMoradorSelecionado(m);
                  setBusca(m.nome);
                  setMoradores([]);
                }}
              >
                <Ionicons name="business-outline" size={16} color={COLORS.primary} />
                <Text style={styles.dropdownText}>
                  {m.nome} <Text style={{fontWeight: '400'}}>— Ap: {m.num_apartamento}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ marginTop: 10 }}>
          <InputField 
            label="O QUE CHEGOU?"
            placeholder="Ex: Pacote da Shopee, Caixa de Som..."
            value={descricao}
            onChangeText={setDescricao}
            icon="cube-outline"
          />

          <InputField 
            label="CÓDIGO OU IDENTIFICAÇÃO"
            placeholder="Ex: BR7749201 ou 'Sem código'"
            value={codigoRastreio}
            onChangeText={setCodigoRastreio}
            icon="barcode-outline"
          />
        </View>

        <View style={{ marginTop: 25 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <PrimaryButton 
              title="REGISTRAR ENCOMENDA" 
              onPress={handleSalvar} 
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 10
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginLeft: 15 
  },
  content: { padding: 25 },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9'
  },
  dropdownText: { 
    marginLeft: 10, 
    fontSize: 14, 
    color: '#333', 
    fontWeight: '600' 
  }
});