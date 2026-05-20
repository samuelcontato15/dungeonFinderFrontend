import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

interface Usuario {
  id: string;
  nick?: string;
  email?: string;
  fotoPerfil?: string;
}

interface Participante {
  usuario?: Usuario;
  usuarioId?: string;
}

interface Raid {
  id: string;
  nome: string;
  descricao: string | null;
  minJogadores: number;
  maxJogadores: number;
  inicioEm: string;
  participantes: Participante[];
  criadoPor?: {
    id: string;
    nick?: string;
    email?: string;
    fotoPerfil?: string;
  };
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

// ─── Componente de seção colapsável ──────────────────────────────────────────
function Secao({
  titulo,
  children,
  acaoDireita,
}: {
  titulo: string;
  children: React.ReactNode;
  acaoDireita?: React.ReactNode;
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <View style={estilos.secaoWrapper}>
      <TouchableOpacity
        style={estilos.secaoHeader}
        onPress={() => setExpandido((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={estilos.tituloSecao}>{titulo}</Text>
        <View style={estilos.secaoHeaderDireita}>
          {acaoDireita && expandido && (
            <View style={{ marginRight: 10 }}>{acaoDireita}</View>
          )}
          <Ionicons
            name={expandido ? "chevron-up" : "chevron-down"}
            size={20}
            color="#D4AF37"
          />
        </View>
      </TouchableOpacity>
      {expandido && <View style={estilos.secaoConteudo}>{children}</View>}
      <View style={estilos.divisor} />
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function TelaJogo() {
  const margens = useSafeAreaInsets();
  const router = useRouter();
  const { jogoId } = useLocalSearchParams<{ jogoId: string }>();
  const { user } = useAuth();

  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [raids, setRaids] = useState<Raid[]>([]);
  const [guildas, setGuildas] = useState<Guilda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [inscrevendo, setInscrevendo] = useState<string | null>(null);
  const [buscaRaid, setBuscaRaid] = useState("");

  const carregarDados = useCallback(async () => {
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
      setGuildas(guildasRes.data || []);

      const raidsComParticipantes = await Promise.all(
        (raidsRes.data || []).map(async (raid: any) => {
          try {
            const participantesRes = await api.get(`/participantes/raid/${raid.id}`);
            return { ...raid, participantes: participantesRes.data || [] };
          } catch {
            return { ...raid, participantes: [] };
          }
        }),
      );

      setRaids(raidsComParticipantes);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }, [jogoId]);

  useFocusEffect(
    useCallback(() => {
      if (jogoId) carregarDados();
    }, [carregarDados, jogoId]),
  );

  async function inscreverNaRaid(raidId: string) {
    if (!user?.id) return;
    try {
      setInscrevendo(raidId);
      await api.post(`/participantes?raidId=${raidId}`, {}, {
        headers: { "X-Usuario-Id": user.id },
      });
      await carregarDados();
      Alert.alert("Sucesso", "Você entrou na raid.");
    } catch (error: any) {
      Alert.alert("Erro", error?.response?.data?.message || "Erro ao entrar na raid.");
    } finally {
      setInscrevendo(null);
    }
  }

  async function sairDaRaid(raidId: string) {
    if (!user?.id) return;
    try {
      await api.delete(`/participantes?raidId=${raidId}`, {
        headers: { "X-Usuario-Id": user.id },
      });
      await carregarDados();
      Alert.alert("Sucesso", "Você saiu da raid.");
    } catch (error: any) {
      Alert.alert("Erro", error?.response?.data?.message || "Erro ao sair da raid.");
    }
  }

  async function excluirRaid(raidId: string) {
    if (!user?.id) return;
    try {
      await api.delete(`/raids/${raidId}`, {
        headers: { "X-Usuario-Id": user.id },
      });
      await carregarDados();
      Alert.alert("Sucesso", "Raid excluída com sucesso.");
    } catch (error: any) {
      Alert.alert("Erro", error?.response?.data?.message || "Erro ao excluir a raid.");
    }
  }

  function confirmarSaidaOuExclusao(raid: Raid) {
    const ehCriador = String(user?.id) === String(raid.criadoPor?.id);
    if (ehCriador) {
      Alert.alert(
        "Excluir raid",
        "Você é o criador desta raid. Deseja excluí-la permanentemente?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: () => excluirRaid(raid.id) },
        ],
      );
    } else {
      Alert.alert(
        "Sair da raid",
        "Tem certeza que deseja sair desta raid?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair", style: "destructive", onPress: () => sairDaRaid(raid.id) },
        ],
      );
    }
  }

  function formatarData(data: string) {
    if (!data) return "";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function isInscrito(raid: Raid) {
    if (!user?.id) return false;
    return (
      raid.participantes?.some(
        (p: any) =>
          String(p?.usuario?.id) === String(user.id) ||
          String(p?.usuarioId) === String(user.id),
      ) ?? false
    );
  }

  function isRaidCheia(raid: Raid) {
    return (raid.participantes?.length || 0) >= raid.maxJogadores;
  }

  const raidsFiltradas = raids.filter((raid) => {
    const termo = buscaRaid.toLowerCase().trim();
    if (!termo) return true;
    const temNomeOuDescricao =
      raid.nome.toLowerCase().includes(termo) ||
      (raid.descricao ?? "").toLowerCase().includes(termo);
    const temPlayer = raid.participantes?.some((p) =>
      (p.usuario?.nick ?? "").toLowerCase().includes(termo) ||
      (p.usuario?.email ?? "").toLowerCase().includes(termo)
    );
    return temNomeOuDescricao || temPlayer;
  });

  if (carregando) {
    return (
      <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo}>
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
        contentContainerStyle={{ paddingTop: margens.top, paddingBottom: 110 }}
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
          <Secao titulo="EVENTOS">
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
          </Secao>

          {/* RAIDS */}
          <Secao
            titulo="RAIDS"
            acaoDireita={
              <TouchableOpacity
                style={estilos.botaoCriarRaid}
                onPress={() => router.push({ pathname: "/criarraid", params: { jogoId } } as any)}
              >
                <Ionicons name="add" size={24} color="#1a1008" />
              </TouchableOpacity>
            }
          >
            {/* Barra de pesquisa */}
            <View style={estilos.buscaWrapper}>
              <Ionicons name="search-outline" size={16} color="#888" style={estilos.buscaIcone} />
              <TextInput
                style={estilos.buscaInput}
                placeholder="Buscar por nome, descrição ou player..."
                placeholderTextColor="#888"
                value={buscaRaid}
                onChangeText={setBuscaRaid}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {buscaRaid.length > 0 && (
                <TouchableOpacity onPress={() => setBuscaRaid("")}>
                  <Ionicons name="close-circle" size={16} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            {raidsFiltradas.length === 0 ? (
              <Text style={estilos.textoVazio}>
                {buscaRaid.trim() ? "Nenhuma raid encontrada." : "Nenhuma raid criada."}
              </Text>
            ) : (
              raidsFiltradas.map((raid) => {
                const inscrito = isInscrito(raid);
                const cheia = isRaidCheia(raid);
                const ehCriador = String(user?.id) === String(raid.criadoPor?.id);
                const podeParticipar = !!user && !inscrito && !cheia;

                return (
                  <View key={raid.id} style={estilos.cardRaid}>
                    <View style={estilos.cardRaidHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={estilos.nomeRaid}>{raid.nome}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                          {raid.criadoPor?.fotoPerfil ? (
                            <Image
                              source={{ uri: raid.criadoPor.fotoPerfil }}
                              style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
                            />
                          ) : (
                            <Ionicons name="person-circle" size={24} color="#D4AF37" />
                          )}
                          <Text style={{ color: "#AAA", fontSize: 12, marginLeft: 6 }}>
                            Criado por: {raid.criadoPor?.nick || raid.criadoPor?.email || "Usuário"}
                          </Text>
                        </View>
                        <Text style={estilos.infoRaid}>
                          <Ionicons name="people" size={12} color="#D4AF37" />{" "}
                          {raid.participantes?.length || 0} / {raid.maxJogadores} jogadores
                        </Text>
                        {raid.descricao && (
                          <Text style={estilos.descricaoRaid}>{raid.descricao}</Text>
                        )}
                      </View>
                      {inscrito && (
                        <View style={estilos.badgeInscrito}>
                          <Ionicons name="checkmark-circle" size={14} color="#1a1008" />
                          <Text style={estilos.badgeInscritoTexto}>Inscrito</Text>
                        </View>
                      )}
                    </View>

                    {raid.participantes?.length > 0 && (
                      <View style={estilos.participantesSecao}>
                        <Text style={estilos.participantesTitulo}>
                          PARTICIPANTES ({raid.participantes.length})
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={estilos.membrosContainer}
                        >
                          {raid.participantes.map((p, index) => (
                            <View key={p.usuario?.id || index.toString()} style={estilos.membroContainer}>
                              <View style={estilos.avatar}>
                                {p.usuario?.fotoPerfil ? (
                                  <Image source={{ uri: p.usuario.fotoPerfil }} style={{ width: 50, height: 50 }} />
                                ) : (
                                  <Ionicons name="person" size={22} color="#D4AF37" />
                                )}
                              </View>
                              <Text style={estilos.nomeMembro} numberOfLines={1}>
                                {p.usuario?.nick || p.usuario?.email || "Membro"}
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    <View style={estilos.raidFooter}>
                      {ehCriador && (
                        <TouchableOpacity
                          style={estilos.botaoEditar}
                          onPress={() => router.push({ pathname: "/editarraid", params: { raidId: raid.id } } as any)}
                        >
                          <Ionicons name="create-outline" size={14} color="#1a1008" />
                          <Text style={estilos.botaoEditarTexto}> Editar</Text>
                        </TouchableOpacity>
                      )}
                      {!inscrito && cheia && (
                        <View style={estilos.tagCheia}>
                          <Ionicons name="lock-closed" size={12} color="#FFA500" />
                          <Text style={estilos.textoCheia}> Raid cheia</Text>
                        </View>
                      )}
                      {podeParticipar && (
                        <TouchableOpacity
                          style={estilos.botaoParticipar}
                          onPress={() => inscreverNaRaid(raid.id)}
                        >
                          <Ionicons name="add-circle-outline" size={14} color="#FFF" />
                          <Text style={estilos.textoBotaoParticipar}> Participar</Text>
                        </TouchableOpacity>
                      )}
                      {inscrito && (
                        <TouchableOpacity
                          style={estilos.botaoSair}
                          onPress={() => confirmarSaidaOuExclusao(raid)}
                        >
                          <Ionicons
                            name={ehCriador ? "trash-outline" : "exit-outline"}
                            size={14}
                            color="#FFF"
                          />
                          <Text style={estilos.botaoSairTexto}>
                            {ehCriador ? " Excluir" : " Sair"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </Secao>

          {/* GUILDAS */}
          <Secao titulo="PERSONAGENS DA COMUNIDADE">
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
                    <Text style={estilos.descricaoGuilda} numberOfLines={2}>{guilda.descricao}</Text>
                  </View>
                  <Ionicons name="thumbs-up" size={24} color="#49d15c" />
                </View>
              ))
            )}
          </Secao>

        </View>
      </ScrollView>
      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  centralizar: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: { width: "100%", height: 180 },
  bannerPlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerPlaceholderText: { color: "#D4AF37", fontSize: 18, fontWeight: "bold", marginTop: 8 },
  container: { paddingHorizontal: 16, paddingTop: 16 },

  // Seção colapsável
  secaoWrapper: { marginBottom: 4 },
  secaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  secaoHeaderDireita: {
    flexDirection: "row",
    alignItems: "center",
  },
  secaoConteudo: { paddingTop: 8 },
  tituloSecao: { color: "#FFF", fontSize: 20, fontWeight: "bold" },

  divisor: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 4,
  },
  // Busca raids
  buscaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232,213,163,0.12)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  buscaIcone: { marginRight: 8 },
  buscaInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: "#FFF",
  },
  textoVazio: { color: "#AAA", fontSize: 14, fontStyle: "italic", marginBottom: 16 },
  botaoCriarRaid: {
    backgroundColor: "#D4AF37",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cardEvento: { marginBottom: 20 },
  tituloEvento: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  cardConteudo: { flexDirection: "row", gap: 12 },
  imagemEvento: { width: 80, height: 80, borderRadius: 8 },
  semImagem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  descricaoEvento: { flex: 1, color: "#DDD", fontSize: 13 },
  dataEvento: { color: "#D4AF37", fontSize: 12, marginTop: 8 },
  cardRaid: {
    backgroundColor: "rgba(20,12,4,0.75)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    marginBottom: 16,
    overflow: "hidden",
  },
  cardRaidHeader: { flexDirection: "row", padding: 14 },
  nomeRaid: { color: "#FFF", fontSize: 17, fontWeight: "bold", marginBottom: 4 },
  infoRaid: { color: "#D4AF37", fontSize: 12, marginTop: 6 },
  descricaoRaid: { color: "#AAA", fontSize: 12, marginTop: 6 },
  badgeInscrito: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF37",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  badgeInscritoTexto: { color: "#1a1008", fontWeight: "bold", fontSize: 11, marginLeft: 4 },
  participantesSecao: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  participantesTitulo: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
  },
  membrosContainer: { flexDirection: "row", gap: 10 },
  membroContainer: { alignItems: "center", width: 58 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#2a2010",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  nomeMembro: { color: "#CCC", fontSize: 10, marginTop: 5, textAlign: "center" },
  raidFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  botaoEditar: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  botaoEditarTexto: { color: "#1a1008", fontWeight: "bold" },
  botaoParticipar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  textoBotaoParticipar: { color: "#FFF", fontWeight: "bold", fontSize: 13 },
  botaoSair: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c0392b",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  botaoSairTexto: { color: "#FFF", fontWeight: "bold" },
  tagCheia: { flexDirection: "row", alignItems: "center" },
  textoCheia: { color: "#FFA500", fontWeight: "bold", fontSize: 12 },
  cardGuilda: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  imagemGuilda: { width: 60, height: 60, borderRadius: 30 },
  imagemGuildaPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  guildaInfo: { flex: 1 },
  nomeGuilda: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  descricaoGuilda: { color: "#CCC", fontSize: 12, marginTop: 2 },
});