import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BotaoVoltar from "@/components/ArrowVoltar";

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Pede permissão para usar a câmera
  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  if (!permission) {
    return <View style={styles.container}><Text>Solicitando permissão de câmera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Precisamos de acesso à câmera para ler o QR Code.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Função disparada quando o QR Code é lido
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    // Aqui simulamos que o QR Code contém o nome do serviço ou ID do vizinho
    router.push({
      pathname: "/Sucesso",
      params: { mensagem: `Serviço detectado: ${data}. Notificação enviada ao vizinho!` }
    });
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
      
      {/* Overlay para dar estilo de "Mira" */}
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
        <BotaoVoltar cor="#ffffff" />
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
  btn: { backgroundColor: "#2d79f3", padding: 15, borderRadius: 10 },
  btnText: { color: "white", fontWeight: "bold" },
  
  // Estilo da Mira
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  middleContainer: { flexDirection: 'row', height: 250 },
  focusedContainer: { width: 250, backgroundColor: 'transparent', position: 'relative' },
  
  // Cantos da mira
  cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#2d79f3' },
  cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#2d79f3' },
  cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#2d79f3' },
  cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#2d79f3' },

  rescanBtn: { position: 'absolute', bottom: 50, backgroundColor: '#ffffff', padding: 15, borderRadius: 12 },
  rescanText: { color: '#0f1111', fontWeight: 'bold' }
});