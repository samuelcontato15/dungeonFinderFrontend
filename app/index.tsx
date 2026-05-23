import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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

const { width: telaLargura } = Dimensions.get("window");

interface Jogo {
  id: string;
  nome: string;
  slug: string;
  capa: string | null;
  categoria: string;
}

function contemCategoria(categoria: string, busca: string): boolean {
  return categoria?.toUpperCase().includes(busca);
}

export default function Inicio() {
  const margens = useSafeAreaInsets();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();

  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarJogos();
  }, []);

  async function carregarJogos() {
    try {
      setCarregando(true);
      const response = await api.get<Jogo[]>("/jogos");
      setJogos(response.data || []);
    } catch {
      setJogos([]);
    } finally {
      setCarregando(false);
    }
  }

  function navegarParaJogo(jogo: Jogo) {
    
    router.push({ pathname: "/telaJogo", params: { jogoId: jogo.id } } as any);
  }

  const novidades = jogos.filter(j => contemCategoria(j.categoria, "NOVIDADE"));
  const games     = jogos.filter(j => contemCategoria(j.categoria, "MMO"));
  const rpgMesa   = jogos.filter(j => contemCategoria(j.categoria, "RPG"));

  function SecaoJogos({ titulo, dados, largura, altura }: {
    titulo: string; dados: Jogo[]; largura: number; altura: number;
  }) {
    if (dados.length === 0) return null;
    return (
      <View style={estilos.secao}>
        <View style={estilos.linhaTitulo}>
          <View style={estilos.acento} />
          <Text style={estilos.tituloSecao}>{titulo}</Text>
          <Text style={estilos.quantidade}>{dados.length} jogos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fileira}>
          {dados.map((jogo) => (
            <TouchableOpacity
              key={jogo.id}
              activeOpacity={0.8}
              onPress={() => navegarParaJogo(jogo)}
              style={[estilos.cardJogo, { width: largura }]}
            >
              {jogo.capa ? (
                <Image source={{ uri: jogo.capa }} style={[estilos.imagemJogo, { height: altura }]} resizeMode="cover" />
              ) : (
                <View style={[estilos.imagemJogo, { height: altura, backgroundColor: "#2A2A2A", justifyContent: "center", alignItems: "center" }]}>
                  <Ionicons name="game-controller-outline" size={altura * 0.4} color="#D4AF37" />
                </View>
              )}
              <Text style={estilos.nomeJogo} numberOfLines={1}>{jogo.nome}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={estilos.divisor} />
      </View>
    );
  }

  if (carregando || authLoading) {
    return (
      <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo} resizeMode="cover">
        <View style={estilos.overlay} />
        <View style={estilos.centralizar}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo} resizeMode="cover">
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[estilos.rolagem, { paddingTop: margens.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <SecaoJogos titulo="NOVIDADES"   dados={novidades} largura={telaLargura * 0.55} altura={130} />
        <SecaoJogos titulo="GAMES (MMO)" dados={games}     largura={telaLargura * 0.4}  altura={100} />
        <SecaoJogos titulo="RPG DE MESA" dados={rpgMesa}   largura={telaLargura * 0.35} altura={95}  />
        {jogos.length === 0 && (
          <Text style={estilos.semJogos}>Nenhum jogo disponível no momento.</Text>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo:      { flex: 1 },
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  rolagem:    { paddingHorizontal: 16, paddingBottom: 10 },
  centralizar:{ flex: 1, justifyContent: "center", alignItems: "center" },
  secao:      { marginTop: 24 },
  linhaTitulo:{ flexDirection: "row", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap" },
  acento:     { width: 4, height: 18, backgroundColor: "#D4AF37", borderRadius: 2, marginRight: 8 },
  tituloSecao:{ color: "#fff", fontSize: 18, fontWeight: "bold", letterSpacing: 1.5, textTransform: "uppercase" },
  quantidade: { color: "#D4AF37", fontSize: 12, marginLeft: 8, fontWeight: "500" },
  fileira:    { paddingLeft: 2, paddingRight: 8, gap: 12 },
  cardJogo:   { borderRadius: 12, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.4)", marginBottom: 4 },
  imagemJogo: { width: "100%", borderRadius: 10, backgroundColor: "#1a1a1a" },
  nomeJogo:   { color: "#FFF", fontSize: 12, fontWeight: "600", textAlign: "center", marginTop: 6, marginBottom: 8, paddingHorizontal: 4 },
  divisor:    { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 16 },
  semJogos:   { color: "#888", textAlign: "center", marginTop: 40, fontStyle: "italic" },
});