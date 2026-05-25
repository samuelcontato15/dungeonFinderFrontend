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
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      const lista = Array.isArray(res.data) ? res.data : [];

      const enriquecidas = await Promise.all(
        lista.map(async (n: any) => {
          try {
            if (n.tipo === "SOLICITACAO_AMIZADE" && n.referenciaId) {
              const amzRes = await api.get(`/amizades/${n.referenciaId}`, {
                headers: {
                  "X-Usuario-Id": user?.id,
                },
              });

              return {
                ...n,
                solicitante: amzRes.data.solicitante,
              };
            }
            if (
              n.tipo === "PEDIDO_ENTRAR_GUILDA" &&
              n.referenciaTipo &&
              n.referenciaTipo.length > 20
            ) {
              const guildaRes = await api.get(`/guildas/${n.referenciaTipo}`);

              return {
                ...n,
                guildaInfo: guildaRes.data,
              };
            }

            if (n.tipo === "CONVITE_GUILDA" && n.referenciaId) {
              const guildaRes = await api.get(`/guildas/${n.referenciaId}`);

              return {
                ...n,
                guildaInfo: guildaRes.data,
              };
            }

            return n;
          } catch (error) {
            console.log("ERRO AO PROCESSAR NOTIFICAÇÃO:", error);
            return n;
          }
        })
      );
      setNotificacoes(enriquecidas);
    } catch (error) {
      console.log("ERRO GERAL:", error);
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
          headers: {
            "X-Usuario-Id": user?.id,
          },
        }
      );

      await api.delete(`/notificacoes/${notificacaoId}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      Alert.alert("Sucesso", "Convite de amizade aceito!");
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
          headers: {
            "X-Usuario-Id": user?.id,
          },
        }
      );

      await api.delete(`/notificacoes/${notificacaoId}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      Alert.alert("Aviso", "Convite recusado.");
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Erro ao processar a ação.");
    }
  };

  const aprovarPedidoGuilda = async (
    notificacaoId: string,
    usuarioQuePediuId: string,
    guildaId: string
  ) => {
    try {
      await api.post(
        `/guildas/${guildaId}/membros/${usuarioQuePediuId}/aprovar`,
        {},
        {
          headers: {
            "X-Usuario-Id": user?.id,
          },
        }
      );

      await api.delete(`/notificacoes/${notificacaoId}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      Alert.alert("Sucesso!", "Novo membro aceito na guilda!");
      carregarNotificacoes();
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível aprovar o membro."
      );
    }
  };

  const aceitarConviteGuilda = async (
    notificacaoId: string,
    guildaId: string
  ) => {
    try {
      await api.post(
        `/guildas/${guildaId}/membros/entrar`,
        {},
        {
          headers: {
            "X-Usuario-Id": user?.id,
          },
        }
      );

      await api.delete(`/notificacoes/${notificacaoId}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      Alert.alert("Sucesso!", "Você agora é membro da guilda!");
      carregarNotificacoes();
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível entrar na guilda."
      );
    }
  };

  const recusarConviteGuilda = async (notificacaoId: string) => {
    try {
      await api.delete(`/notificacoes/${notificacaoId}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Erro ao excluir convite.");
    }
  };

  const deletarNotificacao = async (notificacaoId: string) => {
    try {
      await api.delete(`/notificacoes/${notificacaoId}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Não foi possível deletar a notificação.");
    }
  };

  const abrirNotificacao = async (item: any) => {
    try {
      if (!item.lida) {
        await api.put(
          `/notificacoes/${item.id}/lida`,
          {},
          {
            headers: {
              "X-Usuario-Id": user?.id,
            },
          }
        );
      }

      if (item.tipo === "CONVITE_GUILDA" && item.referenciaId) {
        router.push(`/detalhes/guilda/${item.referenciaId}`);
      } else {
        carregarNotificacoes();
      }
    } catch (error) {
      console.log("ERRO AO ABRIR NOTIFICAÇÃO:", error);
    }
  };

  if (carregando) {
    return (
      <ImageBackground
        source={require("../assets/fundo1.png")}
        style={estilos.fundo}
      >
        <View style={estilos.overlay} />
        <View
          style={[
            estilos.header,
            {
              paddingTop: insets.top + 10,
            },
          ]}
        >
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

      <View
        style={[
          estilos.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}
      >
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
            const isConviteGuilda = item.tipo === "CONVITE_GUILDA";
            const isPedidoGuilda = item.tipo === "PEDIDO_ENTRAR_GUILDA";
            const isRaid =
              item.tipo === "NOVA_RAID" ||
              item.tipo === "NOVO_PARTICIPANTE_RAID" ||
              item.tipo === "RAID_INICIANDO";
            const isEvento = item.tipo === "EVENTO";
            const isSistema = item.tipo === "SISTEMA";
            const isBuild = item.tipo === "BUILD_PUBLICA";

            let fotoAvatar = null;
            let titulo = "Notificação";
            let subTitulo = item.mensagem || "";
            let iconeFallback = "notifications";

            if (isSolicitacao) {
              fotoAvatar = item.solicitante?.fotoPerfil;
              titulo = item.solicitante?.nick || "Usuário";
              subTitulo = "Enviou um convite de amizade";
              iconeFallback = "person";
            } else if (isConviteGuilda || isPedidoGuilda) {
              fotoAvatar = item.guildaInfo?.banner;
              titulo = isConviteGuilda
                ? "Convite de Guilda"
                : "Pedido de Entrada";
              subTitulo = isConviteGuilda
                ? `Junte-se à: ${item.guildaInfo?.nome || "Desconhecida"}`
                : item.mensagem;
              iconeFallback = "shield";
            } else if (isRaid) {
              titulo = "Sistema de Raid";
              subTitulo = item.mensagem;
              iconeFallback = "shield-half";
            } else if (isEvento) {
              titulo = "Evento";
              subTitulo = item.mensagem;
              iconeFallback = "calendar";
            } else if (isSistema) {
              titulo = "Sistema";
              subTitulo = item.mensagem;
              iconeFallback = "settings";
            } else if (isBuild) {
              titulo = "Build Pública";
              subTitulo = item.mensagem;
              iconeFallback = "construct";
            }

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => abrirNotificacao(item)}
                style={[
                  estilos.cardNotificacao,
                  item.lida &&
                    !isSolicitacao &&
                    !isConviteGuilda &&
                    !isPedidoGuilda &&
                    estilos.cardLida,
                ]}
              >
                <View style={estilos.infoUsuario}>
                  <View style={estilos.avatar}>
                    {fotoAvatar ? (
                      <Image
                        source={{
                          uri: fotoAvatar,
                        }}
                        style={estilos.imgAvatar}
                      />
                    ) : (
                      <Ionicons
                        name={iconeFallback as any}
                        size={24}
                        color="#FFF"
                      />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={estilos.nick} numberOfLines={1}>
                      {titulo}
                    </Text>
                    <Text style={estilos.subtitulo}>{subTitulo}</Text>
                  </View>
                </View>

                {isSolicitacao && (
                  <View style={estilos.acoes}>
                    <TouchableOpacity
                      style={estilos.btnAceitar}
                      onPress={() =>
                        aceitarAmizade(item.id, item.referenciaId)
                      }
                    >
                      <Ionicons name="checkmark" size={20} color="#000" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={estilos.btnRecusar}
                      onPress={() =>
                        recusarAmizade(item.id, item.referenciaId)
                      }
                    >
                      <Ionicons name="close" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
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
  fundo: {
    flex: 1,
  },
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
  headerTitulo: {
    color: "#E8D5A3",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  centralizar: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  cardLida: {
    opacity: 0.6,
  },
  infoUsuario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
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
  imgAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  nick: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  subtitulo: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  acoes: {
    flexDirection: "row",
    gap: 10,
  },
  btnAceitar: {
    backgroundColor: "#E8D5A3",
    padding: 8,
    borderRadius: 20,
  },
  btnRecusar: {
    backgroundColor: "#444",
    padding: 8,
    borderRadius: 20,
  },
  msgVazia: {
    color: "#666",
    textAlign: "center",
    marginTop: 50,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});