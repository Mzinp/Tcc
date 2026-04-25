import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  FlatList 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "@/consts/colors";
import ArrowBack from '@/components/ArrowVoltar';

export default function Visitantes() {
  const [isDark, setIsDark] = useState(true);

  const historico = [
    { id: '1', nome: 'Ana Souza', data: 'Ontem', tipo: 'Familiar' },
    { id: '2', nome: 'Marcos Uber', data: '12/04', tipo: 'Serviço' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      const carregarTema = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@vizzo_theme');
          if (salvo !== null) setIsDark(salvo === 'dark');
        } catch (e) {
          console.log("Erro ao carregar tema");
        }
      };
      carregarTema();
    }, [])
  );

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    input: isDark ? COLORS.dark.input : COLORS.light.input,
    border: isDark ? COLORS.dark.border : COLORS.light.border,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topHeader}>
        <ArrowBack cor={theme.text} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Visitantes</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Gerencie e autorize acessos à sua unidade</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nova Autorização</Text>
          </View>

          <Text style={styles.label}>NOME DO VISITANTE</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              style={[styles.input, { color: theme.text }]} 
              placeholder="Ex: João Silva" 
              placeholderTextColor={theme.subText} 
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1.5, marginRight: 10 }}>
              <Text style={styles.label}>CPF / RG</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  placeholder="000.000.000-00" 
                  keyboardType="numeric"
                  placeholderTextColor={theme.subText} 
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DATA</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  placeholder="Hoje" 
                  placeholderTextColor={theme.subText} 
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => router.push({ 
              pathname: "/(main)/(modal)/sucesso", 
              params: { mensagem: "A portaria recebeu a autorização!" } 
            })}
          >
            <Ionicons name="shield-checkmark" size={18} color="white" />
            <Text style={styles.buttonText}>LIBERAR ACESSO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>Recentes</Text>
          {historico.map((item) => (
            <TouchableOpacity 
                key={item.id} 
                style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.historyAvatar}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.historyName, { color: theme.text }]}>{item.nome}</Text>
                <Text style={[styles.historyMeta, { color: theme.subText }]}>{item.tipo} • {item.data}</Text>
              </View>
              <Ionicons name="repeat-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingTop: 60, paddingHorizontal: 15 },
  scrollContent: { paddingBottom: 50 },
  header: { paddingHorizontal: 25, marginVertical: 20 },
  title: { fontSize: 30, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 5 },
  
  formCard: { 
    marginHorizontal: 20, 
    padding: 20, 
    borderRadius: 25, 
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  
  label: { color: COLORS.primary, fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  inputWrapper: { borderRadius: 12, borderWidth: 1, height: 50, paddingHorizontal: 15, justifyContent: 'center', marginBottom: 15 },
  input: { flex: 1, fontSize: 14 },
  row: { flexDirection: 'row' },

  mainButton: { 
    backgroundColor: COLORS.primary, 
    padding: 16, 
    borderRadius: 15, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10
  },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },

  historySection: { paddingHorizontal: 25, marginTop: 30 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  historyCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 18, 
    marginBottom: 10,
    borderWidth: 1
  },
  historyAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(45, 121, 243, 0.1)', justifyContent: 'center', alignItems: 'center' },
  historyName: { fontSize: 15, fontWeight: 'bold' },
  historyMeta: { fontSize: 12, marginTop: 2 }
});