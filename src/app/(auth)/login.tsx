import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Image 
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/consts/colors";
import ArrowBack from "@/components/ArrowVoltar";

export default function Login() {
  const [isDark, setIsDark] = useState(true);

  React.useEffect(() => {
    const carregarTema = async () => {
      const salvo = await AsyncStorage.getItem('@vizzo_theme');
      if (salvo !== null) setIsDark(salvo === 'dark');
    };
    carregarTema();
  }, []);

  const theme = {
    bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    input: isDark ? "#252828" : "#f9f9f9",
    border: isDark ? "#353838" : "#eeeeee",
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    label: isDark ? COLORS.dark.subText : COLORS.light.subText,
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.loginForm, { 
          backgroundColor: theme.card, 
          borderColor: theme.border, 
          borderWidth: isDark ? 0 : 1,
          shadowOpacity: isDark ? 0.3 : 0.05 
        }]}>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require("@/assets/img/logo.png")} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>

          <Text style={styles.brandTitle}>VIZZO</Text>
          <Text style={[styles.loginTitle, { color: theme.text }]}>Bem-vindo de volta</Text>

          <Text style={[styles.inputLabel, { color: theme.label }]}>E-MAIL OU CPF</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              placeholder="Digite seus dados" 
              placeholderTextColor="#888" 
              style={{ color: theme.text, flex: 1, fontSize: 14 }} 
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.label, marginTop: 15 }]}>SENHA</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextInput 
              placeholder="••••••••" 
              placeholderTextColor="#888" 
              secureTextEntry 
              style={{ color: theme.text, flex: 1, fontSize: 14 }} 
            />
          </View>

          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={() => router.replace("/(main)/(tabs)/home")} 
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>ENTRAR NO VIZZO</Text>
          </TouchableOpacity>

          <View style={styles.esqueciView}>
            <TouchableOpacity onPress={() => router.push("/(auth)/esqueci-senha")}>
              <Text style={styles.esqueciText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={{ marginTop: 30, alignItems: 'center' }} 
          onPress={() => router.push("/(auth)/cadastro")}
        >
          <Text style={{ color: theme.label, fontSize: 14 }}>
            Não tem uma conta? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Cadastre-se aqui</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
  loginForm: { 
    padding: 35, 
    borderRadius: 30, 
    borderTopWidth: 6, 
    borderTopColor: COLORS.orange, 
    elevation: 8, 
    shadowColor: "#000", 
    shadowRadius: 15 
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 110,
    height: 55,
  },
  brandTitle: { color: COLORS.orange, fontSize: 12, fontWeight: "900", letterSpacing: 5, textAlign: "center", marginBottom: 5 },
  loginTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  inputLabel: { fontSize: 10, fontWeight: "700", marginBottom: 8, letterSpacing: 1 },
  inputContainer: { 
    borderWidth: 1, 
    borderRadius: 15, 
    height: 55, 
    paddingHorizontal: 15, 
    justifyContent: 'center' 
  },
  mainButton: { 
    backgroundColor: COLORS.primary, 
    padding: 18, 
    borderRadius: 15, 
    alignItems: "center", 
    marginTop: 30,
    elevation: 4
  },
  mainButtonText: { color: "#fff", fontWeight: "bold", letterSpacing: 1.5, fontSize: 14 },
  esqueciView: { marginTop: 25, alignItems: 'center' },
  esqueciText: { color: COLORS.primary, fontWeight: "600", fontSize: 13 }
});