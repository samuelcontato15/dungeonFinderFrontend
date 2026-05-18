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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type UsuarioPublico = {
  id: string;
  nick: string;
  fotoPerfil: string | null;
  bio: string | null;
};

type AmigoPublico = {
  id: string;
  nick: string;
  fotoPerfil: string | null;
};

type Jogo = {
  id: string;
  nome: string;
  slug: string;
  capa: string | null;
};

export default function PerfilPublico() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const idFinal = Array.isArray(id) ? id[0] : id;

  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null);
  const [amigos, setAmigos] = useState<AmigoPublico[]>([]);
  const [amizadeId, setAmizadeId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [removendo, setRemovendo] = useState(false);

  // Estado para os jogos favoritos do usuário visualizado
  const [favoritosJogos, setFavoritosJogos] = useState<Jogo[]>([]);
  const [carregandoFavoritos, setCarregandoFavoritos] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [idFinal]);

  const carregarDados = async () => {
    try {
      const [usuarioRes, amigosRes] = await Promise.all([
        api.get(`/usuarios/${idFinal}`),
        api.get(`/amizades/usuario/${idFinal}`),
      ]);

      setUsuario(usuarioRes.data);

      const listaFormatada = amigosRes.data
        .filter((amz: any) => amz.status === "ACEITO")
        .map((amz: any) =>
          amz.solicitante.id === idFinal ? amz.destinatario : amz.solicitante,
        );
      setAmigos(listaFormatada);

      // Verifica se o usuário logado é amigo do perfil visualizado
      if (user?.id) {
        const amizadesDoUsuario = await api.get(`/amizades/usuario/${user.id}`);
        const amizade = amizadesDoUsuario.data.find(
          (amz: any) =>
            amz.status === "ACEITO" &&
            ((amz.solicitante.id === user.id &&
              amz.destinatario.id === idFinal) ||
              (amz.solicitante.id === idFinal &&
                amz.destinatario.id === user.id)),
        );
        if (amizade) setAmizadeId(amizade.id);
      }

      // Carrega os jogos favoritos do usuário visualizado
      await carregarFavoritos();
    } catch (err) {
      console.log("Erro ao carregar perfil público:", err);
    } finally {
      setCarregando(false);
    }
  };

  const carregarFavoritos = async () => {
    setCarregandoFavoritos(true);
    try {
      const response = await api.get(`/jogos_favoritos/usuario/${idFinal}`);
      // Extrai a lista de jogos a partir dos objetos JogoFavorito
      const jogosFav = response.data.map((fav: any) => fav.jogo);
      setFavoritosJogos(jogosFav);
    } catch (error) {
      console.log("Erro ao carregar favoritos:", error);
    } finally {
      setCarregandoFavoritos(false);
    }
  };

  const removerAmizade = async () => {
    if (!amizadeId) return;

    Alert.alert(
      "Confirmar",
      `Deseja realmente desfazer a amizade com ${usuario?.nick}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desfazer amizade",
          style: "destructive",
          onPress: async () => {
            setRemovendo(true);
            try {
              await api.delete(`/amizades/${amizadeId}`, {
                headers: { "X-Usuario-Id": user?.id },
              });
              Alert.alert(
                "Amizade desfeita",
                "Você não é mais amigo dessa pessoa.",
              );
              setAmizadeId(null);
              // Recarrega os dados para atualizar a lista de amigos do perfil
              await carregarDados();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível desfazer a amizade.");
            } finally {
              setRemovendo(false);
            }
          },
        },
      ],
    );
  };

  if (carregando) {
    return (
      <View style={estilos.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={estilos.center}>
        <Text style={{ color: "#FFF" }}>Usuário não encontrado</Text>
      </View>
    );
  }

  const isAmigo = !!amizadeId;

  return (
    <ImageBackground
      source={require("../../../assets/fundoperfil.png")}
      style={estilos.fundo}
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: 40,
          paddingHorizontal: 20,
        }}
      >
        {/* VOLTAR */}
        <TouchableOpacity
          style={estilos.btnVoltar}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          <Text style={estilos.btnVoltarTxt}>Voltar</Text>
        </TouchableOpacity>

        {/* AVATAR E NOME */}
        <View style={estilos.avatarContainer}>
          {usuario.fotoPerfil ? (
            <Image
              source={{ uri: usuario.fotoPerfil }}
              style={estilos.avatar}
            />
          ) : (
            <View style={estilos.avatarFake}>
              <Ionicons name="person" size={50} color="#333" />
            </View>
          )}
          <Text style={estilos.nome}>{usuario.nick.toUpperCase()}</Text>
        </View>

        {/* BIO */}
        <View style={estilos.bioBox}>
          <Text style={estilos.bioTitulo}>Bio</Text>
          <Text style={estilos.bioTexto}>
            {usuario.bio || "Este usuário não tem bio."}
          </Text>
        </View>

        {/* BOTÃO DESFAZER AMIZADE (se for amigo) */}
        {isAmigo && (
          <TouchableOpacity
            style={estilos.botaoRemover}
            onPress={removerAmizade}
            disabled={removendo}
          >
            {removendo ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color="#FFF" />
                <Text style={estilos.txtBotaoRemover}>Desfazer amizade</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* AMIGOS */}
        <Text style={estilos.secaoTitulo}>AMIGOS</Text>
        {amigos.length === 0 ? (
          <Text style={estilos.msgVazia}>Nenhum amigo adicionado</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {amigos.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={estilos.itemAmigo}
                onPress={() => router.push(`/detalhes/usuario/${a.id}`)}
              >
                <View style={estilos.avatarAmigo}>
                  {a.fotoPerfil ? (
                    <Image
                      source={{ uri: a.fotoPerfil }}
                      style={{ width: 45, height: 45 }}
                    />
                  ) : (
                    <Ionicons name="person" size={22} color="#E8D5A3" />
                  )}
                </View>
                <Text style={estilos.nomeAmigo}>{a.nick}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* JOGOS FAVORITOS */}
        <Text style={estilos.secaoTitulo}>JOGOS FAVORITOS</Text>
        {carregandoFavoritos ? (
          <ActivityIndicator
            size="small"
            color="#D4AF37"
            style={{ marginVertical: 10 }}
          />
        ) : favoritosJogos.length === 0 ? (
          <Text style={estilos.msgVazia}>Nenhum jogo favorito adicionado</Text>
        ) : (
          <View style={estilos.favoritos}>
            {favoritosJogos.map((jogo) => (
              <View key={jogo.id} style={estilos.jogoFavItem}>
                {jogo.capa ? (
                  <Image source={{ uri: jogo.capa }} style={estilos.img} />
                ) : (
                  <View style={estilos.placeholderImg}>
                    <Ionicons
                      name="game-controller"
                      size={28}
                      color="#D4AF37"
                    />
                  </View>
                )}
                <Text style={estilos.jogoFavNome}>
                  {jogo.nome.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  btnVoltarTxt: {
    color: "#D4AF37",
    fontSize: 14,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#E8D5A3",
  },
  avatarFake: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  nome: {
    color: "#E8D5A3",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
    letterSpacing: 2,
  },
  bioBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  bioTitulo: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    fontSize: 14,
  },
  bioTexto: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  botaoRemover: {
    flexDirection: "row",
    backgroundColor: "#B00020",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  txtBotaoRemover: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  secaoTitulo: {
    color: "#E8D5A3",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  itemAmigo: {
    alignItems: "center",
    marginRight: 15,
    width: 65,
  },
  avatarAmigo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8D5A3",
  },
  nomeAmigo: {
    color: "#FFF",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  msgVazia: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
    fontSize: 13,
  },
  // Estilos para os jogos favoritos (copiados do perfil.tsx)
  favoritos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  jogoFavItem: {
    alignItems: "center",
    width: 65,
  },
  jogoFavNome: {
    color: "#FFF",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  img: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
});
