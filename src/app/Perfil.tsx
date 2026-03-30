import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Perfil() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarBorder}>
          <Image source={{ uri: 'https://github.com/gustavosilva.png' }} style={styles.avatar} />
        </View>
        <Text style={styles.userName}>Gustavo Silva</Text>
        <Text style={styles.userInfo}>Bloco A - Apto 52</Text>
      </View>

      <View style={styles.menu}>
        {[
          { icon: 'person-outline', label: 'Meus Dados' },
          { icon: 'notifications-outline', label: 'Notificações' },
          { icon: 'shield-checkmark-outline', label: 'Privacidade' },
          { icon: 'help-circle-outline', label: 'Ajuda e Suporte' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={22} color="#ff8c00" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#353838" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1111' },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  avatarBorder: { padding: 4, borderRadius: 60, borderWidth: 2, borderColor: '#2d79f3' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  userName: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  userInfo: { color: '#8b8e98', fontSize: 14 },
  menu: { paddingHorizontal: 25 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#1a1d1d' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { color: 'white', marginLeft: 15, fontSize: 16 },
  logoutBtn: { marginTop: 40, alignItems: 'center' },
  logoutText: { color: '#f44336', fontWeight: 'bold' }
});