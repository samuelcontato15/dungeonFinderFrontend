import { Cabecalho, Tela } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { cores, raios, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ITENS = [
  { id: "1", icone: "help-circle-outline", rotulo: "Ajuda" },
  { id: "2", icone: "options-outline", rotulo: "Preferências" },
  { id: "3", icone: "log-out-outline", rotulo: "Log-out", logout: true },
] as const;

export default function Config() {
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
    if ("logout" in item && item.logout) {
      handleLogout();
      return;
    }
  }

  return (
    <Tela>
      <Cabecalho titulo="Configurações" />

      <View style={estilos.lista}>
        {ITENS.map((item, i) => {
          const sair = "logout" in item && item.logout;
          return (
            <TouchableOpacity
              key={item.id}
              style={[estilos.item, i > 0 && estilos.itemBorda]}
              onPress={() => handleItem(item)}
              activeOpacity={0.7}
            >
              <View style={[estilos.icone, sair && estilos.iconeSair]}>
                <Ionicons
                  name={item.icone}
                  size={22}
                  color={sair ? cores.vinhoClaro : cores.ouro}
                />
              </View>
              <Text style={[estilos.itemTexto, sair && { color: cores.vinhoClaro }]}>
                {item.rotulo}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={cores.textoApagado} />
            </TouchableOpacity>
          );
        })}
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  lista: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: cores.cartao,
    borderRadius: raios.g,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemBorda: { borderTopWidth: 1, borderTopColor: cores.linha },
  icone: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: cores.borda,
    justifyContent: "center",
    alignItems: "center",
  },
  iconeSair: {
    backgroundColor: "rgba(142,42,42,0.2)",
    borderColor: "rgba(224,98,90,0.35)",
  },
  itemTexto: { ...tipo.subtitulo, fontSize: 19, flex: 1 },
});
