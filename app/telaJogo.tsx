import BarraNavegacao from "@/components/BarraNavegacao";
import { Avatar, Botao, BotaoIcone, Campo, Carregando, EstadoVazio, Selo, Tela, estiloCartao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, gradientes, raios, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
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
  criadoPor?: { id: string; nick?: string; email?: string; fotoPerfil?: string };
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

function Secao({ titulo, children, acaoDireita }: {
  titulo: string;
  children: React.ReactNode;
  acaoDireita?: React.ReactNode;
}) {
  const [expandido, setExpandido] = useState(true);
  return (
    <View style={estilos.secaoWrapper}>
      <TouchableOpacity style={estilos.secaoHeader} onPress={() => setExpandido(v => !v)} activeOpacity={0.7}>
        <View style={estilos.losango} />
        <Text style={estilos.tituloSecao}>{titulo}</Text>
        <LinearGradient
          colors={[cores.bordaForte, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={estilos.secaoLinha}
        />
        {acaoDireita && expandido && acaoDireita}
        <Ionicons name={expandido ? "chevron-up" : "chevron-down"} size={18} color={cores.ouro} />
      </TouchableOpacity>
      {expandido && <View style={estilos.secaoConteudo}>{children}</View>}
    </View>
  );
}

export default function TelaJogo() {
  const margens = useSafeAreaInsets();
  const router = useRouter();
  const { jogoId } = useLocalSearchParams<{ jogoId: string }>();
  const { user, isAuthenticated } = useAuth();

  const [jogo, setJogo]       = useState<Jogo | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [raids, setRaids]     = useState<Raid[]>([]);
  const [guildas, setGuildas] = useState<Guilda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [inscrevendo, setInscrevendo] = useState<string | null>(null);
  const [buscaRaid, setBuscaRaid] = useState("");

  // Redireciona para login se não autenticado
  function exigirLogin(acao: () => void) {
    if (!isAuthenticated) {
      router.push("/dungeonEntrada" as any);
      return;
    }
    acao();
  }

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
        })
      );
   setRaids(raidsComParticipantes);

} catch (e: any) {

  console.log("ERRO STATUS:", e?.response?.status);
  console.log("ERRO DATA:", e?.response?.data);

  if (
    e?.response?.status !== 401 &&
    e?.response?.status !== 403
  ) {
    Alert.alert("Erro", "Não foi possível carregar os dados.");
  }

} finally {

  setCarregando(false);

}
}, [jogoId]);

  useFocusEffect(useCallback(() => {
    if (jogoId) carregarDados();
  }, [carregarDados, jogoId]));

  async function inscreverNaRaid(raidId: string) {
    if (!user?.id) return;
    try {
      setInscrevendo(raidId);
      await api.post(`/participantes?raidId=${raidId}`, {}, { headers: { "X-Usuario-Id": user.id } });
      await carregarDados();
      Alert.alert("Sucesso", "Você entrou na raid.");
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message || "Erro ao entrar na raid.");
    } finally {
      setInscrevendo(null);
    }
  }

  async function sairDaRaid(raidId: string) {
    if (!user?.id) return;
    try {
      await api.delete(`/participantes?raidId=${raidId}`, { headers: { "X-Usuario-Id": user.id } });
      await carregarDados();
      Alert.alert("Sucesso", "Você saiu da raid.");
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message || "Erro ao sair da raid.");
    }
  }

  async function excluirRaid(raidId: string) {
    if (!user?.id) return;
    try {
      await api.delete(`/raids/${raidId}`, { headers: { "X-Usuario-Id": user.id } });
      await carregarDados();
      Alert.alert("Sucesso", "Raid excluída.");
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message || "Erro ao excluir.");
    }
  }

  function confirmarSaidaOuExclusao(raid: Raid) {
    const ehCriador = String(user?.id) === String(raid.criadoPor?.id);
    Alert.alert(
      ehCriador ? "Excluir raid" : "Sair da raid",
      ehCriador ? "Deseja excluir permanentemente?" : "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: ehCriador ? "Excluir" : "Sair", style: "destructive",
          onPress: () => ehCriador ? excluirRaid(raid.id) : sairDaRaid(raid.id) },
      ]
    );
  }

  function formatarData(data: string) {
    if (!data) return "";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarDataHora(data: string) {
    if (!data) return "Sem data";
    return new Date(data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function isInscrito(raid: Raid) {
    if (!user?.id) return false;
    return raid.participantes?.some(p =>
      String(p?.usuario?.id) === String(user.id) || String(p?.usuarioId) === String(user.id)
    ) ?? false;
  }

  function isRaidCheia(raid: Raid) {
    return (raid.participantes?.length || 0) >= raid.maxJogadores;
  }

  const raidsFiltradas = raids.filter(raid => {
    const termo = buscaRaid.toLowerCase().trim();
    if (!termo) return true;
    return (
      raid.nome.toLowerCase().includes(termo) ||
      (raid.descricao ?? "").toLowerCase().includes(termo) ||
      raid.participantes?.some(p => (p.usuario?.nick ?? "").toLowerCase().includes(termo))
    );
  });

  if (carregando) {
    return (
      <Tela>
        <Carregando texto="Consultando o mural de missões…" />
        <BarraNavegacao />
      </Tela>
    );
  }

  return (
    <Tela>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* CAPA */}
        <View style={[estilos.banner, { height: 210 + margens.top }]}>
          {jogo?.capa ? (
            <Image source={{ uri: jogo.capa }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, estilos.bannerPlaceholder]}>
              <Ionicons name="game-controller-outline" size={56} color={cores.ouroEscuro} />
            </View>
          )}
          <LinearGradient colors={gradientes.capa} locations={[0.15, 0.6, 1]} style={StyleSheet.absoluteFill} />
          <BotaoIcone
            icone="chevron-back"
            onPress={() => router.back()}
            style={{ position: "absolute", top: margens.top + 10, left: 16 }}
          />
          <View style={estilos.bannerInfo}>
            <Text style={estilos.bannerNome} numberOfLines={2}>{jogo?.nome}</Text>
            <View style={estilos.bannerSelos}>
              <Selo texto={`${raids.length} raids`} icone="skull" />
              <Selo texto={`${guildas.length} guildas`} icone="shield" tom="neutro" />
              <Selo texto={`${eventos.length} eventos`} icone="calendar" tom="neutro" />
            </View>
          </View>
        </View>

        <View style={estilos.container}>

          {/* EVENTOS */}
          <Secao titulo="Eventos">
            {eventos.length === 0 ? (
              <EstadoVazio icone="calendar-outline" texto="Nenhum evento disponível." />
            ) : (
              eventos.map(evento => (
                <View key={evento.id} style={[estiloCartao.base, estilos.cardEvento]}>
                  {evento.banner ? (
                    <Image source={{ uri: evento.banner }} style={estilos.imagemEvento} />
                  ) : (
                    <View style={[estilos.imagemEvento, estilos.semImagem]}>
                      <Ionicons name="image-outline" size={26} color={cores.ouroEscuro} />
                    </View>
                  )}
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={estilos.tituloCard}>{evento.nome}</Text>
                    <Text style={tipo.suave}>{evento.descricao}</Text>
                    <View style={{ marginTop: 4 }}>
                      <Selo texto={`Até ${formatarData(evento.fimEm)}`} icone="hourglass-outline" tom="ambar" />
                    </View>
                  </View>
                </View>
              ))
            )}
          </Secao>

          {/* RAIDS */}
          <Secao
            titulo="Raids"
            acaoDireita={
              <TouchableOpacity
                style={estilos.botaoCriarRaid}
                onPress={() => exigirLogin(() =>
                  router.push({ pathname: "/criarraid", params: { jogoId } } as any)
                )}
              >
                <LinearGradient colors={gradientes.ouro} style={StyleSheet.absoluteFill} />
                <Ionicons name="add" size={22} color={cores.tinta} />
              </TouchableOpacity>
            }
          >
            <Campo
              icone="search-outline"
              placeholder="Buscar por nome, descrição ou player..."
              value={buscaRaid}
              onChangeText={setBuscaRaid}
              autoCapitalize="none"
              direita={
                buscaRaid.length > 0 ? (
                  <TouchableOpacity onPress={() => setBuscaRaid("")} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={cores.textoSuave} />
                  </TouchableOpacity>
                ) : undefined
              }
            />

            {!isAuthenticated && (
              <TouchableOpacity style={estilos.bannerLogin} onPress={() => router.push("/login" as any)}>
                <Ionicons name="lock-closed-outline" size={16} color={cores.ouro} />
                <Text style={estilos.bannerLoginTexto}>Faça login para criar ou participar de raids</Text>
                <Ionicons name="chevron-forward" size={16} color={cores.ouro} />
              </TouchableOpacity>
            )}

            {raidsFiltradas.length === 0 ? (
              <EstadoVazio
                icone="skull-outline"
                texto={buscaRaid.trim() ? "Nenhuma raid encontrada." : "Nenhuma raid criada."}
                dica={buscaRaid.trim() ? undefined : "Seja o primeiro a convocar um grupo."}
              />
            ) : (
              raidsFiltradas.map(raid => {
                const inscrito   = isInscrito(raid);
                const cheia      = isRaidCheia(raid);
                const ehCriador  = String(user?.id) === String(raid.criadoPor?.id);
                const podeParticipar = isAuthenticated && !inscrito && !cheia;
                const total      = raid.participantes?.length || 0;
                const ocupacao   = Math.min(1, total / (raid.maxJogadores || 1));

                return (
                  <View key={raid.id} style={[estilos.cardRaid, inscrito && estilos.cardRaidInscrito]}>
                    <View style={estilos.cardRaidHeader}>
                      <View style={estilos.linhaTopo}>
                        <Text style={[estilos.tituloCard, { flex: 1 }]}>{raid.nome}</Text>
                        {inscrito && <Selo texto="Inscrito" icone="checkmark-circle" tom="musgo" />}
                        {!inscrito && cheia && <Selo texto="Cheia" icone="lock-closed" tom="ambar" />}
                      </View>

                      <View style={estilos.linhaInfo}>
                        <Avatar uri={raid.criadoPor?.fotoPerfil} tamanho={22} />
                        <Text style={tipo.suave}>
                          por {raid.criadoPor?.nick || raid.criadoPor?.email || "Usuário"}
                        </Text>
                      </View>

                      {raid.descricao && <Text style={[tipo.corpo, { marginTop: 8 }]}>{raid.descricao}</Text>}

                      <View style={estilos.linhaInfo}>
                        <Ionicons name="time-outline" size={14} color={cores.ouro} />
                        <Text style={estilos.infoRaid}>{formatarDataHora(raid.inicioEm)}</Text>
                      </View>

                      <View style={estilos.vagas}>
                        <View style={estilos.linhaInfoSemMargem}>
                          <Ionicons name="people" size={14} color={cores.ouro} />
                          <Text style={estilos.infoRaid}>{total} / {raid.maxJogadores} jogadores</Text>
                        </View>
                        <View style={estilos.trilho}>
                          <View
                            style={[
                              estilos.preenchimento,
                              { width: `${ocupacao * 100}%` },
                              cheia && { backgroundColor: cores.ambar },
                            ]}
                          />
                        </View>
                      </View>
                    </View>

                    {raid.participantes?.length > 0 && (
                      <View style={estilos.participantesSecao}>
                        <Text style={[tipo.rotulo, { marginBottom: 10 }]}>Participantes ({raid.participantes.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.membrosContainer}>
                          {raid.participantes.map((p, i) => (
                            <View key={p.usuario?.id || i.toString()} style={estilos.membroContainer}>
                              <Avatar uri={p.usuario?.fotoPerfil} tamanho={46} />
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
                        <Botao
                          titulo="Editar"
                          icone="create-outline"
                          variante="secundario"
                          pequeno
                          onPress={() => router.push({ pathname: "/editarraid", params: { raidId: raid.id } } as any)}
                        />
                      )}
                      {/* Não logado */}
                      {!isAuthenticated && !inscrito && !cheia && (
                        <Botao
                          titulo="Login para participar"
                          icone="log-in-outline"
                          variante="secundario"
                          pequeno
                          onPress={() => router.push("/dungeonEntrada" as any)}
                        />
                      )}
                      {podeParticipar && (
                        <Botao
                          titulo="Participar"
                          icone="add-circle-outline"
                          pequeno
                          onPress={() => inscreverNaRaid(raid.id)}
                          carregando={inscrevendo === raid.id}
                        />
                      )}
                      {inscrito && (
                        <Botao
                          titulo={ehCriador ? "Excluir" : "Sair"}
                          icone={ehCriador ? "trash-outline" : "exit-outline"}
                          variante="perigo"
                          pequeno
                          onPress={() => confirmarSaidaOuExclusao(raid)}
                        />
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </Secao>

          {/* GUILDAS */}
          <Secao titulo="Guildas disponíveis">
            {guildas.length === 0 ? (
              <EstadoVazio icone="shield-outline" texto="Nenhuma guilda encontrada." />
            ) : (
              guildas.map(guilda => (
                <TouchableOpacity
                  key={guilda.id}
                  style={[estiloCartao.base, estiloCartao.linha]}
                  activeOpacity={0.8}
                  onPress={() => exigirLogin(() => router.push(`/detalhes/guilda/${guilda.id}` as any))}
                >
                  <Avatar uri={guilda.banner} tamanho={56} icone="shield" quadrado />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={estilos.tituloCard} numberOfLines={1}>{guilda.nome}</Text>
                    <Text style={tipo.suave} numberOfLines={2}>{guilda.descricao}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={cores.ouro} />
                </TouchableOpacity>
              ))
            )}
          </Secao>

        </View>
      </ScrollView>
      <BarraNavegacao />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  banner: { width: "100%", justifyContent: "flex-end", backgroundColor: cores.madeira800 },
  bannerPlaceholder: { justifyContent: "center", alignItems: "center", backgroundColor: cores.madeira700 },
  bannerInfo: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  bannerNome: { ...tipo.display, fontSize: 26, color: cores.pergaminhoClaro, letterSpacing: 1.5 },
  bannerSelos: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  container: { paddingHorizontal: 16, paddingTop: 8 },

  secaoWrapper: { marginTop: 14 },
  secaoHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  losango: { width: 7, height: 7, backgroundColor: cores.ouro, transform: [{ rotate: "45deg" }] },
  tituloSecao: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 16, letterSpacing: 2, textTransform: "uppercase" },
  secaoLinha: { flex: 1, height: 1 },
  secaoConteudo: { gap: 12, paddingTop: 4 },

  tituloCard: { fontFamily: fontes.titulo, color: cores.pergaminhoClaro, fontSize: 15, letterSpacing: 0.6 },
  botaoCriarRaid: { width: 34, height: 34, borderRadius: 17, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  bannerLogin: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(212,175,55,0.1)", borderWidth: 1, borderColor: cores.borda, borderRadius: raios.m, padding: 12 },
  bannerLoginTexto: { ...tipo.suave, color: cores.pergaminho, flex: 1 },

  cardEvento: { flexDirection: "row", gap: 12 },
  imagemEvento: { width: 84, height: 84, borderRadius: raios.m },
  semImagem: { backgroundColor: cores.madeira700, justifyContent: "center", alignItems: "center" },

  cardRaid: { backgroundColor: cores.cartao, borderRadius: raios.g, borderWidth: 1, borderColor: cores.borda, overflow: "hidden" },
  cardRaidInscrito: { borderColor: cores.bordaForte },
  cardRaidHeader: { padding: 14 },
  linhaTopo: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  linhaInfo: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  linhaInfoSemMargem: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoRaid: { fontFamily: fontes.corpoForte, color: cores.pergaminho, fontSize: 14 },
  vagas: { marginTop: 8, gap: 6 },
  trilho: { height: 5, borderRadius: 3, backgroundColor: "rgba(232,213,163,0.12)", overflow: "hidden" },
  preenchimento: { height: "100%", borderRadius: 3, backgroundColor: cores.ouro },
  participantesSecao: { borderTopWidth: 1, borderTopColor: cores.linha, paddingHorizontal: 14, paddingVertical: 12 },
  membrosContainer: { flexDirection: "row", gap: 10 },
  membroContainer: { alignItems: "center", width: 58, gap: 4 },
  nomeMembro: { ...tipo.suave, fontSize: 12, textAlign: "center" },
  raidFooter: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: cores.linha, backgroundColor: "rgba(0,0,0,0.25)" },
});
