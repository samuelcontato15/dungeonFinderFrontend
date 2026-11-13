import { useAuth } from "@/context/AuthContext";
import { cores, fontes } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ITENS_NAVEGACAO = [
  { icone: "home", rotulo: "Home", rota: "/" },
  { icone: "people", rotulo: "Comunidade", rota: "/comunidade" },
  { icone: "search", rotulo: "Pesquisar", rota: "/pesquisar" },
  { icone: "notifications", rotulo: "Avisos", rota: "/notificacao" },
  { icone: "person", rotulo: "Perfil", rota: "/perfil" },
] as const;

const ROTAS_PUBLICAS = ["/", "/dungeonEntrada"];

export default function BarraNavegacao() {
  const margens = useSafeAreaInsets();
  const roteador = useRouter();
  const caminhoAtual = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  function handleNavegar(rota: string) {
    if (isLoading) return; //

    if (!isAuthenticated && !ROTAS_PUBLICAS.includes(rota)) {
      roteador.push("/dungeonEntrada" as any);
      return;
    }

    if (caminhoAtual === rota) return;

    roteador.push(rota as any);
  }

  return (
    <View style={[estilos.barra, { paddingBottom: margens.bottom + 8 }]}>
      <LinearGradient
        colors={["transparent", cores.bordaForte, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={estilos.filete}
      />
      {ITENS_NAVEGACAO.map((item) => {
        const ativo =
          caminhoAtual === item.rota ||
          (item.rota === "/" && caminhoAtual === "/");

        return (
          <TouchableOpacity
            key={item.rotulo}
            style={estilos.itemNav}
            onPress={() => handleNavegar(item.rota)}
            activeOpacity={0.7}
          >
            <View style={[estilos.capsula, ativo && estilos.capsulaAtiva]}>
              <Ionicons
                name={(ativo ? item.icone : `${item.icone}-outline`) as any}
                size={21}
                color={ativo ? cores.ouroClaro : cores.textoApagado}
              />
            </View>
            <Text
              style={[estilos.rotulo, ativo && estilos.rotuloAtivo]}
              numberOfLines={1}
            >
              {item.rotulo}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: "row",
    backgroundColor: "rgba(13,8,5,0.97)",
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  filete: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
  itemNav: { flex: 1, alignItems: "center", gap: 4 },
  capsula: {
    width: 52,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  capsulaAtiva: {
    backgroundColor: "rgba(212,175,55,0.14)",
    borderColor: cores.borda,
  },
  rotulo: {
    fontFamily: fontes.titulo,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: cores.textoApagado,
    textTransform: "uppercase",
  },
  rotuloAtivo: { color: cores.ouroClaro },
});
