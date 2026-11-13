import BarraNavegacao from "@/components/BarraNavegacao";
import { Avatar, BotaoIcone, Cabecalho, Carregando, EstadoVazio, Tela, estiloCartao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, tipo } from "@/theme/tema";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
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
      <Tela>
        <Cabecalho titulo="Notificações" />
        <Carregando />
      </Tela>
    );
  }

  return (
    <Tela>
      <Cabecalho
        titulo="Notificações"
        subtitulo="Recados deixados no mural da taverna"
      />

      <ScrollView
        contentContainerStyle={estilos.container}
        showsVerticalScrollIndicator={false}
      >
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

            const apagada =
              item.lida &&
              !isSolicitacao &&
              !isConviteGuilda &&
              !isPedidoGuilda;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => abrirNotificacao(item)}
                style={[
                  estiloCartao.base,
                  estiloCartao.linha,
                  !item.lida && estilos.cardNova,
                  apagada && estilos.cardLida,
                ]}
              >
                <Avatar uri={fotoAvatar} tamanho={50} icone={iconeFallback as any} />

                <View style={{ flex: 1 }}>
                  <View style={estilos.linhaTitulo}>
                    <Text style={estilos.nick} numberOfLines={1}>
                      {titulo}
                    </Text>
                    {!item.lida && <View style={estilos.pontoNovo} />}
                  </View>
                  <Text style={tipo.suave}>{subTitulo}</Text>
                </View>

                {isSolicitacao && (
                  <View style={estilos.acoes}>
                    <BotaoIcone
                      icone="checkmark"
                      cor={cores.musgoClaro}
                      tamanho={38}
                      style={estilos.btnAceitar}
                      onPress={() =>
                        aceitarAmizade(item.id, item.referenciaId)
                      }
                    />
                    <BotaoIcone
                      icone="close"
                      cor={cores.vinhoClaro}
                      tamanho={38}
                      style={estilos.btnRecusar}
                      onPress={() =>
                        recusarAmizade(item.id, item.referenciaId)
                      }
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <EstadoVazio
            icone="notifications-off-outline"
            texto="Nenhuma notificação nova."
            dica="Quando algo acontecer no reino, o aviso aparece aqui."
          />
        )}
      </ScrollView>

      <View style={estilos.footer}>
        <BarraNavegacao />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 130,
    gap: 10,
  },
  cardNova: { borderColor: cores.bordaForte },
  cardLida: { opacity: 0.55 },
  linhaTitulo: { flexDirection: "row", alignItems: "center", gap: 8 },
  nick: {
    fontFamily: fontes.titulo,
    color: cores.pergaminho,
    fontSize: 14,
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  pontoNovo: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: cores.ouro,
  },
  acoes: { flexDirection: "row", gap: 8 },
  btnAceitar: {
    backgroundColor: "rgba(78,122,58,0.3)",
    borderColor: "rgba(143,203,107,0.5)",
  },
  btnRecusar: {
    backgroundColor: "rgba(142,42,42,0.3)",
    borderColor: "rgba(224,98,90,0.5)",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
