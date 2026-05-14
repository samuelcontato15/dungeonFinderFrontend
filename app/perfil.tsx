import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dadosJogos } from "../src/data/dadosJogos";

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();

  const [amigos, setAmigos] = useState<any[]>([]);
  const [editandoBio, setEditandoBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || "Olá, esse é meu perfil.");
  const [foto, setFoto] = useState<string | null>(user?.fotoPerfil || null);

  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [editandoFavoritos, setEditandoFavoritos] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, [user]);

  const carregarPerfil = async () => {
    if (!user?.id) return;

    try {
      const amigosResponse = await api.get(`/amizades/usuario/${user.id}`);

      const listaFormatada = amigosResponse.data.map((amz: any) =>
        amz.solicitante.id === user.id ? amz.destinatario : amz.solicitante
      );

      setAmigos(listaFormatada);

      const perfilResponse = await api.get(`/usuarios/${user.id}`);

      const userData = perfilResponse.data;

      setBio(userData.bio || "Olá, esse é meu perfil.");
      setFoto(userData.fotoPerfil || null);

      if (userData.favoritos) {
        try {
          setFavoritos(JSON.parse(userData.favoritos));
        } catch {
          setFavoritos([]);
        }
      }
    } catch (err) {
      console.log("Erro carregar perfil:", err);
    }
  };

  const salvarPerfil = async (
    novaFoto = foto,
    novaBio = bio,
    novosFavoritos = favoritos
  ) => {
    if (!user?.id) return;

    try {
      const dadosAtualizados = {
        nick: user.usuario,
        bio: novaBio,
        fotoPerfil: novaFoto,
        favoritos: JSON.stringify(novosFavoritos),
      };

      await api.put(`/usuarios/${user.id}`, dadosAtualizados);

      if (updateUser) {
        updateUser({
          ...user,
          bio: novaBio,
          fotoPerfil: novaFoto,
        });
      }

      await carregarPerfil();
    } catch (error) {
      console.log("Erro ao salvar perfil:", error);
    }
  };

  const toggleFavorito = (id: string) => {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter((f) => f !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  const escolherImagem = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert("Permissão necessária");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

      setFoto(base64Image);

      await salvarPerfil(base64Image, bio, favoritos);
    } else if (!result.canceled) {
      setFoto(result.assets[0].uri);

      await salvarPerfil(result.assets[0].uri, bio, favoritos);
    }
  };

  const removerImagem = async () => {
    setFoto(null);

    await salvarPerfil(null, bio, favoritos);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <ImageBackground
      source={require("../assets/fundoperfil.png")}
      style={estilos.fundo}
    >
      <View style={estilos.overlay} />

      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
      >
        <View style={estilos.header}>
          <TouchableOpacity
            style={estilos.botao}
            onPress={() => router.push("/config")}
          >
            <Text style={estilos.botaoTxt}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botao} onPress={handleLogout}>
            <Text style={estilos.botaoTxt}>Log-out</Text>
          </TouchableOpacity>
        </View>

        <View style={estilos.perfil}>
          <View style={{ alignItems: "center" }}>
            <View style={{ position: "relative" }}>
              <TouchableOpacity onPress={escolherImagem}>
                {foto ? (
                  <Image source={{ uri: foto }} style={estilos.avatar} />
                ) : (
                  <View
                    style={[
                      estilos.avatar,
                      {
                        backgroundColor: "#D4AF37",
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons name="person" size={40} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={estilos.lapis}
                onPress={escolherImagem}
              >
                <Ionicons name="pencil" size={14} color="#000" />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 5,
              }}
            >
              <TouchableOpacity onPress={escolherImagem}>
                <Text style={estilos.btnMini}>Upload</Text>
              </TouchableOpacity>

              {foto && (
                <TouchableOpacity onPress={removerImagem}>
                  <Text style={estilos.btnMini}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={estilos.nome}>
              {user?.usuario?.toUpperCase() || "USUÁRIO"}
            </Text>

            <View style={estilos.bioBox}>
              <View style={estilos.bioHeader}>
                <Text style={estilos.bioTitulo}>Bio</Text>

                <TouchableOpacity
                  onPress={() => setEditandoBio(!editandoBio)}
                >
                  <Ionicons name="pencil" size={16} color="#000" />
                </TouchableOpacity>
              </View>

              {editandoBio ? (
                <>
                  <TextInput
                    style={estilos.inputBio}
                    value={bio}
                    onChangeText={setBio}
                    onEndEditing={() =>
                      salvarPerfil(foto, bio, favoritos)
                    }
                    multiline
                    placeholder="Escreva sua bio aqui..."
                    maxLength={500}
                  />

                  <Text style={estilos.contadorCaracteres}>
                    {bio.length}/500
                  </Text>
                </>
              ) : (
                <Text style={estilos.bioTexto}>{bio}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={estilos.headerAmigos}>
          <Text style={estilos.titulo}>AMIGOS</Text>

          <TouchableOpacity
            style={estilos.botaoMais}
            onPress={() => router.push("/amigos")}
          >
            <Ionicons name="add" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {amigos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {amigos.map((amigo) => (
              <View key={amigo.id} style={estilos.itemAmigo}>
                <View style={estilos.avatarAmigo}>
                  {amigo.fotoPerfil ? (
                    <Image
                      source={{ uri: amigo.fotoPerfil }}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#D4AF37",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="person" size={20} color="#FFF" />
                    </View>
                  )}
                </View>

                <Text style={estilos.nomeAmigo} numberOfLines={1}>
                  {amigo.nick}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={estilos.msgVazia}>Nenhum amigo encontrado.</Text>
        )}

        <Text style={[estilos.titulo, { marginTop: 10 }]}>
          RPG'S FAVORITOS
        </Text>

        <View style={estilos.favoritos}>
          {favoritos.map((id) => {
            const jogo = dadosJogos.find((j) => j.id === id);

            return jogo ? (
              <View
                key={id}
                style={{
                  position: "relative",
                }}
              >
                <Image source={jogo.fonte} style={estilos.img} />

                {editandoFavoritos && (
                  <TouchableOpacity
                    style={estilos.remover}
                    onPress={async () => {
                      toggleFavorito(id);

                      const novosFavoritos = favoritos.filter(
                        (f) => f !== id
                      );

                      await salvarPerfil(
                        foto,
                        bio,
                        novosFavoritos
                      );
                    }}
                  >
                    <Ionicons name="close" size={14} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            ) : null;
          })}
        </View>

        <TouchableOpacity
          onPress={() => setEditandoFavoritos(!editandoFavoritos)}
        >
          <Text style={estilos.editar}>
            {editandoFavoritos
              ? "Fechar edição"
              : "Editar favoritos"}
          </Text>
        </TouchableOpacity>

        {editandoFavoritos && (
          <View style={estilos.lista}>
            {dadosJogos.map((jogo) => {
              const ativo = favoritos.includes(jogo.id);

              return (
                <TouchableOpacity
                  key={jogo.id}
                  style={[
                    estilos.card,
                    ativo && {
                      borderColor: "gold",
                      borderWidth: 2,
                    },
                  ]}
                  onPress={async () => {
                    toggleFavorito(jogo.id);

                    const novosFavoritos = favoritos.includes(jogo.id)
                      ? favoritos.filter((f) => f !== jogo.id)
                      : [...favoritos, jogo.id];

                    await salvarPerfil(
                      foto,
                      bio,
                      novosFavoritos
                    );
                  }}
                >
                  <Image
                    source={jogo.fonte}
                    style={estilos.imgLista}
                  />

                  <Text style={estilos.nomeJogo}>{jogo.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  botao: {
    backgroundColor: "#666",
    padding: 8,
    borderRadius: 6,
  },

  botaoTxt: {
    color: "#FFF",
  },

  perfil: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },

  nome: {
    color: "#E8D5A3",
    fontSize: 20,
    marginBottom: 6,
  },

  bioBox: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
  },

  bioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  bioTitulo: {
    fontWeight: "bold",
  },

  bioTexto: {
    color: "#000",
  },

  inputBio: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },

  contadorCaracteres: {
    fontSize: 10,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#444",
  },

  lapis: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 5,
    borderRadius: 12,
  },

  btnMini: {
    color: "#FFF",
    fontSize: 12,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  titulo: {
    color: "#E8D5A3",
    fontSize: 16,
    marginBottom: 10,
  },

  favoritos: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },

  img: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },

  remover: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 2,
  },

  editar: {
    color: "#FFF",
    marginBottom: 15,
  },

  lista: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  card: {
    width: "30%",
    backgroundColor: "#222",
    padding: 5,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  imgLista: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },

  nomeJogo: {
    color: "#FFF",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },

  headerAmigos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  botaoMais: {
    backgroundColor: "#E8D5A3",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  itemAmigo: {
    alignItems: "center",
    marginRight: 15,
    width: 55,
  },

  avatarAmigo: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8D5A3",
    overflow: "hidden",
  },

  nomeAmigo: {
    color: "#FFF",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },

  msgVazia: {
    color: "#666",
    fontStyle: "italic",
    marginBottom: 20,
  },
});