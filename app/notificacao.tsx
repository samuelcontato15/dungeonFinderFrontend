import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BarraNavegacao from "@/components/BarraNavegacao";

export default function Comunidade() {
  const margens = useSafeAreaInsets();
  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={[estilos.conteudo, { paddingTop: margens.top }]}>
        <Text style={estilos.texto}>Notificações</Text>
      </View>
      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo:    { flex: 1 },
  conteudo: { flex: 1, alignItems: "center", justifyContent: "center" },
  texto:    { color: "#fff", fontSize: 22, fontWeight: "700" },
});