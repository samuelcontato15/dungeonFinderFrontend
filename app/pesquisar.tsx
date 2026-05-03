import React, { useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import BarraNavegacao from "@/components/BarraNavegacao";

export default function Pesquisar() {
  const margens        = useSafeAreaInsets();
  const roteador       = useRouter();
  const refEntrada     = useRef<TextInput>(null);
  const [busca, setBusca] = React.useState("");


  useEffect(() => {
    const temporizador = setTimeout(() => {
      refEntrada.current?.focus();
    }, 100);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.cabecalho, { paddingTop: margens.top + 12 }]}>
        <TouchableOpacity onPress={() => roteador.back()} style={estilos.botaoVoltar}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={estilos.campoBusca}>
          <Ionicons name="search-outline" size={18} color="#aaa" />
          <TextInput
            ref={refEntrada}
            placeholder="Buscar jogos, guildas, jogadores…"
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
            style={estilos.entradaBusca}
            returnKeyType="search"
            autoCorrect={false}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca("")}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={estilos.areaResultados}>
        {busca.length === 0 && (
          <Text style={estilos.textoVazio}>Digite para pesquisar…</Text>
        )}
      </View>

      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo:   { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  botaoVoltar: {
    padding: 4,
  },
  campoBusca: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  entradaBusca: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  areaResultados: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textoVazio: {
    color: "#666",
    fontSize: 14,
  },
});