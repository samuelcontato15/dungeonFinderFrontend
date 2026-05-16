import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function PerfilPublico() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const idFinal = Array.isArray(id) ? id[0] : id;

  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null);
  const [amigos, setAmigos] = useState<AmigoPublico[]>([]);
  const [carregando, setCarregando] = useState(true);

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
          amz.solicitante.id === idFinal ? amz.destinatario : amz.solicitante
        );
      setAmigos(listaFormatada);
    } catch (err) {
      console.log("Erro ao carregar perfil público:", err);
    } finally {
      setCarregando(false);
    }
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
        <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          <Text style={estilos.btnVoltarTxt}>Voltar</Text>
        </TouchableOpacity>

        {/* AVATAR E NOME */}
        <View style={estilos.avatarContainer}>
          {usuario.fotoPerfil ? (
            <Image source={{ uri: usuario.fotoPerfil }} style={estilos.avatar} />
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

  secaoTitulo: {
    color: "#E8D5A3",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
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
});