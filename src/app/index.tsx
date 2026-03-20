import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  
} from "react-native";
import { router } from "expo-router";
import Navegacao from "@/components/Navegacao";

export default function index() {
    const [currentScreen, setCurrentScreen] = useState('home');
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.heroImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.heroTag}>VISUALLINE EYWEAR</Text>
          <Text style={styles.heroTitle}>
            A visão que molda o{" "}
            <Text style={{ fontStyle: "italic" }}>futuro</Text>.
          </Text>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => router.push("./Cadastro")}
          >
            <Text style={styles.mainButtonText}>CADASTRO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("./Login")}
          >
            <Text style={styles.secondaryButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f0f0f" 

  },
  heroImage: { 
    flex: 1, 
    width: "100%", 
    height: "100%" 

  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 15, 15, 0.75)",
    justifyContent: "center",
    padding: "10%",
  },
  heroTag: {
    color: "#c5a47e",
    letterSpacing: 4,
    fontSize: 11,
    marginBottom: 15,
  },
  heroTitle: {
    color: "white",
    fontSize: 44,
    fontWeight: "700",
    lineHeight: 48,
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: "#c5a47e",
    padding: 18,
    alignItems: "center",
    marginBottom: 15,
  },
  mainButtonText: {
    color: "#0f0f0f",
    fontWeight: "bold",
    letterSpacing: 2,
    fontSize: 11,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 18,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 2,
    fontSize: 11,
  },
});
