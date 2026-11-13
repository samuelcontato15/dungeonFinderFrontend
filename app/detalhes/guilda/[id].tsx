import BarraNavegacao from "@/components/BarraNavegacao";
import { Avatar, Botao, BotaoIcone, Carregando, Selo, Tela, TituloSecao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, gradientes, raios, sombra, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DetalhesGuilda() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [guilda, setGuilda] = useState<any>(null);
  const [membros, setMembros] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [membroSelecionado, setMembroSelecionado] = useState<any>(null);
  const [modalExpulsar, setModalExpulsar] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  useEffect(() => {
    if (id) carregarGuilda();
  }, [id]);

  async function carregarGuilda() {
    try {
      setCarregando(true);
      const [guildaRes, membrosRes] = await Promise.all([
        api.get(`/guildas/${id}`),
        api.get(`/guildas/${id}/membros`),
      ]);
      setGuilda(guildaRes.data);
      setMembros(membrosRes.data);
    } catch {
      Alert.alert("Erro", "Guilda não encontrada.");
      router.back();
    } finally {
      setCarregando(false);
    }
  }

  const isLider = guilda?.criadoPor?.id === user?.id;
  const isMembro = membros.some((m) => m.usuario?.id === user?.id);

  async function handleJuntarSe() {
    try {
      await api.post(`/guildas/${id}/membros/entrar`, {}, { headers: { "X-Usuario-Id": user?.id } });
      Alert.alert("Sucesso", "Você entrou na guilda!");
      carregarGuilda();
    } catch (e: any) {
      Alert.alert("Aviso", e?.response?.data?.message || "Erro ao entrar na guilda.");
    }
  }

  async function handleExpulsar() {
    try {
      await api.delete(`/guildas/${id}/membros/${membroSelecionado.usuario.id}/expulsar`, {
        headers: { "X-Usuario-Id": user?.id },
      });
      setModalExpulsar(false);
      Alert.alert("Sucesso", "Membro expulso.");
      carregarGuilda();
    } catch {
      Alert.alert("Erro", "Não foi possível expulsar o membro.");
    }
  }

  if (carregando || !guilda) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  return (
    <Tela>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={guilda.banner ? { uri: guilda.banner } : require("../../../assets/fundo1.png")}
          style={[estilos.banner, { height: 250 + insets.top }]}
        >
          <LinearGradient colors={gradientes.capa} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

          <BotaoIcone
            icone="chevron-back"
            onPress={() => router.back()}
            style={{ position: "absolute", top: insets.top + 10, left: 16 }}
          />

          <View style={estilos.bannerInfo}>
            <Text style={estilos.tituloGuilda}>{guilda.nome}</Text>
            <Text style={estilos.textoCriador}>
              fundada por {guilda.criadoPor?.nick} em{" "}
              {new Date(guilda.criadoEm).toLocaleDateString("pt-BR")}
            </Text>
            <View style={estilos.selos}>
              <Selo texto={`${membros.length} / ${guilda.maxMembros} membros`} icone="people" />
              {!!guilda.jogo?.nome && (
                <Selo texto={guilda.jogo.nome} icone="game-controller" tom="neutro" />
              )}
            </View>
          </View>
        </ImageBackground>

        <View style={estilos.container}>
          <View style={estilos.mensagemFixadaHeader}>
            <Ionicons name="pin" size={13} color={cores.ouro} />
            <Text style={tipo.rotulo}>Mensagem fixada</Text>
          </View>

          <View style={estilos.chatContainer}>
            <View style={estilos.avatarChat}>
              <Avatar uri={guilda.criadoPor?.fotoPerfil} tamanho={42} destaque />
              <Text style={estilos.nomeAvatarChat}>Admin</Text>
            </View>

            <TouchableOpacity
              style={estilos.balaoMensagem}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: "/guildachat", params: { id } } as any)}
            >
              <Text style={estilos.textoBalaoCorpo}>{guilda.descricao}</Text>
            </TouchableOpacity>
          </View>

          <TituloSecao titulo="Membros" style={{ marginTop: 28 }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.listaAmigos}>
            {isLider && (
              <TouchableOpacity
                style={estilos.avatarAmigoContainer}
                onPress={() => router.push({ pathname: "/amigos", params: { guildaId: id } } as any)}
              >
                <View style={estilos.btnAddAmigo}>
                  <Ionicons name="add" size={24} color={cores.ouro} />
                </View>
                <Text style={estilos.nickMembro}>Convidar</Text>
              </TouchableOpacity>
            )}
            {membros.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={estilos.avatarAmigoContainer}
                onPress={() => {
                  if (isLider && m.usuario?.id !== user?.id) {
                    setMembroSelecionado(m);
                    setModalExpulsar(true);
                  }
                }}
              >
                <Avatar uri={m.usuario?.fotoPerfil} tamanho={54} destaque={m.papel === "LIDER"} />
                <Text style={estilos.nickMembro} numberOfLines={1}>{m.usuario?.nick}</Text>
                {m.papel === "LIDER" && (
                  <View style={estilos.iconeLider}>
                    <Ionicons name="star" size={10} color={cores.tinta} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={estilos.acoes}>
            {!isMembro && (
              <Botao
                titulo={pedidoEnviado ? "Pedido enviado..." : "Juntar-se"}
                icone="enter-outline"
                onPress={handleJuntarSe}
                disabled={pedidoEnviado}
              />
            )}

            <Botao
              titulo="Taverna da guilda"
              icone="chatbubbles-outline"
              variante="secundario"
              onPress={() => router.push({ pathname: "/guildachat", params: { id } } as any)}
            />

            {isMembro && !isLider && (
              <Botao
                titulo="Sair da guilda"
                icone="exit-outline"
                variante="perigo"
                onPress={() =>
                  Alert.alert("Sair da guilda", "Tem certeza?", [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Sair", style: "destructive", onPress: async () => {
                        await api.delete(`/guildas/${id}/membros/sair`, {
                          headers: { "X-Usuario-Id": user?.id },
                        });
                        router.back();
                      }
                    },
                  ])
                }
              />
            )}
          </View>

        </View>
      </ScrollView>

      <Modal visible={modalExpulsar} transparent animationType="fade">
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalBox}>
            <Text style={estilos.modalTitulo}>Gerenciar Membro</Text>
            <Text style={[tipo.corpo, { marginBottom: 20 }]}>
              Deseja expulsar {membroSelecionado?.usuario?.nick} da guilda?
            </Text>
            <View style={{ gap: 10 }}>
              <Botao titulo="Expulsar" icone="close-circle-outline" variante="perigo" onPress={handleExpulsar} />
              <Botao titulo="Cancelar" variante="neutro" onPress={() => setModalExpulsar(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <View style={estilos.footer}>
        <BarraNavegacao />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  banner: { width: "100%", justifyContent: "flex-end", backgroundColor: cores.madeira800 },
  bannerInfo: { paddingHorizontal: 20, paddingBottom: 18, gap: 6 },
  tituloGuilda: { ...tipo.display, fontSize: 28, color: cores.pergaminhoClaro, letterSpacing: 1.5 },
  textoCriador: { ...tipo.italico, color: cores.pergaminho },
  selos: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  container: { paddingHorizontal: 20, paddingTop: 20 },
  mensagemFixadaHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  chatContainer: { flexDirection: "row", gap: 12 },
  avatarChat: { alignItems: "center", gap: 4 },
  nomeAvatarChat: { fontFamily: fontes.titulo, color: cores.ouro, fontSize: 9, letterSpacing: 0.8 },
  balaoMensagem: {
    flex: 1,
    backgroundColor: cores.pergaminho,
    borderRadius: raios.g,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: cores.ouroEscuro,
    padding: 16,
  },
  textoBalaoCorpo: { fontFamily: fontes.corpo, color: cores.tinta, fontSize: 17, lineHeight: 24 },
  listaAmigos: { gap: 14, paddingTop: 6, paddingRight: 8 },
  btnAddAmigo: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: cores.ouro, borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(212,175,55,0.08)" },
  avatarAmigoContainer: { alignItems: "center", width: 62, gap: 5 },
  nickMembro: { ...tipo.suave, fontSize: 12, textAlign: "center" },
  iconeLider: { position: "absolute", top: -4, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: cores.ouro, borderWidth: 2, borderColor: cores.madeira900, justifyContent: "center", alignItems: "center" },
  acoes: { gap: 12, marginTop: 30 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(5,3,2,0.85)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: cores.madeira800, padding: 22, borderRadius: raios.g, width: "84%", maxWidth: 380, borderWidth: 1, borderColor: cores.bordaForte, ...sombra },
  modalTitulo: { ...tipo.titulo, fontSize: 18, marginBottom: 10 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
