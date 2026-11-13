import BarraNavegacao from "@/components/BarraNavegacao";
import { Avatar, Carregando, Divisor, EstadoVazio, Tela, TituloSecao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, gradientes, raios, sombra, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
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

function SecaoJogos({ titulo, dados, largura, altura, aoAbrir }: {
  titulo: string; dados: Jogo[]; largura: number; altura: number;
  aoAbrir: (jogo: Jogo) => void;
}) {
  if (dados.length === 0) return null;
  return (
    <View style={estilos.secao}>
      <TituloSecao
        titulo={titulo}
        style={{ paddingHorizontal: 20 }}
        direita={<Text style={estilos.quantidade}>{dados.length} jogos</Text>}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fileira}>
        {dados.map((jogo) => (
          <TouchableOpacity
            key={jogo.id}
            activeOpacity={0.85}
            onPress={() => aoAbrir(jogo)}
            style={[estilos.cardJogo, { width: largura, height: altura }]}
          >
            {jogo.capa ? (
              <Image source={{ uri: jogo.capa }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <View style={[StyleSheet.absoluteFill, estilos.semCapa]}>
                <Ionicons name="game-controller-outline" size={altura * 0.3} color={cores.ouroEscuro} />
              </View>
            )}
            <LinearGradient colors={gradientes.capa} locations={[0.3, 0.65, 1]} style={StyleSheet.absoluteFill} />
            <Text style={estilos.nomeJogo} numberOfLines={2}>{jogo.nome}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function Inicio() {
  const margens = useSafeAreaInsets();
  const router = useRouter();
  const { isLoading: authLoading, user, isAuthenticated } = useAuth();

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

  if (carregando || authLoading) {
    return (
      <Tela>
        <Carregando texto="Abrindo as portas da taverna…" />
      </Tela>
    );
  }

  return (
    <Tela>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: margens.top + 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.topo}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.saudacao}>
              {isAuthenticated && user?.usuario
                ? `Salve, ${user.usuario}`
                : "Bem-vindo, viajante"}
            </Text>
            <Text style={estilos.marca}>DUNGEON FINDER</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push((isAuthenticated ? "/perfil" : "/dungeonEntrada") as any)}
          >
            <Avatar uri={isAuthenticated ? user?.fotoPerfil : null} tamanho={46} destaque />
          </TouchableOpacity>
        </View>

        <Text style={estilos.lema}>
          Escolha um jogo, reúna seu grupo e parta para a próxima raid.
        </Text>

        <Divisor style={{ marginHorizontal: 20, marginTop: 18 }} />

        <SecaoJogos titulo="Novidades"   dados={novidades} largura={telaLargura * 0.7}  altura={170} aoAbrir={navegarParaJogo} />
        <SecaoJogos titulo="Games (MMO)" dados={games}     largura={telaLargura * 0.42} altura={190} aoAbrir={navegarParaJogo} />
        <SecaoJogos titulo="RPG de Mesa" dados={rpgMesa}   largura={telaLargura * 0.42} altura={190} aoAbrir={navegarParaJogo} />
        {jogos.length === 0 && (
          <EstadoVazio
            icone="game-controller-outline"
            texto="Nenhum jogo disponível no momento."
            dica="Volte mais tarde — novas aventuras chegam em breve."
          />
        )}
      </ScrollView>

      <BarraNavegacao />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  topo: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 },
  saudacao: { ...tipo.italico, color: cores.pergaminho },
  marca: { ...tipo.display, fontSize: 24, marginTop: 2 },
  lema: { ...tipo.suave, fontSize: 16, lineHeight: 22, paddingHorizontal: 20, marginTop: 10 },
  secao: { marginTop: 26 },
  quantidade: { fontFamily: fontes.corpoItalico, color: cores.textoSuave, fontSize: 14 },
  fileira: { paddingHorizontal: 20, gap: 14, paddingBottom: 6 },
  cardJogo: {
    borderRadius: raios.g,
    overflow: "hidden",
    backgroundColor: cores.madeira800,
    borderWidth: 1,
    borderColor: cores.borda,
    justifyContent: "flex-end",
    ...sombra,
  },
  semCapa: { justifyContent: "center", alignItems: "center", backgroundColor: cores.madeira700 },
  nomeJogo: {
    fontFamily: fontes.titulo,
    color: cores.pergaminhoClaro,
    fontSize: 13,
    letterSpacing: 0.8,
    padding: 12,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
