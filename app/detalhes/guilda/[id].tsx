import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
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
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  async function handleJuntarSe() {
     console.log("user?.id:", user?.id);
    try {
      await api.post(
        `/guildas/${id}/membros/solicitar-entrada`,
        {},
        { headers: { "X-Usuario-Id": user?.id } }
      );
      setPedidoEnviado(true);
      Alert.alert("Pedido enviado!", "Aguarde o líder aprovar.");
    } catch (e: any) {
      Alert.alert("Aviso", e?.response?.data?.message || "Erro ao enviar pedido.");
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
      <View style={estilos.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <ImageBackground source={require("../../../assets/fundo1.png")} style={estilos.fundo}>
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <ImageBackground
          source={guilda.banner ? { uri: guilda.banner } : require("../../../assets/fundo1.png")}
          style={[estilos.banner, { paddingTop: insets.top + 10 }]}
        >
          <View style={estilos.bannerOverlay} />
          <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={estilos.bannerInfo}>
            <Text style={estilos.tituloGuilda}>{guilda.nome}</Text>
            <Text style={estilos.textoCriador}>feito por: {guilda.criadoPor?.nick}</Text>
            <Text style={estilos.textoCriador}>
              criada em {new Date(guilda.criadoEm).toLocaleDateString("pt-BR")}
            </Text>
            <View style={estilos.badgeMembros}>
              <Ionicons name="people" size={16} color="#FFF" />
              <Text style={estilos.textoMembros}>{membros.length} / {guilda.maxMembros} membros</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={estilos.container}>
          <View style={estilos.jogoLinha}>
            <Text style={estilos.labelJogos}>JOGOS:</Text>
            <Text style={estilos.nomeJogo}>{guilda.jogo?.nome}</Text>
          </View>

          <View style={estilos.mensagemFixadaHeader}>
            <Ionicons name="pin" size={14} color="#D4AF37" />
            <Text style={estilos.textoFixado}>Mensagem fixada</Text>
          </View>

          <View style={estilos.chatContainer}>
            <View style={estilos.avatarChat}>
              {guilda.criadoPor?.fotoPerfil ? (
                <Image source={{ uri: guilda.criadoPor.fotoPerfil }} style={estilos.imgAvatar} />
              ) : (
                <View style={[estilos.imgAvatar, { backgroundColor: "#444", justifyContent: "center", alignItems: "center" }]}>
                  <Ionicons name="person" size={18} color="#D4AF37" />
                </View>
              )}
              <Text style={estilos.nomeAvatarChat}>Admin</Text>
            </View>

            <TouchableOpacity
              style={estilos.balaoMensagem}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: "/guildachat", params: { id } } as any)}
            >
              <Text style={estilos.textoBalaoCorpo}>{guilda.descricao}</Text>
            </TouchableOpacity>
          </View>

          <Text style={estilos.tituloSessao}>Membros nessa guilda</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.listaAmigos}>
            {isLider && (
              <TouchableOpacity
                style={estilos.btnAddAmigo}
                onPress={() => router.push({ pathname: "/amigos", params: { guildaId: id } } as any)}
              >
                <Ionicons name="add" size={24} color="#D4AF37" />
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
                {m.usuario?.fotoPerfil ? (
                  <Image source={{ uri: m.usuario.fotoPerfil }} style={estilos.avatarAmigo} />
                ) : (
                  <View style={[estilos.avatarAmigo, { backgroundColor: "#444", justifyContent: "center", alignItems: "center" }]}>
                    <Ionicons name="person" size={20} color="#D4AF37" />
                  </View>
                )}
                <Text style={estilos.nickMembro} numberOfLines={1}>{m.usuario?.nick}</Text>
                {m.papel === "LIDER" && (
                  <Ionicons name="star" size={12} color="#D4AF37" style={estilos.iconeLider} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {!isMembro && (
            <TouchableOpacity
              style={[estilos.btnJuntar, pedidoEnviado && { opacity: 0.5 }]}
              onPress={handleJuntarSe}
              disabled={pedidoEnviado}
            >
              <Text style={estilos.btnJuntarTxt}>
                {pedidoEnviado ? "Pedido enviado..." : "Juntar-se"}
              </Text>
            </TouchableOpacity>
          )}

          {isMembro && !isLider && (
            <TouchableOpacity
              style={estilos.btnSair}
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
            >
              <Text style={estilos.btnSairTxt}>Sair da guilda</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal visible={modalExpulsar} transparent animationType="fade">
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalBox}>
            <Text style={estilos.modalTitulo}>Gerenciar Membro</Text>
            <Text style={estilos.modalTexto}>
              Deseja expulsar {membroSelecionado?.usuario?.nick} da guilda?
            </Text>
            <TouchableOpacity style={estilos.btnModalExpulsar} onPress={handleExpulsar}>
              <Text style={estilos.btnModalTxt}>Expulsar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.btnModalCancelar} onPress={() => setModalExpulsar(false)}>
              <Text style={estilos.btnModalTxt}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={estilos.footer}>
        <BarraNavegacao />
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: "#111" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.8)" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1a1008" },
  banner: { width: "100%", height: 220, justifyContent: "center", alignItems: "center" },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  btnVoltar: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  bannerInfo: { alignItems: "center", zIndex: 2, marginTop: 20 },
  tituloGuilda: { color: "#FFF", fontSize: 28, fontWeight: "bold" },
  textoCriador: { color: "#E8D5A3", fontSize: 12, fontStyle: "italic" },
  badgeMembros: { flexDirection: "row", alignItems: "center", marginTop: 10, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
  textoMembros: { color: "#FFF", fontSize: 12, marginLeft: 6 },
  container: { padding: 20 },
  jogoLinha: { flexDirection: "row", alignItems: "center", marginBottom: 30, gap: 10 },
  labelJogos: { color: "#FFF", fontSize: 22 },
  nomeJogo: { color: "#D4AF37", fontSize: 20, fontWeight: "bold" },
  mensagemFixadaHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 },
  textoFixado: { color: "#D4AF37", fontSize: 12 },
  chatContainer: { flexDirection: "row", gap: 10, marginBottom: 40 },
  avatarChat: { alignItems: "center" },
  imgAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#D4AF37" },
  nomeAvatarChat: { color: "#FFF", fontSize: 10, marginTop: 4 },
  balaoMensagem: { flex: 1, backgroundColor: "#EAE0D5", borderRadius: 15, borderTopLeftRadius: 0, padding: 15 },
  textoBalaoHeader: { color: "#5c4033", fontWeight: "bold", fontSize: 14, marginBottom: 10 },
  textoBalaoCorpo: { color: "#5c4033", fontSize: 14, lineHeight: 22 },
  tituloSessao: { color: "#FFF", fontSize: 20, marginBottom: 15 },
  listaAmigos: { flexDirection: "row", marginBottom: 30 },
  btnAddAmigo: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: "#D4AF37", borderStyle: "dashed", justifyContent: "center", alignItems: "center", marginRight: 15 },
  avatarAmigoContainer: { marginRight: 15, alignItems: "center" },
  avatarAmigo: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#FFF" },
  nickMembro: { color: "#ccc", fontSize: 9, marginTop: 3, maxWidth: 50, textAlign: "center" },
  iconeLider: { position: "absolute", top: -5, right: -5, backgroundColor: "#000", borderRadius: 10, padding: 2 },
  btnJuntar: { backgroundColor: "#8c6b22", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, alignSelf: "center", borderWidth: 1, borderColor: "#D4AF37", marginTop: 10 },
  btnJuntarTxt: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  btnSair: { backgroundColor: "#B00020", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, alignSelf: "center", marginTop: 10 },
  btnSairTxt: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#1a1008", padding: 20, borderRadius: 12, width: "80%", borderWidth: 1, borderColor: "#D4AF37" },
  modalTitulo: { color: "#E8D5A3", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalTexto: { color: "#FFF", marginBottom: 20 },
  btnModalExpulsar: { backgroundColor: "#B00020", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  btnModalCancelar: { backgroundColor: "#444", padding: 12, borderRadius: 8, alignItems: "center" },
  btnModalTxt: { color: "#FFF", fontWeight: "bold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },
});