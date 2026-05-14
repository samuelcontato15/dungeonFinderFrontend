import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useRouter } from "expo-router";
import BarraNavegacao from "@/components/BarraNavegacao";

export default function Notificacoes() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();

  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = async () => {
    try {
      const res = await api.get(
        `/amizades/usuario/${user?.id}/pendentes`
      );

      const apenasRecebidas = res.data.filter((amz: any) => {
        const idDestinatario =
          amz.destinatario?.id || amz.destinatarioId;

        const isParaMim = idDestinatario === user?.id;

        const isPendente =
          amz.status?.toUpperCase() === "PENDENTE";

        return isParaMim && isPendente;
      });

      setSolicitacoes(apenasRecebidas);

    } catch (err: any) {
      console.log("ERRO COMPLETO:", err);

      if (err.response) {
        console.log("Status do Erro:", err.response.status);
        console.log("Detalhes:", JSON.stringify(err.response.data));
      }

      Alert.alert(
        "Erro",
        "Não foi possível carregar as notificações."
      );
    }
  };

  const aceitarAmizade = async (amizadeId: string) => {
    try {
      await api.put(
        `/amizades/${amizadeId}/aceitar?usuarioId=${user?.id}`
      );

      Alert.alert("Sucesso", "Convite aceito!");

      carregarSolicitacoes();

    } catch (err) {
      console.log("Erro ao aceitar:", err);

      Alert.alert(
        "Erro",
        "Não foi possível aceitar o convite."
      );
    }
  };

  const recusarAmizade = async (amizadeId: string) => {
    try {
      await api.delete(`/amizades/${amizadeId}`);

      Alert.alert("Aviso", "Convite recusado.");

      carregarSolicitacoes();

    } catch (err) {
      console.log("Erro ao recusar:", err);

      Alert.alert(
        "Erro",
        "Erro ao processar a ação."
      );
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
        {solicitacoes.length > 0 ? (
          solicitacoes.map((item) => (
            <View
              key={item.id}
              style={estilos.cardNotificacao}
            >
              <View style={estilos.infoUsuario}>
                <View style={estilos.avatar}>
                  {item.solicitante?.fotoPerfil ? (
                    <Image
                      source={{
                        uri: item.solicitante.fotoPerfil,
                      }}
                      style={estilos.imgAvatar}
                    />
                  ) : (
                    <Ionicons
                      name="person"
                      size={24}
                      color="#FFF"
                    />
                  )}
                </View>

                <View>
                  <Text style={estilos.nick}>
                    {item.solicitante?.nick || "Usuário"}
                  </Text>

                  <Text style={estilos.subtitulo}>
                    Enviou um convite de amizade
                  </Text>
                </View>
              </View>

              <View style={estilos.acoes}>
                <TouchableOpacity
                  style={estilos.btnAceitar}
                  onPress={() => aceitarAmizade(item.id)}
                >
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={estilos.btnRecusar}
                  onPress={() => recusarAmizade(item.id)}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  },

  infoUsuario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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