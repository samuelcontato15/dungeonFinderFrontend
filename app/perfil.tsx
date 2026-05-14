import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
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

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();

  const [amigos, setAmigos] = useState<any[]>([]);
  const [salvando, setSalvando] = useState(false);

  const [editandoBio, setEditandoBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || "Olá, esse é meu perfil.");

  const [foto, setFoto] = useState<string | null>(user?.fotoPerfil || null);
  const [corAvatar, setCorAvatar] = useState("#D4AF37");
  const cores = ["#D4AF37", "#FF6B6B", "#4ECDC4", "#1A535C", "#3A86FF"];

  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [editandoFavoritos, setEditandoFavoritos] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api
        .get(`/amizades/usuario/${user.id}`)
        .then((res) => {
          const listaFormatada = res.data.map((amz: any) =>
            amz.solicitante.id === user.id ? amz.destinatario : amz.solicitante,
          );
          setAmigos(listaFormatada);
        })
        .catch((err) => console.log("Erro amigos:", err));

      api
        .get(`/usuarios/${user.id}`)
        .then((res) => {
          const userData = res.data;
          setBio(userData.bio || "Olá, esse é meu perfil.");
          setFoto(userData.fotoPerfil || null);

          if (userData.favoritos) {
            try {
              setFavoritos(JSON.parse(userData.favoritos));
            } catch (e) {
              setFavoritos([]);
            }
          }
        })
        .catch((err) => console.log("Erro carregar perfil:", err));
    }
  }, [user]);

  const toggleFavorito = (id: string) => {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter((f) => f !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  const escolherImagem = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permissão necessária");

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setFoto(base64Image);
    } else if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const removerImagem = () => setFoto(null);

  const salvarPerfil = async () => {
    if (!user?.id) {
      Alert.alert("Erro", "Usuário não identificado");
      return;
    }

    setSalvando(true);

    try {
      const dadosAtualizados = {
        nick: user.usuario,
        bio: bio,
        fotoPerfil: foto,
        favoritos: JSON.stringify(favoritos),
        corAvatar: corAvatar,
      };

      const response = await api.put(`/usuarios/${user.id}`, dadosAtualizados);

      if (response.status === 200) {
        if (updateUser) {
          updateUser({
            ...user,
            bio: bio,
            fotoPerfil: foto,
          });
        }

        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
        setEditandoBio(false);
        setEditandoFavoritos(false);
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message ||
          "Não foi possível salvar as alterações",
      );
    } finally {
      setSalvando(false);
    }
  };

  // Verificar se há alterações pendentes
  const temAlteracoes = () => {
    return editandoBio || editandoFavoritos;
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
        {/* Header com botões de Config e Logout */}
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

        {/* Botão Salvar (aparece apenas quando há edição ativa) */}
        {temAlteracoes() && (
          <TouchableOpacity
            style={estilos.botaoSalvar}
            onPress={salvarPerfil}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFF" />
                <Text style={estilos.botaoSalvarTxt}>
                  Salvar todas as alterações
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Perfil */}
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
                        backgroundColor: corAvatar,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons name="person" size={40} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={estilos.lapis} onPress={escolherImagem}>
                <Ionicons name="pencil" size={14} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
              <TouchableOpacity onPress={escolherImagem}>
                <Text style={estilos.btnMini}>Upload</Text>
              </TouchableOpacity>
              {foto && (
                <TouchableOpacity onPress={removerImagem}>
                  <Text style={estilos.btnMini}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              {cores.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCorAvatar(c)}
                  style={[
                    estilos.cor,
                    { backgroundColor: c },
                    corAvatar === c && { borderWidth: 2, borderColor: "#FFF" },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={estilos.nome}>
              {user?.usuario?.toUpperCase() || "USUÁRIO"}
            </Text>

            <View style={estilos.bioBox}>
              <View style={estilos.bioHeader}>
                <Text style={estilos.bioTitulo}>Bio</Text>
                <TouchableOpacity onPress={() => setEditandoBio(!editandoBio)}>
                  <Ionicons name="pencil" size={16} color="#000" />
                </TouchableOpacity>
              </View>

              {editandoBio ? (
                <>
                  <TextInput
                    style={estilos.inputBio}
                    value={bio}
                    onChangeText={setBio}
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

        {/* Amigos */}
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
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Ionicons name="person" size={20} color="#FFF" />
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

        {/* RPG's Favoritos */}
        <Text style={[estilos.titulo, { marginTop: 10 }]}>RPG'S FAVORITOS</Text>
        <View style={estilos.favoritos}>
          {favoritos.map((id) => {
            const jogo = dadosJogos.find((j) => j.id === id);
            return jogo ? (
              <View key={id} style={{ position: "relative" }}>
                <Image source={jogo.fonte} style={estilos.img} />
                {editandoFavoritos && (
                  <TouchableOpacity
                    style={estilos.remover}
                    onPress={() => toggleFavorito(id)}
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
            {editandoFavoritos ? "Fechar edição" : "Editar favoritos"}
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
                    ativo && { borderColor: "gold", borderWidth: 2 },
                  ]}
                  onPress={() => toggleFavorito(jogo.id)}
                >
                  <Image source={jogo.fonte} style={estilos.imgLista} />
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
  fundo: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  botao: { backgroundColor: "#666", padding: 8, borderRadius: 6 },
  botaoTxt: { color: "#FFF" },

  botaoSalvar: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  botaoSalvarTxt: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  perfil: { flexDirection: "row", gap: 15, marginBottom: 20 },
  nome: { color: "#E8D5A3", fontSize: 20, marginBottom: 6 },
  bioBox: { backgroundColor: "#FFF", borderRadius: 10, padding: 10 },
  bioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  bioTitulo: { fontWeight: "bold" },
  bioTexto: { color: "#000" },
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
  salvar: {
    marginTop: 8,
    backgroundColor: "#333",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  salvarTxt: { color: "#FFF" },
  titulo: { color: "#E8D5A3", fontSize: 16, marginBottom: 10 },
  favoritos: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  img: { width: 60, height: 60, borderRadius: 8 },
  remover: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 2,
  },
  editar: { color: "#FFF", marginBottom: 15 },
  lista: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "30%",
    backgroundColor: "#222",
    padding: 5,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  imgLista: { width: 50, height: 50, borderRadius: 6 },
  nomeJogo: { color: "#FFF", fontSize: 10, textAlign: "center", marginTop: 4 },
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
  btnMini: { color: "#FFF", fontSize: 12 },
  cor: { width: 20, height: 20, borderRadius: 10, marginRight: 5 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },

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
  itemAmigo: { alignItems: "center", marginRight: 15, width: 55 },
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
  nomeAmigo: { color: "#FFF", fontSize: 10, marginTop: 4, textAlign: "center" },
  msgVazia: { color: "#666", fontStyle: "italic", marginBottom: 20 },
});
