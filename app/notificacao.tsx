import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function Notificacoes() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();

  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      setCarregando(true);

      const res = await api.get("/notificacoes", {
        headers: { "X-Usuario-Id": user?.id },
      });

      const lista = res.data;

      const enriquecidas = await Promise.all(
        lista.map(async (n: any) => {
          if (n.tipo === "SOLICITACAO_AMIZADE" && n.referenciaId) {
            try {
              const amzRes = await api.get(`/amizades/${n.referenciaId}`, {
                headers: { "X-Usuario-Id": user?.id },
              });
              const amizade = amzRes.data;
              const solicitante = amizade.solicitante;
              return { ...n, solicitante };
            } catch (error) {
              console.log("Erro ao buscar solicitante:", error);
              return { ...n, solicitante: null };
            }
          }
          return n;
        }),
      );

      setNotificacoes(enriquecidas);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as notificações.");
    } finally {
      setCarregando(false);
    }
  };

  const aceitarAmizade = async (notificacaoId: string, amizadeId: string) => {
    try {
      await api.put(
        `/amizades/${amizadeId}/responder?status=ACEITO`,
        {},
        {
          headers: { "X-Usuario-Id": user?.id },
        },
      );
      await api.put(
        `/notificacoes/${notificacaoId}/lida`,
        {},
        {
          headers: { "X-Usuario-Id": user?.id },
        },
      );
      Alert.alert("Sucesso", "Convite aceito!");
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Não foi possível aceitar o convite.");
    }
  };

  const recusarAmizade = async (notificacaoId: string, amizadeId: string) => {
    try {
      await api.put(
        `/amizades/${amizadeId}/responder?status=RECUSADO`,
        {},
        {
          headers: { "X-Usuario-Id": user?.id },
        },
      );
      await api.delete(`/notificacoes/${notificacaoId}`, {
        headers: { "X-Usuario-Id": user?.id },
      });
      Alert.alert("Aviso", "Convite recusado.");
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Erro ao processar a ação.");
    }
  };

  const deletarNotificacao = async (notificacaoId: string) => {
    try {
      await api.delete(`/notificacoes/${notificacaoId}`, {
        headers: { "X-Usuario-Id": user?.id },
      });
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Não foi possível deletar a notificação.");
    }
  };

  const abrirNotificacao = async (item: any) => {
    // Apenas marca como lida e redireciona se não for RAID
    if (!item.lida) {
      await api.put(
        `/notificacoes/${item.id}/lida`,
        {},
        {
          headers: { "X-Usuario-Id": user?.id },
        },
      );
    }
    // Redirecionar conforme necessidade (ex: perfil de usuário)
    // Por enquanto apenas recarrega
    carregarNotificacoes();
  };

  if (carregando) {
    return (
      <ImageBackground
        source={require("../assets/fundo1.png")}
        style={estilos.fundo}
      >
        <View style={estilos.overlay} />
        <View style={[estilos.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#E8D5A3" />
          </TouchableOpacity>
          <Text style={estilos.headerTitulo}>NOTIFICAÇÕES</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={estilos.centralizar}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#E8D5A3" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>NOTIFICAÇÕES</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={estilos.container}>
        {notificacoes.length > 0 ? (
          notificacoes.map((item) => {
            const isSolicitacao = item.tipo === "SOLICITACAO_AMIZADE";
            const isRaid =
              item.tipo === "NOVA_RAID" ||
              item.tipo === "NOVO_PARTICIPANTE_RAID";
            const solicitante = item.solicitante;
            const nomeSolicitante = solicitante?.nick || "Usuário";
            const fotoSolicitante = solicitante?.fotoPerfil || null;

            // Para notificações de RAID: não clicável, sem botão de deletar
            if (isRaid) {
              return (
                <View
                  key={item.id}
                  style={[estilos.cardNotificacao, estilos.cardRaid]}
                >
                  <View style={estilos.infoUsuario}>
                    <View style={estilos.avatar}>
                      <Ionicons name="shield" size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={estilos.nick} numberOfLines={1}>
                        Sistema de Raid
                      </Text>
                      <Text style={estilos.subtitulo}>
                        {item.mensagem || "Notificação de raid"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }

            // Notificações de amizade (e outros tipos) com interação normal
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => abrirNotificacao(item)}
                style={[estilos.cardNotificacao, item.lida && estilos.cardLida]}
              >
                <View style={estilos.infoUsuario}>
                  <View style={estilos.avatar}>
                    {fotoSolicitante ? (
                      <Image
                        source={{ uri: fotoSolicitante }}
                        style={estilos.imgAvatar}
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#FFF" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.nick} numberOfLines={1}>
                      {nomeSolicitante}
                    </Text>
                    <Text style={estilos.subtitulo}>
                      {isSolicitacao
                        ? "Enviou um convite de amizade"
                        : item.mensagem || "Notificação"}
                    </Text>
                  </View>
                </View>

                {isSolicitacao && !item.lida && (
                  <View style={estilos.acoes}>
                    <TouchableOpacity
                      style={estilos.btnAceitar}
                      onPress={() => aceitarAmizade(item.id, item.referenciaId)}
                    >
                      <Ionicons name="checkmark" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={estilos.btnRecusar}
                      onPress={() => recusarAmizade(item.id, item.referenciaId)}
                    >
                      <Ionicons name="close" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}

                {item.lida && !isRaid && (
                  <TouchableOpacity
                    style={estilos.btnDeletar}
                    onPress={() => deletarNotificacao(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={estilos.msgVazia}>Nenhuma notificação nova.</Text>
        )}
      </ScrollView>

      <View style={estilos.footer}>
        <BarraNavegacao />
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitulo: { color: "#E8D5A3", fontSize: 18, fontWeight: "bold" },
  container: { paddingHorizontal: 20, paddingBottom: 120 },
  centralizar: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardNotificacao: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
    gap: 10,
  },
  cardRaid: {
    borderColor: "#D4AF37",
    borderWidth: 1,
    opacity: 0.9,
  },
  cardLida: { opacity: 0.6 },
  infoUsuario: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8D5A3",
  },
  imgAvatar: { width: "100%", height: "100%" },
  nick: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  subtitulo: { color: "#999", fontSize: 12, marginTop: 2 },
  acoes: { flexDirection: "row", gap: 10 },
  btnAceitar: { backgroundColor: "#E8D5A3", padding: 8, borderRadius: 20 },
  btnRecusar: { backgroundColor: "#444", padding: 8, borderRadius: 20 },
  btnDeletar: { backgroundColor: "#B00020", padding: 8, borderRadius: 20 },
  msgVazia: {
    color: "#666",
    textAlign: "center",
    marginTop: 50,
    fontStyle: "italic",
  },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
