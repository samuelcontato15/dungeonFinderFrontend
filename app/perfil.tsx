import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dadosJogos } from "../src/data/dadosJogos";

const STORAGE_FAVORITOS = "@DungeonFinder:favoritos";

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
  const [salvando, setSalvando] = useState(false);
  const [temAlteracoes, setTemAlteracoes] = useState(false);

  useEffect(() => {
    carregarPerfil();
    carregarFavoritosLocais();
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
    } catch (err) {
      console.log("Erro carregar perfil:", err);
    }
  };

  const carregarFavoritosLocais = async () => {
    try {
      const favoritosSalvos = await AsyncStorage.getItem(STORAGE_FAVORITOS);
      if (favoritosSalvos) {
        setFavoritos(JSON.parse(favoritosSalvos));
      } else {
        setFavoritos(["j1", "j4"]);
      }
    } catch (error) {
      console.log("Erro ao carregar favoritos:", error);
      setFavoritos(["j1", "j4"]);
    }
  };

  const salvarFavoritosLocais = async (novosFavoritos: string[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_FAVORITOS,
        JSON.stringify(novosFavoritos)
      );
    } catch (error) {
      console.log("Erro ao salvar favoritos:", error);
    }
  };

  const salvarPerfil = async () => {
    if (!user?.id) return;

    setSalvando(true);

    try {
      const dadosAtualizados = {
        nick: user.usuario,
        bio,
        fotoPerfil: foto,
      };

      const response = await api.put(`/usuarios/${user.id}`, dadosAtualizados);

      if (response.status === 200) {
        updateUser?.({
          ...user,
          bio,
          fotoPerfil: foto,
        });

        await salvarFavoritosLocais(favoritos);

        Alert.alert("Sucesso", "Perfil atualizado!");
        setEditandoBio(false);
        setEditandoFavoritos(false);
        setTemAlteracoes(false);
      }
    } catch (error: any) {
      Alert.alert("Erro", error.response?.data?.message);
    } finally {
      setSalvando(false);
    }
  };

  const toggleFavorito = (id: string) => {
    let novos = favoritos.includes(id)
      ? favoritos.filter((f) => f !== id)
      : [...favoritos, id];

    setFavoritos(novos);
    setTemAlteracoes(true);
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

    if (!result.canceled) {
      const img = result.assets[0];
      setFoto(img.base64 ? `data:image/jpeg;base64,${img.base64}` : img.uri);
      setTemAlteracoes(true);
    }
  };

  const removerImagem = () => {
    setFoto(null);
    setTemAlteracoes(true);
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
        {/* HEADER CORRIGIDO */}
        <View style={estilos.header}>
          <TouchableOpacity
            style={estilos.botao}
            onPress={() => router.push("/config")}
          >
            <Text style={estilos.botaoTxt}>⚙️ Configurações</Text>
          </TouchableOpacity>

          {user?.isAdmin && (
            <TouchableOpacity
              style={estilos.botaoAdmin}
              onPress={() => router.push("/admin")}
            >
              <Text style={estilos.botaoAdminTxt}>👑 Admin</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={estilos.botao} onPress={handleLogout}>
            <Text style={estilos.botaoTxt}>🚪 Sair</Text>
          </TouchableOpacity>
        </View>

        {/* PERFIL */}
        <View style={estilos.perfil}>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={escolherImagem}>
              {foto ? (
                <Image source={{ uri: foto }} style={estilos.avatar} />
              ) : (
                <View style={estilos.avatarFake}>
                  <Text style={{ fontSize: 40 }}>👤</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={escolherImagem}>
              <Text style={estilos.btnMini}>✏️ Upload</Text>
            </TouchableOpacity>

            {foto && (
              <TouchableOpacity onPress={removerImagem}>
                <Text style={estilos.btnMini}>❌ Remover</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={estilos.nome}>
              {user?.usuario?.toUpperCase() || "USUÁRIO"}
            </Text>

            <View style={estilos.bioBox}>
              <View style={estilos.bioHeader}>
                <Text style={estilos.bioTitulo}>Bio</Text>
                <TouchableOpacity onPress={() => setEditandoBio(!editandoBio)}>
                  <Text>✏️</Text>
                </TouchableOpacity>
              </View>

              {editandoBio ? (
                <TextInput
                  style={estilos.inputBio}
                  value={bio}
                  onChangeText={(t) => {
                    setBio(t);
                    setTemAlteracoes(true);
                  }}
                  multiline
                />
              ) : (
                <Text>{bio}</Text>
              )}
            </View>
          </View>
        </View>

        {/* SALVAR */}
        {temAlteracoes && (
          <TouchableOpacity
            style={estilos.botaoSalvar}
            onPress={salvarPerfil}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={estilos.botaoSalvarTxt}>💾 Salvar</Text>
            )}
          </TouchableOpacity>
        )}

        {/* AMIGOS */}
        <Text style={estilos.titulo}>👥 AMIGOS</Text>

        {amigos.length === 0 ? (
          <Text style={estilos.msgVazia}>Nenhum amigo</Text>
        ) : (
          <ScrollView horizontal>
            {amigos.map((a) => (
              <View key={a.id} style={estilos.itemAmigo}>
                <View style={estilos.avatarAmigo}>
                  {a.fotoPerfil ? (
                    <Image source={{ uri: a.fotoPerfil }} style={{ width: 45, height: 45 }} />
                  ) : (
                    <Text>👤</Text>
                  )}
                </View>
                <Text style={estilos.nomeAmigo}>{a.nick}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* FAVORITOS */}
        <Text style={estilos.titulo}>🎮 FAVORITOS</Text>

        <View style={estilos.favoritos}>
          {favoritos.map((id) => {
            const jogo = dadosJogos.find((j: any) => j.id === id);
            if (!jogo) return null;

            return (
              <View key={id}>
                <Image source={jogo.fundo} style={estilos.img} />
                {editandoFavoritos && (
                  <TouchableOpacity onPress={() => toggleFavorito(id)}>
                    <Text>❌</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => setEditandoFavoritos(!editandoFavoritos)}
        >
          <Text style={estilos.editar}>
            {editandoFavoritos ? "Fechar" : "Editar favoritos"}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },

  botao: {
    backgroundColor: "#666",
    padding: 8,
    borderRadius: 6,
  },

  botaoTxt: {
    color: "#FFF",
    fontSize: 12,
  },

  botaoAdmin: {
    backgroundColor: "#D4AF37",
    padding: 8,
    borderRadius: 6,
  },

  botaoAdminTxt: {
    color: "#000",
    fontWeight: "bold",
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

  inputBio: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#444",
  },

  avatarFake: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },

  btnMini: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 4,
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
    marginTop: 10,
  },

  favoritos: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },

  img: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },

  editar: {
    color: "#FFF",
    marginBottom: 15,
  },

  itemAmigo: {
    alignItems: "center",
    marginRight: 15,
    width: 60,
  },

  avatarAmigo: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8D5A3",
  },

  nomeAmigo: {
    color: "#FFF",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },

  msgVazia: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
  },

  botaoSalvar: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  botaoSalvarTxt: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 6,
  },
});