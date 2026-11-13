import { Avatar, Botao, BotaoIcone, Carregando, EstadoVazio, Selo, Tela, TituloSecao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, raios, tipo } from "@/theme/tema";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
  const [relacionamento, setRelacionamento] = useState<"NENHUM" | "AMIGOS" | "ENVIADO" | "RECEBIDO">("NENHUM");
  const [carregando, setCarregando] = useState(true);
  const [processandoAcao, setProcessandoAcao] = useState(false);
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

      if (user?.id) {
        const [amizadesRes, recebidosRes, enviadosRes] = await Promise.all([
          api.get(`/amizades/usuario/${user.id}`),
          api.get(`/amizades/usuario/${user.id}/pendentes`),
          api.get(`/amizades/usuario/${user.id}/enviadas`)
        ]);

        const todasAmizades = [
          ...amizadesRes.data,
          ...recebidosRes.data,
          ...enviadosRes.data
        ];

        const amizade = todasAmizades.find(
          (amz: any) =>
            (amz.solicitante.id === user.id && amz.destinatario.id === idFinal) ||
            (amz.solicitante.id === idFinal && amz.destinatario.id === user.id),
        );

        if (amizade) {
          setAmizadeId(amizade.id);
          if (amizade.status === "ACEITO") {
            setRelacionamento("AMIGOS");
          } else if (amizade.status === "PENDENTE") {
            if (amizade.solicitante.id === user.id) {
              setRelacionamento("ENVIADO");
            } else {
              setRelacionamento("RECEBIDO");
            }
          }
        } else {
          setRelacionamento("NENHUM");
          setAmizadeId(null);
        }
      }

      await carregarFavoritos();
    } catch (err) {
      console.log(err);
    } finally {
      setCarregando(false);
    }
  };

  const carregarFavoritos = async () => {
    setCarregandoFavoritos(true);
    try {
      const response = await api.get(`/jogos_favoritos/usuario/${idFinal}`);
      const jogosFav = response.data.map((fav: any) => fav.jogo);
      setFavoritosJogos(jogosFav);
    } catch (error) {
      console.log(error);
    } finally {
      setCarregandoFavoritos(false);
    }
  };

  const adicionarAmigo = async () => {
    setProcessandoAcao(true);
    try {
      await api.post(`/amizades?destinatarioId=${idFinal}`, {}, {
        headers: {
          ...api.defaults.headers.common,
          "X-Usuario-Id": user?.id
        }
      });
      setRelacionamento("ENVIADO");
      Alert.alert("Sucesso", "Pedido de amizade enviado!");
    } catch (error: any) {
      Alert.alert("Erro", error?.response?.data?.message || "Erro ao enviar pedido.");
    } finally {
      setProcessandoAcao(false);
    }
  };

  const removerAmizade = async () => {
    if (!amizadeId) return;

    Alert.alert("Confirmar", "Deseja desfazer a amizade?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desfazer",
        style: "destructive",
        onPress: async () => {
          setProcessandoAcao(true);
          try {
            await api.delete(`/amizades/${amizadeId}`, {
              headers: {
                ...api.defaults.headers.common,
                "X-Usuario-Id": user?.id
              },
            });
            setAmizadeId(null);
            setRelacionamento("NENHUM");
            await carregarDados();
          } catch (error) {
            Alert.alert("Erro", "Falha ao desfazer amizade.");
          } finally {
            setProcessandoAcao(false);
          }
        },
      },
    ]);
  };

  if (carregando) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  if (!usuario) {
    return (
      <Tela>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EstadoVazio icone="help-circle-outline" texto="Usuário não encontrado" />
        </View>
      </Tela>
    );
  }

  const isOutroUsuario = user?.id !== idFinal;

  return (
    <Tela>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }}
      >
        <BotaoIcone icone="chevron-back" onPress={() => router.back()} />

        <View style={estilos.avatarContainer}>
          <Avatar uri={usuario.fotoPerfil} tamanho={116} destaque />
          <Text style={estilos.nome} numberOfLines={1}>{usuario.nick.toUpperCase()}</Text>
          {relacionamento === "AMIGOS" && <Selo texto="Seu amigo" icone="heart" tom="musgo" />}
        </View>

        <View style={estilos.bioBox}>
          <Text style={estilos.bioTitulo}>Bio</Text>
          <Text style={estilos.bioTexto}>{usuario.bio || "Sem bio."}</Text>
        </View>

        {isOutroUsuario && (
          <View style={estilos.botoesContainer}>
            {relacionamento === "AMIGOS" && (
              <Botao
                titulo="Desfazer amizade"
                icone="trash-outline"
                variante="perigo"
                onPress={removerAmizade}
                carregando={processandoAcao}
              />
            )}
            {relacionamento === "NENHUM" && (
              <Botao
                titulo="Adicionar Amigo"
                icone="person-add"
                onPress={adicionarAmigo}
                carregando={processandoAcao}
              />
            )}
            {relacionamento === "ENVIADO" && (
              <Botao titulo="Pedido Enviado" icone="time-outline" variante="secundario" disabled />
            )}
            {relacionamento === "RECEBIDO" && (
              <Botao
                titulo="Responda na aba de Pedidos"
                icone="alert-circle-outline"
                variante="secundario"
                disabled
              />
            )}
          </View>
        )}

        <TituloSecao titulo="Amigos" style={{ marginTop: 28 }} />
        {amigos.length === 0 ? (
          <EstadoVazio icone="people-outline" texto="Nenhum amigo adicionado" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {amigos.map((a) => (
              <TouchableOpacity key={a.id} style={estilos.itemAmigo} activeOpacity={0.7} onPress={() => { if (a.id !== idFinal) router.push(`/detalhes/usuario/${a.id}`); }}>
                <Avatar uri={a.fotoPerfil} tamanho={54} />
                <Text style={estilos.nomeAmigo} numberOfLines={1}>{a.nick}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TituloSecao titulo="Jogos favoritos" style={{ marginTop: 28 }} />
        {carregandoFavoritos ? <ActivityIndicator color={cores.ouro} /> : favoritosJogos.length === 0 ? (
          <EstadoVazio icone="game-controller-outline" texto="Nenhum jogo favorito" />
        ) : (
          <View style={estilos.favoritos}>
            {favoritosJogos.map((jogo) => (
              <View key={jogo.id} style={estilos.jogoFavItem}>
                <Avatar uri={jogo.capa} tamanho={72} icone="game-controller" quadrado />
                <Text style={estilos.jogoFavNome} numberOfLines={2}>{jogo.nome.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  avatarContainer: { alignItems: "center", marginTop: 8, gap: 12 },
  nome: { ...tipo.display, fontSize: 24 },
  bioBox: {
    backgroundColor: cores.pergaminho,
    borderRadius: raios.m,
    borderWidth: 1,
    borderColor: cores.ouroEscuro,
    padding: 16,
    marginTop: 22,
  },
  bioTitulo: {
    fontFamily: fontes.titulo,
    color: cores.madeira600,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  bioTexto: { fontFamily: fontes.corpo, color: cores.tinta, fontSize: 17, lineHeight: 23 },
  botoesContainer: { marginTop: 16 },
  itemAmigo: { alignItems: "center", marginRight: 14, width: 68, gap: 6 },
  nomeAmigo: { ...tipo.suave, color: cores.texto, fontSize: 13, textAlign: "center" },
  favoritos: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  jogoFavItem: { alignItems: "center", width: 76, gap: 6 },
  jogoFavNome: {
    fontFamily: fontes.titulo,
    color: cores.pergaminho,
    fontSize: 9,
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
