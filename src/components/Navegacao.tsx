import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

interface NavegacaoProps {
  title: string;
}

export default function Navegacao({ title }: NavegacaoProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/Login");
  }

  return (
    <>
      {/* --- HEADER --- */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => setMenuAberto(true)}>
          <Text style={{ color: "white", fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>{title}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutLink}>SAIR</Text>
        </TouchableOpacity>
      </View>

      {/* --- MENU LATERAL (Usando Modal para sobrepor tudo) --- */}
      <Modal visible={menuAberto} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.sideMenu}>
            <Text style={styles.menuTitle}>VIZZO - MENU</Text>
            
            <TouchableOpacity style={styles.menuLink} onPress={() => { setMenuAberto(false); router.push("/HomeAdmin"); }}>
              <Text style={styles.menuLinkText}>DASHBOARD</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuLink} onPress={() => { setMenuAberto(false); }}>
              <Text style={styles.menuLinkText}>MORADORES</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuLink} onPress={() => { setMenuAberto(false); }}>
              <Text style={styles.menuLinkText}>COMUNICADOS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuLink} onPress={() => { setMenuAberto(false); }}>
              <Text style={styles.menuLinkText}>RESERVAS</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMenuAberto(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setMenuAberto(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#0f1111",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  logo: {
    color: "#2d79f3", // Azul Vizzo
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  logoutLink: {
    color: "#ff8c00", // Laranja Vizzo
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    flexDirection: "row",
  },
  sideMenu: {
    width: "75%",
    backgroundColor: "#1a1d1d",
    padding: 40,
    paddingTop: 80,
  },
  menuTitle: {
    color: "#8b8e98",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 30,
    fontWeight: "700",
  },
  menuLink: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#353838",
  },
  menuLinkText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  closeButton: {
    marginTop: 50,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#353838",
  },
  closeButtonText: {
    color: "#2d79f3",
    fontWeight: "bold",
    letterSpacing: 2,
  },
});