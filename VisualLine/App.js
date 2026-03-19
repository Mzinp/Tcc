import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Image, KeyboardAvoidingView, ScrollView, FlatList, StatusBar, ImageBackground 
} from 'react-native';

// --- DADOS ---
const OCULOS_DATA = [
  { id: '1', nome: 'LARTISTE NOIR', preco: 'R$ 1.290', desc: 'Edição limitada com hastes em titânio e acabamento fosco.', tag: 'COLLECTION 2026' },
  { id: '2', nome: 'GOLDEN VELVET', preco: 'R$ 2.100', desc: 'Lentes polarizadas com proteção UV400 e detalhes em ouro 18k.', tag: 'TRIPLE A' },
];

const REDES_SOCIAIS = [
  { id: '1', rede: 'INSTAGRAM', link: '@visualline_premium' },
  { id: '2', rede: 'LINKEDIN', link: 'VisualLine Eyewear Corp' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [menuAberto, setMenuAberto] = useState(false);

  // --- COMPONENTES DE NAVEGAÇÃO ---
  const HeaderNav = ({ title }) => (
    <View style={styles.nav}>
      <TouchableOpacity onPress={() => setMenuAberto(true)}>
        <Text style={{ color: 'white', fontSize: 24 }}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.logo}>{title}</Text>
      <TouchableOpacity onPress={() => setCurrentScreen('home')}>
        <Text style={styles.navLink}>SAIR</Text>
      </TouchableOpacity>
    </View>
  );

  const SideMenu = () => (
    menuAberto && (
      <View style={styles.sideMenu}>
        <Text style={styles.menuTitle}>MENU EXECUTIVO</Text>
        <TouchableOpacity onPress={() => {setCurrentScreen('vendas'); setMenuAberto(false)}} style={styles.menuLink}>
          <Text style={styles.menuLinkText}>COLEÇÃO</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {setCurrentScreen('redes'); setMenuAberto(false)}} style={styles.menuLink}>
          <Text style={styles.menuLinkText}>REDES SOCIAIS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {setCurrentScreen('contato'); setMenuAberto(false)}} style={styles.menuLink}>
          <Text style={styles.menuLinkText}>CONTATO</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuAberto(false)} style={{marginTop: 40}}>
          <Text style={{color: '#c5a47e', letterSpacing: 2}}>FECHAR</Text>
        </TouchableOpacity>
      </View>
    )
  );

  // --- TELAS ---

  // 1. HOME [cite: 3, 4]
  if (currentScreen === 'home') {
    return (
      <View style={styles.container}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80' }} 
          style={styles.heroImage}
        >
          <View style={styles.overlay}>
            <Text style={styles.heroTag}>VISUALLINE EYWEAR</Text>
            <Text style={styles.heroTitle}>A visão que molda o <Text style={{fontStyle: 'italic'}}>futuro</Text>.</Text>
            <TouchableOpacity style={styles.mainButton} onPress={() => setCurrentScreen('cadastro')}>
              <Text style={styles.mainButtonText}>CADASTRO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setCurrentScreen('login')}>
              <Text style={styles.secondaryButtonText}>LOGIN</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }

  // 2. CADASTRO [cite: 5, 12, 16]
  if (currentScreen === 'cadastro') {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.containerDark}>
        <ScrollView contentContainerStyle={styles.centerContent}>
          <View style={styles.loginForm}>
            <Text style={styles.loginTitle}>Novo Membro</Text>
            <Text style={styles.inputLabel}>E-MAIL</Text>
            <TextInput style={styles.input} placeholder="executivo@email.com" placeholderTextColor="#555" />
            <Text style={styles.inputLabel}>CELULAR</Text>
            <TextInput style={styles.input} placeholder="+55 (11) 99999-9999" placeholderTextColor="#555" />
            <TouchableOpacity style={styles.fotoBotao}>
               <Text style={{color: '#c5a47e', letterSpacing: 1}}>+ ADICIONAR FOTO DE PERFIL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mainButton} onPress={() => setCurrentScreen('login')}>
              <Text style={styles.mainButtonText}>SALVAR CADASTRO</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // 3. LOGIN [cite: 6]
  if (currentScreen === 'login') {
    return (
      <View style={styles.containerDark}>
        <View style={styles.centerContent}>
          <View style={styles.loginForm}>
            <Text style={styles.logoSmall}>VISUALLINE.</Text>
            <Text style={styles.loginTitle}>Login de Acesso</Text>
            <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#555" />
            <TextInput style={styles.input} placeholder="Senha" secureTextEntry placeholderTextColor="#555" />
            <TouchableOpacity style={styles.mainButton} onPress={() => setCurrentScreen('vendas')}>
              <Text style={styles.mainButtonText}>ENTRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // 4. PRINCIPAL / VENDAS [cite: 1, 10]
  if (currentScreen === 'vendas') {
    return (
      <View style={styles.containerDark}>
        <SideMenu />
        <HeaderNav title="COLEÇÃO" />
        <FlatList
          data={OCULOS_DATA}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Text style={styles.cardTag}>{item.tag}</Text>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1511499767390-a73c99310f47?auto=format&fit=crop&w=800&q=80' }} style={styles.productImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.productName}>{item.nome}</Text>
                <Text style={styles.productPrice}>{item.preco}</Text>
                <Text style={styles.productDesc}>{item.desc}</Text>
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  // 5. REDES SOCIAIS (CardView) [cite: 13, 14, 15]
  if (currentScreen === 'redes') {
    return (
      <View style={styles.containerDark}>
        <SideMenu />
        <HeaderNav title="CONEXÕES" />
        <FlatList
          data={REDES_SOCIAIS}
          renderItem={({item}) => (
            <View style={styles.socialCard}>
              <Text style={styles.heroTag}>{item.rede}</Text>
              <Text style={styles.socialLink}>{item.link}</Text>
              <View style={[styles.divider, {width: '100%', marginTop: 15}]} />
            </View>
          )}
        />
      </View>
    );
  }

  // 6. CONTATO 
  if (currentScreen === 'contato') {
    return (
      <View style={styles.containerDark}>
        <SideMenu />
        <HeaderNav title="SUPORTE" />
        <View style={styles.centerContent}>
          <View style={styles.loginForm}>
            <Text style={styles.heroTag}>CONCIEGE 24/7</Text>
            <Text style={styles.productName}>WhatsApp Premium</Text>
            <Text style={styles.productDesc}>+55 11 94004-0000</Text>
            <Text style={[styles.productDesc, {marginTop: 10}]}>contato@visualline.com</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  containerDark: { flex: 1, backgroundColor: '#0f0f0f' },
  centerContent: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  
  // Hero
  heroImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 15, 15, 0.75)', justifyContent: 'center', padding: '10%' },
  heroTag: { color: '#c5a47e', letterSpacing: 4, fontSize: 11, marginBottom: 15 },
  heroTitle: { color: 'white', fontSize: 44, fontWeight: '700', lineHeight: 48, marginBottom: 40 },

  // Nav
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 50, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  logo: { color: '#c5a47e', fontSize: 20, fontWeight: 'bold', letterSpacing: 3 },
  navLink: { color: 'white', fontSize: 10, letterSpacing: 2 },

  // Menu Lateral 
  sideMenu: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '80%', backgroundColor: '#1a1a1a', zIndex: 100, padding: 40, paddingTop: 80 },
  menuTitle: { color: '#888', fontSize: 10, letterSpacing: 3, marginBottom: 30 },
  menuLink: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#252525' },
  menuLinkText: { color: 'white', fontSize: 16, letterSpacing: 1 },

  // Cards de Produto e Social
  productCard: { marginBottom: 40, paddingHorizontal: 25, marginTop: 20 },
  cardTag: { color: '#c5a47e', fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  productImage: { width: '100%', height: 350, backgroundColor: '#1a1a1a' },
  cardInfo: { paddingTop: 20 },
  productName: { color: 'white', fontSize: 20, fontWeight: '600' },
  productPrice: { color: '#c5a47e', fontSize: 16, marginTop: 5 },
  productDesc: { color: '#888', fontSize: 14, marginTop: 10, lineHeight: 22 },
  
  socialCard: { backgroundColor: '#1a1a1a', marginHorizontal: 25, marginTop: 20, padding: 25, borderLeftWidth: 2, borderLeftColor: '#c5a47e' },
  socialLink: { color: 'white', fontSize: 18, marginTop: 5 },

  // Formulários
  loginForm: { backgroundColor: '#1a1a1a', padding: 30, borderTopWidth: 2, borderTopColor: '#c5a47e' },
  loginTitle: { color: 'white', fontSize: 22, marginBottom: 30 },
  inputLabel: { color: '#c5a47e', fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  input: { borderBottomWidth: 1, borderBottomColor: '#333', color: 'white', paddingVertical: 12, marginBottom: 25 },
  fotoBotao: { height: 60, borderStyle: 'dashed', borderWidth: 1, borderColor: '#444', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },

  // Botões
  mainButton: { backgroundColor: '#c5a47e', padding: 18, alignItems: 'center', marginBottom: 15 },
  mainButtonText: { color: '#0f0f0f', fontWeight: 'bold', letterSpacing: 2, fontSize: 11 },
  secondaryButton: { borderWidth: 1, borderColor: '#444', padding: 18, alignItems: 'center' },
  secondaryButtonText: { color: 'white', fontWeight: 'bold', letterSpacing: 2, fontSize: 11 },
  divider: { height: 1, backgroundColor: '#333' }
});