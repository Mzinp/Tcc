import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { COLORS } from "@/consts/colors";
import ArrowBack from "@/components/ArrowVoltar";

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  if (!permission) {
    return <View style={styles.container}><Text style={{color: 'white'}}>Solicitando permissão...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Precisamos de acesso à câmera para ler o QR Code do Vizzo.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    
    try {
      // Tenta transformar o texto do QR em um objeto (JSON)
      const parsedData = JSON.parse(data);

      // Verifica se é um QR Code do nosso sistema (se tem o id_servico)
      if (parsedData.id_servico) {
        router.push({
          pathname: "/(main)/(modal)/sucesso",
          params: { mensagem: `Serviço de ${parsedData.prestador} detectado! A solicitação foi enviada.` }
        });
      } else {
        throw new Error("QR Code inválido");
      }
    } catch (e) {
      Alert.alert(
        "Código Inválido",
        "Este QR Code não pertence ao sistema Vizzo.",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      {/* Overlay de foco */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
             <View style={styles.cornerTopLeft} />
             <View style={styles.cornerTopRight} />
             <View style={styles.cornerBottomLeft} />
             <View style={styles.cornerBottomRight} />
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}></View>
      </View>

      <View style={styles.header}>
        <ArrowBack cor="#ffffff" />
        <Text style={styles.headerTitle}>Escanear Vizinho</Text>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
          <Text style={styles.rescanText}>Tentar Novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  header: { position: 'absolute', top: 60, left: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  text: { color: "white", textAlign: "center", marginBottom: 20, paddingHorizontal: 30 },
  btn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10 },
  btnText: { color: "white", fontWeight: "bold" },
  
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  middleContainer: { flexDirection: 'row', height: 250 },
  focusedContainer: { width: 250, backgroundColor: 'transparent', position: 'relative' },
  
  cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary },
  cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary },
  cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary },
  cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary },

  rescanBtn: { position: 'absolute', bottom: 50, backgroundColor: '#ffffff', padding: 15, borderRadius: 12 },
  rescanText: { color: '#0f1111', fontWeight: 'bold' }
});