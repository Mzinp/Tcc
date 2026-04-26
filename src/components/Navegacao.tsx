import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, StatusBar } from "react-native";
import { supabase } from "../lib/supabase"; // Caminho correto partindo de /components
import { useRouter } from "expo-router";
import { COLORS } from "@/consts/colors";

interface NavegacaoProps {
  title: string;
}

export default function Navegacao({ title }: NavegacaoProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();

  // Função de Logout blindada com o L MAIÚSCULO
  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.replace("/(auth)/Login"); 
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  }

  return (
    <>
      {/* --- HEADER --- */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuAberto(true)}>
          <Text style={{ color: "white", fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
        
        <Text style={styles.logo}>{title.toUpperCase()}</Text>
        
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutLink}>SAIR</Text>
        </TouchableOpacity>
      </View>

      {/* --- MENU LATERAL (Modal) --- */}
      <Modal 
        visible={menuAberto} 
        animationType="fade" 
        transparent={true}
        onRequestClose={() => setMenuAberto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sideMenu}>
            <Text style={styles.menuTitle}>VIZZO - GESTÃO</Text>
            
            {/* LINK: DASHBOARD (Home em Tabs) */}
            <TouchableOpacity 
              style={styles.menuLink} 
              onPress={() => { setMenuAberto(false); router.push("/home"); }}
            >
              <Text style={styles.menuLinkText}>DASHBOARD</Text>
            </TouchableOpacity>

            {/* LINK: COMUNICADOS (Stack) */}
            <TouchableOpacity 
              style={styles.menuLink} 
              onPress={() => { setMenuAberto(false); router.push("/comunicados"); }}
            >
              <Text style={styles.menuLinkText}>COMUNICADOS</Text>
            </TouchableOpacity>

            {/* LINK: RESERVAS (Stack) */}
            <TouchableOpacity 
              style={styles.menuLink} 
              onPress={() => { setMenuAberto(false); router.push("/reservas"); }}
            >
              <Text style={styles.menuLinkText}>RESERVAS</Text>
            </TouchableOpacity>

            {/* LINK: OCORRÊNCIAS (Stack) */}
            <TouchableOpacity 
              style={styles.menuLink} 
              onPress={() => { setMenuAberto(false); router.push("/ocorrencias"); }}
            >
              <Text style={styles.menuLinkText}>OCORRÊNCIAS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setMenuAberto(false)} 
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>FECHAR MENU</Text>
            </TouchableOpacity>
          </View>

          {/* Área clicável fora do menu para fechar */}
          <TouchableOpacity 
            style={{ flex: 1 }} 
            onPress={() => setMenuAberto(false)} 
            activeOpacity={1}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    height: 100,
    backgroundColor: "#0f1111",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  menuBtn: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logo: {
    color: "#2d79f3", // Azul Vizzo
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 4,
  },
  logoutBtn: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  logoutLink: {
    color: "#ff8c00", // Laranja Vizzo
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    flexDirection: "row",
  },
  sideMenu: {
    width: "75%",
    backgroundColor: "#1a1d1d",
    padding: 30,
    paddingTop: 80,
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  menuTitle: {
    color: "#8b8e98",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 40,
    fontWeight: "900",
  },
  menuLink: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(53, 56, 56, 0.5)",
  },
  menuLinkText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  closeButton: {
    marginTop: 60,
    padding: 15,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#353838",
  },
  closeButtonText: {
    color: "#2d79f3",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});