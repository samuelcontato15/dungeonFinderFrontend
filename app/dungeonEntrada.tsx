import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DungeonEntrada() {
  const router = useRouter();
  const margens = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.container, { paddingTop: margens.top + 10, paddingBottom: margens.bottom + 20 }]}>
        <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          <Text style={estilos.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <View style={estilos.corpo}>
          <Text style={estilos.titulo}>DUNGEON FINDER</Text>
          <Text style={estilos.subtitulo}>Sua aventura começa aqui</Text>

         

          <View style={estilos.botoes}>
            <TouchableOpacity
              style={estilos.botaoPrimario}
              onPress={() => router.replace("/login")}
              activeOpacity={0.8}
            >
              <Text style={estilos.botaoPrimarioTexto}>Entrar na Dungeon</Text>
            </TouchableOpacity>

          

            <View style={estilos.cadastroLinha}>
              <Text style={estilos.cadastroTexto}>Não tem conta? </Text>
              <TouchableOpacity onPress={() => router.push("/cadastro")}>
                <Text style={estilos.cadastroLink}>Criar Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.60)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  btnVoltarTexto: {
    color: "#D4AF37",
    fontSize: 14,
  },
  corpo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "900",
    color: "#D4AF37",
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: "#ccc",
    letterSpacing: 2,
    marginTop: -12,
  },
  porta: {
    marginVertical: 16,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  icone: {
    opacity: 0.9,
  },
  botoes: {
  width: "100%",
  gap: 12,
  alignItems: "center",
  marginTop: 20,   
},
  botaoPrimario: {
    width: "100%",
    backgroundColor: "#D4AF37",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoPrimarioTexto: {
    color: "#1a1008",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
  botaoSecundario: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoSecundarioTexto: {
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: "600",
  },
  cadastroLinha: {
    flexDirection: "row",
    marginTop: 4,
  },
  cadastroTexto: {
    color: "#999",
    fontSize: 13,
  },
  cadastroLink: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "700",
  },
});