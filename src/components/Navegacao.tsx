import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Navegacao() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [menuAberto, setMenuAberto] = useState(false);

  // --- COMPONENTES DE NAVEGAÇÃO ---
  const HeaderNav = ({ title }: { title: string }) => (
    <View style={styles.nav}>
      <TouchableOpacity onPress={() => setMenuAberto(true)}>
        <Text style={{ color: "white", fontSize: 24 }}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.logo}>{title}</Text>
      <TouchableOpacity onPress={() => setCurrentScreen("home")}>
        <Text style={styles.navLink}>SAIR</Text>
      </TouchableOpacity>
    </View>
  );
  // --- COMPONENTE DE MENU LATERAL ABERTO ---
  const SideMenu = () =>
    menuAberto && (
      <View style={styles.sideMenu}>
        <Text style={styles.menuTitle}>MENU EXECUTIVO</Text>
        <TouchableOpacity
          onPress={() => {
            setCurrentScreen("vendas");
            setMenuAberto(false);
          }}
          style={styles.menuLink}
        >
          <Text style={styles.menuLinkText}>COLEÇÃO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCurrentScreen("redes");
            setMenuAberto(false);
          }}
          style={styles.menuLink}
        >
          <Text style={styles.menuLinkText}>REDES SOCIAIS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCurrentScreen("contato");
            setMenuAberto(false);
          }}
          style={styles.menuLink}
        >
          <Text style={styles.menuLinkText}>CONTATO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMenuAberto(false)}
          style={{ marginTop: 40 }}
        >
          <Text style={{ color: "#c5a47e", letterSpacing: 2 }}>FECHAR</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  logo: {
    color: "#c5a47e",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  navLink: {
    color: "white",
    fontSize: 10,
    letterSpacing: 2,
  },
  sideMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "80%",
    backgroundColor: "#1a1a1a",
    zIndex: 100,
    padding: 40,
    paddingTop: 80,
  },
  menuTitle: {
    color: "#888",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 30,
  },
  menuLink: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#252525",
  },
  menuLinkText: {
    color: "white",
    fontSize: 16,
    letterSpacing: 1,
  },
});
