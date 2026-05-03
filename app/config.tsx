import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const ITENS = [
  { id: "1", icone: "help-circle-outline",  rotulo: "Ajuda"        },
  { id: "2", icone: "options-outline",       rotulo: "Preferências" },
  { id: "3", icone: "log-out-outline",       rotulo: "Log-out",  logout: true },
] as const;

export default function Config() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleLogout() {
    Alert.alert("Sair", "Deseja realmente encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  }

  function handleItem(item: typeof ITENS[number]) {
    if (item.logout) {
      handleLogout();
      return;
    }
    // Navegação futura para Ajuda e Preferências
  }

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
        {/* Botão voltar */}
        <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4AF37" />
        </TouchableOpacity>

        <Text style={estilos.titulo}>Configurações</Text>

        <View style={estilos.lista}>
          {ITENS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={estilos.item}
              onPress={() => handleItem(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icone}
                size={32}
                color="#fff"
              />
              <Text style={estilos.itemTexto}>{item.rotulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  btnVoltar: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#E8D5A3",
    letterSpacing: 2,
    marginBottom: 48,
    marginTop: 4,
  },
  lista: {
    gap: 36,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  itemTexto: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 1,
  },
});