import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const res = await api.get("/notificacoes");
      const lista = res.data;

      const enriquecidas = await Promise.all(
        lista.map(async (n: any) => {
          if (n.tipo === "SOLICITACAO_AMIZADE" && n.referenciaId && !n.lida) {
            try {
              const amz = await api.get(`/amizades/${n.referenciaId}`);
              return { ...n, solicitante: amz.data.solicitante };
            } catch {
              return n;
            }
          }
          return n;
        })
      );

      setNotificacoes(enriquecidas);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as notificações.");
    }
  };

  const aceitarAmizade = async (notificacaoId: string, amizadeId: string) => {
    try {
      await api.put(`/amizades/${amizadeId}/responder?status=ACEITO`);
      await api.put(`/notificacoes/${notificacaoId}/lida`);
      Alert.alert("Sucesso", "Convite aceito!");
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Não foi possível aceitar o convite.");
    }
  };

  const recusarAmizade = async (notificacaoId: string, amizadeId: string) => {
    try {
      await api.put(`/amizades/${amizadeId}/responder?status=RECUSADO`);
      await api.delete(`/notificacoes/${notificacaoId}`);
      Alert.alert("Aviso", "Convite recusado.");
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Erro ao processar a ação.");
    }
  };

  const deletarNotificacao = async (notificacaoId: string) => {
    try {
      await api.delete(`/notificacoes/${notificacaoId}`);
      carregarNotificacoes();
    } catch {
      Alert.alert("Erro", "Não foi possível deletar a notificação.");
    }
  };

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
          { paddingTop: insets.top + 10 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#E8D5A3"
          />
        </TouchableOpacity>

        <Text style={estilos.headerTitulo}>
          NOTIFICAÇÕES
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={estilos.container}>
        {notificacoes.length > 0 ? (
          notificacoes.map((item) => {
            const isSolicitacao = item.tipo === "SOLICITACAO_AMIZADE" && !item.lida;
            return (
              <View key={item.id} style={[estilos.cardNotificacao, item.lida && { opacity: 0.5 }]}>
                <View style={estilos.infoUsuario}>
                  <View style={estilos.avatar}>
                    {item.solicitante?.fotoPerfil ? (
                      <Image source={{ uri: item.solicitante.fotoPerfil }} style={estilos.imgAvatar} />
                    ) : (
                      <Ionicons name="person" size={24} color="#FFF" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.nick} numberOfLines={1}>
                      {item.solicitante?.nick || "Usuário"}
                    </Text>
                    <Text style={estilos.subtitulo}>
                      {isSolicitacao ? "Enviou um convite de amizade" : item.mensagem}
                    </Text>
                  </View>
                </View>

                {isSolicitacao && (
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

                {item.lida && (
                  <TouchableOpacity
                    style={estilos.btnDeletar}
                    onPress={() => deletarNotificacao(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <Text style={estilos.msgVazia}>
            Nenhuma notificação nova.
          </Text>
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
  },

  nick: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  subtitulo: {
    color: "#999",
    fontSize: 12,
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

  btnDeletar: {
    backgroundColor: "#B00020",
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