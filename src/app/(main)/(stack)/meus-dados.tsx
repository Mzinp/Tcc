import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import ArrowBack from '@/components/ArrowVoltar';
import { useAppTheme } from "@/context/ThemeContext"; // Importando o hook do tema global

export default function MeusDados() {
  const { theme } = useAppTheme(); // Injetando o cérebro do tema de forma reativa
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 1. Tenta buscar na tabela de Administrador (conforme seu SQL)
          const { data: admin } = await supabase
            .from("tb_administrador")
            .select("*")
            .eq("id_administrador", user.id)
            .maybeSingle();

          if (admin) {
            // Agora pegando os dados reais da tabela do Administrador
            setUserProfile({
              exibirNome: admin.nome || "Administrador",
              exibirEmail: user.email,
              exibirDoc: admin.cpf || "N/A", 
              exibirTel: admin.telefone || "N/A",
              exibirBloco: admin.bloco || "ADM",
              exibirApto: admin.num_apartamento || "Sistema",
              tipo: "Administrador"
            });
          } else {
            // 2. Tenta buscar na tabela de Morador
            const { data: morador } = await supabase
              .from("tb_morador")
              .select("*")
              .eq("id_morador", user.id)
              .maybeSingle();

            if (morador) {
              // Pegando os dados reais da tabela do Morador
              setUserProfile({
                exibirNome: morador.nome || "Morador",
                exibirEmail: user.email, 
                exibirDoc: morador.cpf || "N/A",
                exibirTel: morador.telefone || "N/A",
                exibirBloco: morador.bloco || "N/A",
                exibirApto: morador.num_apartamento || "N/A",
                tipo: "Morador Verificado"
              });
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  const InfoItem = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
    <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: theme.bg }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{value || "Não informado"}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <ArrowBack cor={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Meus Dados</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.subText, marginTop: 15 }}>Sincronizando com banco...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.card }]}>
              <Ionicons name="person" size={50} color={theme.primary} />
            </View>
            <Text style={[styles.userName, { color: theme.text }]}>{userProfile?.exibirNome}</Text>
            <Text style={[styles.userRole, { color: theme.primary }]}>{userProfile?.tipo}</Text>
          </View>

          <View style={styles.detailsList}>
            <InfoItem label="E-MAIL" value={userProfile?.exibirEmail} icon="mail-outline" />
            <InfoItem label="CPF" value={userProfile?.exibirDoc} icon="card-outline" />
            <InfoItem label="TELEFONE" value={userProfile?.exibirTel} icon="call-outline" />
            
            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <InfoItem label="BLOCO" value={userProfile?.exibirBloco} icon="business-outline" />
                </View>
                <View style={{ flex: 1 }}>
                    <InfoItem label="APTO" value={userProfile?.exibirApto} icon="home-outline" />
                </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.editBtn, { borderColor: theme.border }]}
            onPress={() => alert("Para editar seus dados, entre em contato com a administração.")}
          >
            <Text style={[styles.editBtnText, { color: theme.subText }]}>SOLICITAR ALTERAÇÃO</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 25 },
  profileSection: { alignItems: 'center', marginBottom: 35 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userRole: { fontSize: 13, marginTop: 4, letterSpacing: 1, fontWeight: '700' },
  detailsList: { width: '100%' },
  infoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, marginBottom: 15, borderWidth: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoTextContainer: { marginLeft: 15 },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  value: { fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  editBtn: { marginTop: 20, padding: 18, borderRadius: 15, borderWidth: 1, alignItems: 'center' },
  editBtnText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5 }
});