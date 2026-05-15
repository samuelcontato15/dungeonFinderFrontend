import React from "react";
import { View, Text, StyleSheet, ImageBackground, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BarraNavegacao from "@/components/BarraNavegacao";

export default function Guilda() {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.container, { paddingTop: insets.top + 20 }]}>
        <Text style={estilos.titulo}>GUILDA</Text>
        <Text style={estilos.subtitulo}>Em breve...</Text>
      </View>

      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo:     { flex: 1 },
  overlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  titulo:    { color: "#D4AF37", fontSize: 28, fontWeight: "900", letterSpacing: 4 },
  subtitulo: { color: "#aaa", fontSize: 14, marginTop: 8 },
});