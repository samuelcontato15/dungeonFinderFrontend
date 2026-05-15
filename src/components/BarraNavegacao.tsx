import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const ITENS_NAVEGACAO = [
  { icone: "home-outline",          rotulo: "Home",         rota: "/"           },
  { icone: "people-outline",        rotulo: "Comunidade",   rota: "/comunidade" },
  { icone: "search-outline",        rotulo: "Pesquisar",    rota: "/pesquisar"  },
  { icone: "notifications-outline", rotulo: "Notificações", rota: "/notificacao"},
  { icone: "person-outline",        rotulo: "Perfil",       rota: "/perfil"     },
] as const;

export default function BarraNavegacao() {
  const margens      = useSafeAreaInsets();
  const roteador     = useRouter();
  const caminhoAtual = usePathname();
  const { isAuthenticated } = useAuth();

  function handleNavegar(rota: string) {
    if (!isAuthenticated) {
      roteador.push("/dungeonEntrada" as any);
      return;
    }

    if (rota === "/") {
      roteador.push("/home" as any);
      return;
    }

    roteador.push(rota as any);
  }

  return (
    <View style={[estilos.barra, { paddingBottom: margens.bottom + 6 }]}>
      {ITENS_NAVEGACAO.map((item) => {
        const ativo =
          caminhoAtual === item.rota ||
          (item.rota === "/" && caminhoAtual === "/home");

        return (
          <TouchableOpacity
            key={item.rotulo}
            style={estilos.itemNav}
            onPress={() => handleNavegar(item.rota)}
          >
            <Ionicons
              name={item.icone}
              size={24}
              color={ativo ? "#D4AF37" : "#aaa"}
            />
            <Text style={[estilos.rotulo, ativo && estilos.rotuloAtivo]}>
              {item.rotulo}
            </Text>
            {ativo && <View style={estilos.indicador} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: "row",
    backgroundColor: "rgba(18,12,8,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(212,175,55,0.25)",
    paddingTop: 10,
    paddingHorizontal: 7,
    gap: 12,
  },
  itemNav:     { flex: 1, alignItems: "center", gap: 3 },
  rotulo:      { fontSize: 10, color: "#aaa" },
  rotuloAtivo: { color: "#D4AF37", fontWeight: "600" },
  indicador:   { width: 4, height: 4, borderRadius: 2, backgroundColor: "#D4AF37", marginTop: 2 },
});