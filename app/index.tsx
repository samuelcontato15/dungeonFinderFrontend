import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Jogo {
  id: string;
  nome: string;
  slug: string;
  capa: string | null;
}

const ASSETS_LOCAIS: Record<string, any> = {
  wow:        require("../assets/wow.png"),
  albion:     require("../assets/ALBIONONLINE.png"),
  elder:      require("../assets/elder.png"),
  dagger:     require("../assets/dagger.png"),
  ded:        require("../assets/DeD.png"),
  rpgcellbit: require("../assets/rpgdocellbit.png"),
  tormenta:   require("../assets/tormenta.png"),
};

function resolverImagem(jogo: Jogo) {
  const slug = jogo.slug?.toLowerCase() ?? "";
  const nome = jogo.nome?.toLowerCase() ?? "";
  const chave = slug || nome;
  if (chave.includes("wow") || chave.includes("warcraft")) return ASSETS_LOCAIS.wow;
  if (chave.includes("albion"))                             return ASSETS_LOCAIS.albion;
  if (chave.includes("elder") || chave.includes("scrolls")) return ASSETS_LOCAIS.elder;
  if (chave.includes("dagger"))                             return ASSETS_LOCAIS.dagger;
  if (chave.includes("ded") || chave.includes("dungeons")) return ASSETS_LOCAIS.ded;
  if (chave.includes("cellbit"))                            return ASSETS_LOCAIS.rpgcellbit;
  if (chave.includes("tormenta"))                           return ASSETS_LOCAIS.tormenta;
  if (jogo.capa)                                            return { uri: jogo.capa };
  return ASSETS_LOCAIS.elder;
}

export default function Inicio() {
  const margens = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [jogos, setJogos]       = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(true);

useEffect(() => {
  if (!isLoading) {
    carregarJogos();
  }
}, [isLoading]);

async function carregarJogos() {
  try {
    setCarregando(true);

    const response = await api.get<Jogo[]>("/jogos");

    setJogos(response.data || []);
  } catch (error) {
    console.log("Erro ao carregar jogos:", error);
    setJogos([]);
  } finally {
    setCarregando(false);
  }
}

 function navegarParaJogo(jogo: Jogo) {
  if (!isAuthenticated) {
    router.push("/dungeonEntrada");
    return;
  }

  router.push({
    pathname: "/home",
    params: { jogoId: jogo.id },
  } as any);
}

  const slugsRpg = ["ded", "dungeons", "cellbit", "tormenta", "rpg"];
  const novidades = jogos.slice(0, 2);
  const idsNovidades = novidades.map(j => j.id);
  const games = jogos.filter(
  j =>
    !idsNovidades.includes(j.id) &&
    !slugsRpg.some(s =>
      (j.slug ?? j.nome ?? "").toLowerCase().includes(s)
    )
);
  const rpgMesa   = jogos.filter(j =>  slugsRpg.some(s => (j.slug ?? j.nome ?? "").toLowerCase().includes(s)));

  function SecaoJogos({
    titulo, dados, largura, altura,
  }: { titulo: string; dados: Jogo[]; largura: number; altura: number }) {
    if (dados.length === 0) return null;
    return (
      <View style={estilos.secao}>
        <View style={estilos.linhaTitulo}>
          <View style={estilos.acento} />
          <Text style={estilos.tituloSecao}>{titulo}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fileira}>
          {dados.map((jogo) => (
<View
  key={`${jogo.id}-${jogo.nome}`}
  style={{
    width: largura,
    marginRight: 12,
  }}
>
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => navegarParaJogo(jogo)}
    style={{ width: "100%" }}
  >
    <Image
      source={resolverImagem(jogo)}
      style={{
        width: "100%",
        height: altura,
        borderRadius: 10,
      }}
      resizeMode="cover"
    />
  </TouchableOpacity>
</View>
))}
    
        </ScrollView>
        <View style={estilos.divisor} />
      </View>
    );
  }

  return (
    <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo} resizeMode="cover">
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      {carregando || isLoading ? (
  <View style={estilos.centralizar}>
    <ActivityIndicator size="large" color="#D4AF37" />
  </View>
) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[estilos.rolagem, { paddingTop: margens.top + 12 }]}
          showsVerticalScrollIndicator={false}
        >
          <SecaoJogos titulo="NOVIDADES"   dados={novidades} largura={200} altura={110} />
          <SecaoJogos titulo="GAMES"       dados={games}     largura={140} altura={80}  />
          <SecaoJogos titulo="RPG DE MESA" dados={rpgMesa}   largura={130} altura={75}  />
          {jogos.length === 0 && (
            <Text style={estilos.semJogos}>Nenhum jogo disponível no momento.</Text>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo:       { flex: 1 },
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  rolagem:     { paddingHorizontal: 16, paddingBottom: 10 },
  centralizar: { flex: 1, justifyContent: "center", alignItems: "center" },
  secao:       { marginTop: 18 },
  linhaTitulo: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  acento:      { width: 4, height: 18, backgroundColor: "#D4AF37", borderRadius: 2, marginRight: 8 },
  tituloSecao: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 1.5 },
  fileira:     { paddingLeft: 2, paddingRight: 8, gap: 12 },
  divisor:     { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 16 },
  semJogos:    { color: "#888", textAlign: "center", marginTop: 40, fontStyle: "italic" },
});