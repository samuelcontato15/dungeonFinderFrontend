
import BarraNavegacao from "@/components/BarraNavegacao";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

interface Evento {
  id: string;
  nome: string;
  descricao: string;
  banner: string | null;
  fimEm: string;
}

interface Raid {
  id: string;
  nome: string;
  descricao: string | null;
  minJogadores: number;
  maxJogadores: number;
  inicioEm: string;
}

interface Guilda {
  id: string;
  nome: string;
  descricao: string;
  banner: string | null;
}

interface Jogo {
  id: string;
  nome: string;
  capa: string | null;
}

export default function Home() {
  const margens = useSafeAreaInsets();
  const router = useRouter();
  const { jogoId } = useLocalSearchParams<{ jogoId: string }>();

  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [raids, setRaids] = useState<Raid[]>([]);
  const [guildas, setGuildas] = useState<Guilda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (jogoId) {
      carregarDados();
    }
  }, [jogoId]);

  async function carregarDados() {
    try {
      setCarregando(true);
      const [jogoRes, eventosRes, raidsRes, guildasRes] = await Promise.all([
        api.get(`/jogos/${jogoId}`),
        api.get(`/eventos/jogo/${jogoId}`),
        api.get(`/raids/jogo/${jogoId}`),
        api.get(`/guildas/jogo/${jogoId}`),
      ]);
      setJogo(jogoRes.data);
      setEventos(eventosRes.data || []);
      setRaids(raidsRes.data || []);
      setGuildas(guildasRes.data || []);
    } catch (error) {
      console.log("Erro HOME:", error);
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  if (carregando) {
    return (
      <ImageBackground
        source={require("../assets/fundo1.png")}
        style={estilos.fundo}
        resizeMode="cover"
      >
        <View style={estilos.overlay} />
        <View style={estilos.centralizar}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
        <BarraNavegacao />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: margens.top,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* CAPA DO JOGO */}
        {jogo?.capa ? (
          <Image source={{ uri: jogo.capa }} style={estilos.banner} resizeMode="cover" />
        ) : (
          <View style={estilos.bannerPlaceholder}>
            <Ionicons name="game-controller-outline" size={48} color="#D4AF37" />
            <Text style={estilos.bannerPlaceholderText}>{jogo?.nome || "Jogo"}</Text>
          </View>
        )}

        <View style={estilos.container}>
          {/* EVENTOS */}
          <Text style={estilos.tituloSecao}>EVENTOS</Text>
          {eventos.length === 0 ? (
            <Text style={estilos.textoVazio}>Nenhum evento disponível.</Text>
          ) : (
            eventos.map((evento) => (
              <View key={evento.id} style={estilos.cardEvento}>
                <Text style={estilos.tituloEvento}>{evento.nome}</Text>
                <View style={estilos.cardConteudo}>
                  {evento.banner ? (
                    <Image source={{ uri: evento.banner }} style={estilos.imagemEvento} />
                  ) : (
                    <View style={estilos.semImagem}>
                      <Ionicons name="image-outline" size={28} color="#D4AF37" />
                    </View>
                  )}
                  <Text style={estilos.descricaoEvento}>{evento.descricao}</Text>
                </View>
                <Text style={estilos.dataEvento}>Duração: até {formatarData(evento.fimEm)}</Text>
              </View>
            ))
          )}
          <View style={estilos.divisor} />

          {/* RAIDS */}
          <View style={estilos.headerRaids}>
            <Text style={estilos.tituloSecao}>RAIDS</Text>
            <TouchableOpacity
              style={estilos.botaoCriarRaid}
              onPress={() => router.push({ pathname: "/criarraid", params: { jogoId } } as any)}
            >
              <Ionicons name="add" size={24} color="#1a1008" />
            </TouchableOpacity>
          </View>

          {raids.length === 0 ? (
            <Text style={estilos.textoVazio}>Nenhuma raid criada.</Text>
          ) : (
            raids.map((raid) => (
              <View key={raid.id} style={estilos.cardRaid}>
                <Text style={estilos.nomeRaid}>{raid.nome}</Text>
                <Text style={estilos.infoRaid}>
                  Jogadores: {raid.minJogadores} - {raid.maxJogadores} · {formatarData(raid.inicioEm)}
                </Text>
                {raid.descricao && <Text style={estilos.descricaoRaid}>{raid.descricao}</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.membrosContainer}>
                  {Array.from({ length: Math.min(raid.maxJogadores, 5) }).map((_, index) => (
                    <View key={index} style={estilos.membroContainer}>
                      <View style={estilos.avatar}>
                        <Ionicons name="person" size={20} color="#999" />
                      </View>
                      <Text style={estilos.nomeMembro}>membro</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))
          )}
          <View style={estilos.divisor} />

          {/* PERSONAGENS DA COMUNIDADE (GUILDAS) */}
          <Text style={[estilos.tituloSecao, { marginTop: 8 }]}>PERSONAGENS DA COMUNIDADE</Text>
          {guildas.length === 0 ? (
            <Text style={estilos.textoVazio}>Nenhum personagem encontrado.</Text>
          ) : (
            guildas.map((guilda) => (
              <View key={guilda.id} style={estilos.cardGuilda}>
                {guilda.banner ? (
                  <Image source={{ uri: guilda.banner }} style={estilos.imagemGuilda} />
                ) : (
                  <View style={estilos.imagemGuildaPlaceholder}>
                    <Ionicons name="people-outline" size={28} color="#D4AF37" />
                  </View>
                )}
                <View style={estilos.guildaInfo}>
                  <Text style={estilos.nomeGuilda}>{guilda.nome}</Text>
                  <Text style={estilos.descricaoGuilda} numberOfLines={2}>
                    {guilda.descricao}
                  </Text>
                </View>
                <Ionicons name="thumbs-up" size={24} color="#49d15c" />
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.65)" },
  centralizar: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: {
    width: "100%",
    height: 180,
  },
  bannerPlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerPlaceholderText: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tituloSecao: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  headerRaids: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  botaoCriarRaid: {
    backgroundColor: "#D4AF37",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  divisor: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 20,
  },
  textoVazio: {
    color: "#AAA",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 16,
  },
  cardEvento: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tituloEvento: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardConteudo: {
    flexDirection: "row",
    gap: 12,
  },
  imagemEvento: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  semImagem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  descricaoEvento: {
    flex: 1,
    color: "#DDD",
    fontSize: 13,
    lineHeight: 18,
  },
  dataEvento: {
    color: "#D4AF37",
    fontSize: 12,
    marginTop: 8,
  },
  cardRaid: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  nomeRaid: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoRaid: {
    color: "#CCC",
    fontSize: 13,
    marginTop: 2,
  },
  descricaoRaid: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 4,
  },
  membrosContainer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
  },
  membroContainer: {
    alignItems: "center",
    width: 60,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  nomeMembro: {
    color: "#BBB",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  cardGuilda: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  imagemGuilda: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  imagemGuildaPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  guildaInfo: {
    flex: 1,
  },
  nomeGuilda: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  descricaoGuilda: {
    color: "#CCC",
    fontSize: 12,
    marginTop: 2,
  },
});