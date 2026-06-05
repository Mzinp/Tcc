import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext"; // Importando o hook do tema global

// Seus componentes personalizados
import ArrowBack from '@/components/ArrowVoltar';
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";

export default function CadastroEncomendas() {
  const router = useRouter();
  const { theme } = useAppTheme(); // Injetando o cérebro do tema global de forma reativa
  const [loading, setLoading] = useState(false);
  
  // Estados do Formulário
  const [busca, setBusca] = useState("");
  const [moradores, setMoradores] = useState<any[]>([]);
  const [moradorSelecionado, setMoradorSelecionado] = useState<any>(null);
  const [descricao, setDescricao] = useState("");
  const [codigoRastreio, setCodigoRastreio] = useState("");

  // Busca moradores em tempo real (Mantida intacta)
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

  // FUNÇÃO AUXILIAR DE ALERTA ADAPTADA PARA PC (WEB) E CELULAR
  const dispararAlerta = (titulo: string, mensagem: string, acaoSucesso?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
      if (acaoSucesso) acaoSucesso();
      return;
    }

    Alert.alert(titulo, mensagem, [
      { text: "OK", onPress: () => { if (acaoSucesso) acaoSucesso(); } }
    ]);
  };

  async function handleSalvar() {
    if (!moradorSelecionado || !descricao) {
      dispararAlerta("Atenção", "Selecione um morador e descreva a encomenda.");
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

      dispararAlerta("Sucesso", "Encomenda registrada! O morador será avisado.", () => {
        router.back();
      });
      
    } catch (error) {
      console.log(error);
      dispararAlerta("Erro", "Falha ao salvar no banco de dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Novo Recebimento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Campo de Busca com seu InputField adaptado ao tema */}
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

        {/* Dropdown de resultados da busca adaptado dinamicamente */}
        {moradores.length > 0 && !moradorSelecionado && (
          <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {moradores.map((m) => (
              <TouchableOpacity 
                key={m.id_morador} 
                style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setMoradorSelecionado(m);
                  setBusca(m.nome);
                  setMoradores([]);
                }}
              >
                <Ionicons name="business-outline" size={16} color={theme.text} />
                <Text style={[styles.dropdownText, { color: theme.text }]}>
                  {m.nome} <Text style={{ fontWeight: '400', color: theme.subText }}>— Ap: {m.num_apartamento}</Text>
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
            <ActivityIndicator size="large" color={theme.text} />
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
  container: { flex: 1 },
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
    marginLeft: 15 
  },
  content: { padding: 25 },
  dropdown: {
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1
  },
  dropdownText: { 
    marginLeft: 10, 
    fontSize: 14, 
    fontWeight: '600' 
  }
});