import { Botao, BotaoIcone, Divisor, Tela } from "@/components/ui";
import { brilhoOuro, cores, fontes, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DungeonEntrada() {
  const router = useRouter();
  const margens = useSafeAreaInsets();

  return (
    <Tela>
      <View style={[estilos.container, { paddingTop: margens.top + 10, paddingBottom: margens.bottom + 24 }]}>
        <BotaoIcone icone="chevron-back" onPress={() => router.back()} />

        <View style={estilos.corpo}>
          <View style={estilos.brasao}>
            <View style={estilos.brasaoMiolo}>
              <Ionicons name="shield-half" size={46} color={cores.ouro} />
            </View>
          </View>

          <Text style={estilos.titulo}>DUNGEON{"\n"}FINDER</Text>
          <Divisor style={{ width: 200 }} />
          <Text style={estilos.subtitulo}>Sua aventura começa aqui</Text>
        </View>

        <View style={estilos.botoes}>
          <Botao
            titulo="Entrar na Dungeon"
            icone="key-outline"
            onPress={() => router.replace("/login")}
          />
          <Botao
            titulo="Criar Conta"
            variante="secundario"
            onPress={() => router.push("/cadastro")}
          />

          <View style={estilos.cadastroLinha}>
            <Text style={tipo.suave}>Ainda sem herói? </Text>
            <TouchableOpacity onPress={() => router.push("/cadastro")}>
              <Text style={estilos.cadastroLink}>Forje o seu agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  corpo: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  brasao: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    padding: 7,
    marginBottom: 8,
    backgroundColor: "rgba(13,8,5,0.6)",
    ...brilhoOuro,
  },
  brasaoMiolo: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: "rgba(212,175,55,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: { ...tipo.display, fontSize: 36, lineHeight: 44, textAlign: "center", letterSpacing: 6 },
  subtitulo: { ...tipo.italico, fontSize: 18, color: cores.pergaminho },
  botoes: { gap: 12 },
  cadastroLinha: { flexDirection: "row", justifyContent: "center", marginTop: 6 },
  cadastroLink: { fontFamily: fontes.corpoForte, color: cores.ouro, fontSize: 14 },
});
