import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  StatusBar
} from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        // Sugestão: Uma imagem que remeta a condomínios ou conexão urbana
        source={{
          uri: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.heroImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.heroTag}>VIZZO CONDOMÍNIOS</Text>
          
          <Text style={styles.heroTitle}>
            Conectando você aos serviços do seu <Text style={styles.italicText}>vizinho</Text>.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => router.push("./Cadastro")}
            >
              <Text style={styles.mainButtonText}>CRIAR CONTA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("./Login")}
            >
              <Text style={styles.secondaryButtonText}>ACESSAR LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f1111" 
  },
  heroImage: { 
    flex: 1, 
    width: "100%", 
    height: "100%" 
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 17, 17, 0.85)", // Escurecido para dar destaque ao texto
    justifyContent: "center",
    padding: "10%",
  },
  heroTag: {
    color: "#ff8c00", // Laranja Vizzo
    letterSpacing: 3,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 15,
  },
  heroTitle: {
    color: "white",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
    marginBottom: 50,
  },
  italicText: {
    fontStyle: "italic",
    color: "#2d79f3", // Azul destaque
  },
  buttonContainer: {
    gap: 15, // Espaçamento entre botões
  },
  mainButton: {
    backgroundColor: "#2d79f3", // Azul Principal
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2d79f3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  mainButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1.5,
    fontSize: 13,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#353838",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1.5,
    fontSize: 13,
  },
});