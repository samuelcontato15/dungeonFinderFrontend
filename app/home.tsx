import React, { useEffect, useState } from "react";
import {
  View,
  Text,
 ScrollView,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import BarraNavegacao from "@/components/BarraNavegacao";
import api from "@/services/api";

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

const ASSETS_LOCAIS: Record<string, any> = {
  wow: require("../assets/wow.png"),
  albion: require("../assets/ALBIONONLINE.png"),
  elder: require("../assets/elder.png"),
  dagger: require("../assets/dagger.png"),
  ded: require("../assets/DeD.png"),
  rpgcellbit: require("../assets/rpgdocellbit.png"),
  tormenta: require("../assets/tormenta.png"),
};

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

      const [jogoRes, eventosRes, raidsRes, guildasRes] =
        await Promise.all([
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

  function resolverBanner() {
    if (!jogo) return ASSETS_LOCAIS.wow;

    const nome = jogo.nome?.toLowerCase() ?? "";

    if (nome.includes("warcraft") || nome.includes("wow")) {
      return ASSETS_LOCAIS.wow;
    }

    if (nome.includes("albion")) {
      return ASSETS_LOCAIS.albion;
    }

    if (nome.includes("elder")) {
      return ASSETS_LOCAIS.elder;
    }

    if (nome.includes("dagger")) {
      return ASSETS_LOCAIS.dagger;
    }

    if (nome.includes("dungeon")) {
      return ASSETS_LOCAIS.ded;
    }

    if (nome.includes("cellbit")) {
      return ASSETS_LOCAIS.rpgcellbit;
    }

    if (nome.includes("tormenta")) {
      return ASSETS_LOCAIS.tormenta;
    }

    if (jogo.capa) {
      return { uri: jogo.capa };
    }

    return ASSETS_LOCAIS.wow;
  }

  if (carregando) {
    return (
      <ImageBackground
        source={require("../assets/fundo1.png")}
        style={estilos.fundo}
        resizeMode="cover"
      >
        <View style={estilos.overlay} />

        <View style={estilos.loadingContainer}>
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
          paddingTop: margens.top + 10,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER */}
        <Image
          source={resolverBanner()}
          style={estilos.banner}
          resizeMode="cover"
        />

        <View style={estilos.container}>
          {/* EVENTOS */}
          <Text style={estilos.tituloSecao}>EVENTOS</Text>
        
          {eventos.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Nenhum evento disponível.
            </Text>
          ) : (
            eventos.map((evento) => (
              <View key={evento.id} style={estilos.cardEvento}>
                <Text style={estilos.tituloEvento}>
                  {evento.nome}
                </Text>

                <View style={estilos.cardConteudo}>
                  {evento.banner ? (
                    <Image
                      source={{ uri: evento.banner }}
                      style={estilos.imagemEvento}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={estilos.semImagem}>
                      <Ionicons
                        name="image-outline"
                        size={28}
                        color="#D4AF37"
                      />
                    </View>
                  )}

                  <Text style={estilos.descricaoEvento}>
                    {evento.descricao}
                  </Text>
                </View>

                <Text style={estilos.dataEvento}>
                  Duração: até {formatarData(evento.fimEm)}
                </Text>
              </View>
            ))
          )}
          <View style={estilos.divisor} />


          {/* RAIDS */}
          <Text style={estilos.tituloSecao}>RAIDS</Text>

          <TouchableOpacity
            style={estilos.botaoCriarRaid}
            onPress={() =>
              router.push({
                pathname: "/criarraid",
                params: { jogoId },
              } as any)
            }
          >
            <Ionicons name="add" size={28} color="#1a1008" />
          </TouchableOpacity>

          {raids.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Nenhuma raid criada.
            </Text>
          ) : (
            raids.map((raid) => (
              <View key={raid.id} style={estilos.cardRaid}>
                <Text style={estilos.nomeRaid}>
                  {raid.nome}
                </Text>

                <Text style={estilos.infoRaid}>
                  Nível mínimo: {raid.minJogadores} ·{" "}
                  {formatarData(raid.inicioEm)}
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: 12,
                    paddingTop: 10,
                  }}
                >
                  {Array.from({
                    length: Math.min(raid.maxJogadores, 5),
                  }).map((_, index) => (
                    <View key={index} style={estilos.membroContainer}>
                      <View style={estilos.avatar}>
                        <Ionicons
                          name="person"
                          size={20}
                          color="#999"
                        />
                      </View>

                      <Text style={estilos.nomeMembro}>
                        membro
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))
          )}
<View style={estilos.divisor} />

          {/* GUILDAS */}
          <Text style={[estilos.tituloSecao, { marginTop: 24 }]}>
            PERSONAGENS DA COMUNIDADE
          </Text>

          {guildas.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Nenhuma guilda encontrada.
            </Text>
          ) : (
            guildas.map((guilda) => (
              <View key={guilda.id} style={estilos.cardGuilda}>
                {guilda.banner ? (
                  <Image
                    source={{ uri: guilda.banner }}
                    style={estilos.imagemGuilda}
                  />
                ) : (
                  <Image
                    source={resolverBanner()}
                    style={estilos.imagemGuilda}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={estilos.nomeGuilda}>
                    {guilda.nome}
                  </Text>

                  <Text
                    style={estilos.descricaoGuilda}
                    numberOfLines={2}
                  >
                    {guilda.descricao}
                  </Text>
                </View>

                <Ionicons
                  name="thumbs-up"
                  size={28}
                  color="#49d15c"
                />
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
  fundo: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  banner: {
    width: "100%",
    height: 120,
  },

  container: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 100,
  },

  tituloSecao: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14,
    letterSpacing: 1,
    textAlign: "left",
  },

  divisor: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.14)",
    marginVertical: 18,
  },

  textoVazio: {
    color: "#888",
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "left",
  },

  cardEvento: {
    marginBottom: 20,
    paddingBottom: 18,
  },

  tituloEvento: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "left",
  },

  cardConteudo: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  imagemEvento: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },

  semImagem: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#2a1a08",
    justifyContent: "center",
    alignItems: "center",
  },

  descricaoEvento: {
    flex: 1,
    color: "#ddd",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "left",
  },

  dataEvento: {
    color: "#fff",
    marginTop: 10,
    fontSize: 13,
    textAlign: "left",
  },

  botaoCriarRaid: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
    alignSelf: "flex-start",
  },

  cardRaid: {
    marginBottom: 22,
    paddingBottom: 18,
  },

  nomeRaid: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "left",
  },

  infoRaid: {
    color: "#aaa",
    marginTop: 2,
    marginBottom: 14,
    fontSize: 13,
    textAlign: "left",
  },

  membrosRaid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  membroContainer: {
    alignItems: "center",
    width: 65,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  nomeMembro: {
    color: "#ddd",
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },

  cardGuilda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  imagemGuilda: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },

  guildaInfo: {
    flex: 1,
  },

  nomeGuilda: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 6,
    textAlign: "left",
  },

  descricaoGuilda: {
    color: "#bbb",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "left",
  },
});