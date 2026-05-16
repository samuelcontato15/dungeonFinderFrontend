import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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

  const chave = `@DungeonFinder:favoritos:${user?.id}`;

  const [amigos, setAmigos] = useState<any[]>([]);
  const [editandoBio, setEditandoBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || "Olá, esse é meu perfil.");
  const [foto, setFoto] = useState<string | null>(user?.fotoPerfil || null);
  const [nickLocal, setNickLocal] = useState(user?.usuario || "");
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [editandoFavoritos, setEditandoFavoritos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [temAlteracoes, setTemAlteracoes] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
      carregarFavoritos();
    }, [user?.id]),
  );

  const carregarPerfil = async () => {
    // Sempre busca pelo ID salvo no contexto — o ID nunca muda mesmo que o admin altere nick/email
    if (!user?.id) return;
    try {
      const [amigosRes, perfilRes] = await Promise.all([
        api.get(`/amizades/usuario/${user.id}`),
        api.get(`/usuarios/${user.id}`),
      ]);

      const listaFormatada = amigosRes.data
        .filter((amz: any) => amz.status === "ACEITO")
        .map((amz: any) =>
          amz.solicitante.id === user.id ? amz.destinatario : amz.solicitante,
        );
      setAmigos(listaFormatada);

      const userData = perfilRes.data;

      // Atualiza estados locais diretamente da API — não depende do contexto/AsyncStorage
      setBio(userData.bio || "Olá, esse é meu perfil.");
      setFoto(userData.fotoPerfil || null);
      setNickLocal(userData.nick || "");

      // Atualiza contexto para manter sincronia em outras telas
      updateUser?.({
        usuario: userData.nick,
        bio: userData.bio,
        fotoPerfil: userData.fotoPerfil,
        email: userData.email,
      });
    } catch (err) {
      console.log("Erro ao carregar perfil:", err);
    }
  };

  const carregarFavoritos = async () => {
    if (!user?.id) return;
    try {
      const salvo = await AsyncStorage.getItem(chave);
      setFavoritos(salvo ? JSON.parse(salvo) : []);
    } catch {
      setFavoritos([]);
    }
  };

  const salvarPerfil = async () => {
    if (!user?.id) {
      Alert.alert("Erro", "Usuário não identificado");
      return;
    }

    setSalvando(true);
    try {
      const response = await api.put(`/usuarios/${user.id}`, {
        nick: nickLocal,
        bio,
        fotoPerfil: foto,
      });

      if (response.status === 200) {
        updateUser?.({ usuario: nickLocal, bio, fotoPerfil: foto });
        await AsyncStorage.setItem(chave, JSON.stringify(favoritos));
        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
        setEditandoBio(false);
        setEditandoFavoritos(false);
        setTemAlteracoes(false);
      }
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.message ||
          "Não foi possível salvar as alterações",
      );
    } finally {
      setSalvando(false);
    }
  };

  const toggleFavorito = (id: string) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
    setTemAlteracoes(true);
  };

  const escolherImagem = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria.");
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
        {/* HEADER */}
        <View style={estilos.header}>
          <TouchableOpacity
            style={estilos.botao}
            onPress={() => router.push("/config")}
          >
            <Text style={estilos.botaoTxt}>Configurações</Text>
          </TouchableOpacity>

          {user?.isAdmin && (
            <TouchableOpacity
              style={estilos.botaoAdmin}
              onPress={() => router.push("/admin")}
            >
              <Text style={estilos.botaoAdminTxt}>Admin</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={estilos.botao} onPress={handleLogout}>
            <Text style={estilos.botaoTxt}>Sair</Text>
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
                  <Ionicons name="person" size={40} color="#333" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={escolherImagem}>
              <Text style={estilos.btnMini}>Alterar foto</Text>
            </TouchableOpacity>

            {foto && (
              <TouchableOpacity onPress={removerImagem}>
                <Text style={estilos.btnMini}>Remover foto</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flex: 1 }}>
            {/* Usa nickLocal — vem direto da API, não do contexto/AsyncStorage */}
            <Text style={estilos.nome}>
              {nickLocal.toUpperCase() || "USUÁRIO"}
            </Text>

            <View style={estilos.bioBox}>
              <View style={estilos.bioHeader}>
                <Text style={estilos.bioTitulo}>Bio</Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditandoBio(!editandoBio);
                    if (!editandoBio) setTemAlteracoes(true);
                  }}
                >
                  <Ionicons name="pencil-outline" size={16} color="#333" />
                </TouchableOpacity>
              </View>

              {editandoBio ? (
                <>
                  <TextInput
                    style={estilos.inputBio}
                    value={bio}
                    onChangeText={(t) => {
                      setBio(t);
                      setTemAlteracoes(true);
                    }}
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
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

        {/* BOTÃO SALVAR */}
        {temAlteracoes && (
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
                <Text style={estilos.botaoSalvarTxt}>Salvar alterações</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* AMIGOS */}
        <View style={estilos.tituloRow}>
          <Text style={estilos.titulo}>AMIGOS</Text>
          <TouchableOpacity onPress={() => router.push("/amigos")}>
            <Text style={estilos.linkAcao}>+ Adicionar amigo</Text>
          </TouchableOpacity>
        </View>

        {amigos.length === 0 ? (
          <Text style={estilos.msgVazia}>Nenhum amigo adicionado</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {amigos.map((a) => (
              <View key={a.id} style={estilos.itemAmigo}>
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
              </View>
            ))}
          </ScrollView>
        )}

        {/* JOGOS FAVORITOS */}
        <View style={estilos.tituloRow}>
          <Text style={estilos.titulo}>JOGOS FAVORITOS</Text>
          <TouchableOpacity
            onPress={() => setEditandoFavoritos(!editandoFavoritos)}
          >
            <Text style={estilos.linkAcao}>
              {editandoFavoritos ? "Fechar" : "Editar"}
            </Text>
          </TouchableOpacity>
        </View>

        {favoritos.length === 0 && !editandoFavoritos && (
          <Text style={estilos.msgVazia}>Nenhum jogo favorito adicionado</Text>
        )}

        <View style={estilos.favoritos}>
          {favoritos.map((id) => {
            const jogo = dadosJogos.find((j: any) => j.id === id);
            if (!jogo) return null;
            return (
              <View key={id} style={estilos.jogoFavItem}>
                <Image source={jogo.fundo} style={estilos.img} />
                <Text style={estilos.jogoFavNome}>{jogo.nome}</Text>
              </View>
            );
          })}
        </View>

        {/* LISTA PARA EDITAR FAVORITOS */}
        {editandoFavoritos && (
          <View style={estilos.listaJogos}>
            {dadosJogos.map((jogo: any) => {
              const isFav = favoritos.includes(jogo.id);
              return (
                <TouchableOpacity
                  key={jogo.id}
                  style={[estilos.jogoItem, isFav && estilos.jogoItemAtivo]}
                  onPress={() => toggleFavorito(jogo.id)}
                >
                  <Image source={jogo.fundo} style={estilos.jogoItemImg} />
                  <Text style={estilos.jogoItemNome}>{jogo.nome}</Text>
                  {isFav && (
                    <View style={estilos.favBadge}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                      <Text style={estilos.favBadgeTxt}>Favorito</Text>
                    </View>
                  )}
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
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },

  botao: {
    backgroundColor: "#555",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  botaoTxt: { color: "#FFF", fontSize: 12 },

  botaoAdmin: {
    backgroundColor: "#D4AF37",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  botaoAdminTxt: { color: "#000", fontWeight: "bold", fontSize: 12 },

  perfil: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },

  nome: {
    color: "#E8D5A3",
    fontSize: 20,
    fontWeight: "bold",
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

  bioTitulo: { fontWeight: "bold", color: "#333" },

  bioTexto: { color: "#333", fontSize: 13 },

  inputBio: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    fontSize: 13,
  },

  contadorCaracteres: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#E8D5A3",
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
    color: "#CCC",
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },

  botaoSalvar: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  botaoSalvarTxt: { color: "#FFF", fontWeight: "bold", fontSize: 15 },

  tituloRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  titulo: { color: "#E8D5A3", fontSize: 15, fontWeight: "bold" },

  linkAcao: { color: "#D4AF37", fontSize: 13 },

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

  favoritos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },

  jogoFavItem: { alignItems: "center", width: 65 },

  jogoFavNome: {
    color: "#FFF",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },

  img: { width: 60, height: 60, borderRadius: 8 },

  listaJogos: { gap: 8, marginBottom: 10 },

  jogoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 8,
    gap: 10,
  },

  jogoItemAtivo: {
    backgroundColor: "rgba(212,175,55,0.2)",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },

  jogoItemImg: { width: 45, height: 45, borderRadius: 6 },

  jogoItemNome: { color: "#FFF", fontSize: 14, flex: 1 },

  favBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },

  favBadgeTxt: { color: "#FFF", fontSize: 11 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
