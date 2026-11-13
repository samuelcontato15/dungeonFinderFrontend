import BarraNavegacao from "@/components/BarraNavegacao";
import { Avatar, Botao, EstadoVazio, Selo, Tela, TituloSecao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, raios, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();

  const [amigos, setAmigos] = useState<any[]>([]);
  const [editandoBio, setEditandoBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || "Olá, esse é meu perfil.");
  const [foto, setFoto] = useState<string | null>(user?.fotoPerfil || null);
  const [nickLocal, setNickLocal] = useState(user?.usuario || "");
  const [salvando, setSalvando] = useState(false);
  const [temAlteracoes, setTemAlteracoes] = useState(false);

  // Favoritos
  const [favoritos, setFavoritos] = useState<any[]>([]); // guarda o objeto Jogo completo
  const [jogos, setJogos] = useState<any[]>([]);
  const [editandoFavoritos, setEditandoFavoritos] = useState(false);
  const [salvandoFavorito, setSalvandoFavorito] = useState<string | null>(null);
  const [carregandoFavoritos, setCarregandoFavoritos] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarTudo();
    }, [user?.id])
  );

  async function carregarTudo() {
    if (!user?.id) return;
    try {
      await Promise.all([
        carregarPerfil(),
        carregarJogos(),
        carregarFavoritos(),
      ]);
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    }
  }

  async function carregarPerfil() {
    if (!user?.id) return;
    try {
      const [amigosRes, perfilRes] = await Promise.all([
        api.get(`/amizades/usuario/${user.id}`),
        api.get(`/usuarios/${user.id}`),
      ]);

      const listaFormatada = amigosRes.data
        .filter((amz: any) => amz.status === "ACEITO")
        .map((amz: any) =>
          amz.solicitante.id === user.id ? amz.destinatario : amz.solicitante
        );
      setAmigos(listaFormatada);

      const userData = perfilRes.data;
      setBio(userData.bio || "Olá, esse é meu perfil.");
      setFoto(userData.fotoPerfil || null);
      setNickLocal(userData.nick || "");
      updateUser?.({
        usuario: userData.nick,
        bio: userData.bio,
        fotoPerfil: userData.fotoPerfil,
        email: userData.email,
      });
    } catch (err) {
      console.log("Erro carregar perfil:", err);
    }
  }

  async function carregarJogos() {
    try {
      const response = await api.get("/jogos");
      setJogos(response.data);
    } catch (error) {
      console.log("Erro carregar jogos:", error);
    }
  }

  async function carregarFavoritos() {
    if (!user?.id) return;
    setCarregandoFavoritos(true);
    try {
      const response = await api.get(`/jogos_favoritos/usuario/${user.id}`);

      const listaJogos = response.data.map((fav: any) => fav.jogo);
      setFavoritos(listaJogos);
    } catch (error: any) {
      console.log("Erro carregar favoritos:", error);
      Alert.alert("Erro", "Falha ao carregar favoritos.");
    } finally {
      setCarregandoFavoritos(false);
    }
  }

  async function toggleFavorito(jogoId: string) {
    if (!user?.id) return;
    const isFav = favoritos.some((fav) => fav.id === jogoId);
    setSalvandoFavorito(jogoId);
    try {
      if (isFav) {
        await api.delete(`/jogos_favoritos?jogoId=${jogoId}`, {
          headers: { "X-Usuario-Id": user.id },
        });
        setFavoritos((prev) => prev.filter((fav) => fav.id !== jogoId));
      } else {
        await api.post(
          `/jogos_favoritos?jogoId=${jogoId}`,
          {},
          { headers: { "X-Usuario-Id": user.id } }
        );
        // Adiciona o jogo completo na lista local
        const jogoCompleto = jogos.find((j) => j.id === jogoId);
        if (jogoCompleto) {
          setFavoritos((prev) => [...prev, jogoCompleto]);
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao atualizar favorito";
      Alert.alert("Erro", msg);
    } finally {
      setSalvandoFavorito(null);
    }
  }

  const salvarPerfil = async () => {
    if (!user?.id) {
      Alert.alert("Erro", "Usuário não identificado");
      return;
    }

    setSalvando(true);
    try {
      const response = await api.put(`/usuarios/${user.id}`, {
        nick: nickLocal,
        email: user.email,
        bio,
        fotoPerfil: foto,
      });

      if (response.status === 200) {
        updateUser?.({ usuario: nickLocal, bio, fotoPerfil: foto });
        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
        setEditandoBio(false);
        setEditandoFavoritos(false);
        setTemAlteracoes(false);
      }
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível salvar as alterações"
      );
    } finally {
      setSalvando(false);
    }
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
      quality: 0.4,
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
    <Tela>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 130,
          paddingHorizontal: 20,
        }}
      >
        {/* HEADER */}
        <View style={estilos.header}>
          <Botao
            titulo="Configurações"
            icone="settings-outline"
            variante="neutro"
            pequeno
            onPress={() => router.push("/config")}
          />

          {user?.isAdmin && (
            <Botao
              titulo="Admin"
              icone="shield-checkmark"
              pequeno
              onPress={() => router.push("/admin")}
            />
          )}

          <Botao
            titulo="Sair"
            icone="log-out-outline"
            variante="neutro"
            pequeno
            onPress={handleLogout}
          />
        </View>

        {/* HERÓI */}
        <View style={estilos.heroi}>
          <TouchableOpacity onPress={escolherImagem} activeOpacity={0.85}>
            <Avatar uri={foto} tamanho={112} destaque />
            <View style={estilos.camera}>
              <Ionicons name="camera" size={15} color={cores.tinta} />
            </View>
          </TouchableOpacity>

          <Text style={estilos.nome} numberOfLines={1}>
            {nickLocal.toUpperCase() || "USUÁRIO"}
          </Text>

          <View style={estilos.acoesFoto}>
            <TouchableOpacity onPress={escolherImagem}>
              <Text style={estilos.btnMini}>Alterar foto</Text>
            </TouchableOpacity>
            {foto && (
              <>
                <Text style={estilos.ponto}>◆</Text>
                <TouchableOpacity onPress={removerImagem}>
                  <Text style={estilos.btnMini}>Remover foto</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={estilos.numeros}>
            <View style={estilos.numero}>
              <Text style={estilos.numeroValor}>{amigos.length}</Text>
              <Text style={tipo.rotulo}>Amigos</Text>
            </View>
            <View style={estilos.numeroDivisor} />
            <View style={estilos.numero}>
              <Text style={estilos.numeroValor}>{favoritos.length}</Text>
              <Text style={tipo.rotulo}>Favoritos</Text>
            </View>
          </View>
        </View>

        {/* BIO */}
        <View style={estilos.bioBox}>
          <View style={estilos.bioHeader}>
            <Text style={estilos.bioTitulo}>Bio</Text>
            <TouchableOpacity
              hitSlop={10}
              onPress={() => {
                setEditandoBio(!editandoBio);
                if (!editandoBio) setTemAlteracoes(true);
              }}
            >
              <Ionicons
                name={editandoBio ? "close" : "pencil-outline"}
                size={17}
                color={cores.madeira600}
              />
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
                selectionColor={cores.ouroEscuro}
              />
              <Text style={estilos.contadorCaracteres}>
                {bio.length}/500
              </Text>
            </>
          ) : (
            <Text style={estilos.bioTexto}>{bio}</Text>
          )}
        </View>

        {temAlteracoes && (
          <Botao
            titulo="Salvar alterações"
            icone="save-outline"
            variante="sucesso"
            onPress={salvarPerfil}
            carregando={salvando}
            style={{ marginTop: 14 }}
          />
        )}

        {/* AMIGOS */}
        <TituloSecao
          titulo="Amigos"
          style={{ marginTop: 28 }}
          direita={
            <TouchableOpacity onPress={() => router.push("/amigos")}>
              <Text style={estilos.linkAcao}>+ Adicionar amigo</Text>
            </TouchableOpacity>
          }
        />

        {amigos.length === 0 ? (
          <EstadoVazio icone="people-outline" texto="Nenhum amigo adicionado" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {amigos.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={estilos.itemAmigo}
                onPress={() => router.push(`/detalhes/usuario/${a.id}`)}
                activeOpacity={0.7}
              >
                <Avatar uri={a.fotoPerfil} tamanho={54} />
                <Text style={estilos.nomeAmigo} numberOfLines={1}>{a.nick}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* FAVORITOS */}
        <TituloSecao
          titulo="Jogos favoritos"
          style={{ marginTop: 28 }}
          direita={
            <TouchableOpacity
              onPress={() => setEditandoFavoritos(!editandoFavoritos)}
            >
              <Text style={estilos.linkAcao}>
                {editandoFavoritos ? "Fechar" : "Editar"}
              </Text>
            </TouchableOpacity>
          }
        />

        {carregandoFavoritos ? (
          <ActivityIndicator color={cores.ouro} style={{ marginVertical: 10 }} />
        ) : favoritos.length === 0 && !editandoFavoritos ? (
          <EstadoVazio
            icone="game-controller-outline"
            texto="Nenhum jogo favorito adicionado"
          />
        ) : null}

        <View style={estilos.favoritos}>
          {favoritos.map((jogo) => (
            <View key={jogo.id} style={estilos.jogoFavItem}>
              <Avatar
                uri={jogo.capa}
                tamanho={72}
                icone="game-controller"
                quadrado
              />
              <Text style={estilos.jogoFavNome} numberOfLines={2}>
                {jogo.nome.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {editandoFavoritos && (
          <View style={estilos.listaJogos}>
            {jogos.map((jogo) => {
              const isFav = favoritos.some((fav) => fav.id === jogo.id);
              const estaSalvando = salvandoFavorito === jogo.id;
              return (
                <TouchableOpacity
                  key={jogo.id}
                  style={[estilos.jogoItem, isFav && estilos.jogoItemAtivo]}
                  onPress={() => toggleFavorito(jogo.id)}
                  disabled={estaSalvando}
                  activeOpacity={0.8}
                >
                  {jogo.capa ? (
                    <Image source={{ uri: jogo.capa }} style={estilos.jogoItemImg} />
                  ) : (
                    <View style={[estilos.jogoItemImg, estilos.jogoItemImgPlaceholder]}>
                      <Ionicons name="game-controller" size={20} color={cores.ouro} />
                    </View>
                  )}
                  <Text style={estilos.jogoItemNome} numberOfLines={1}>{jogo.nome}</Text>
                  {estaSalvando ? (
                    <ActivityIndicator size="small" color={cores.ouro} />
                  ) : isFav ? (
                    <Selo texto="Favorito" icone="star" />
                  ) : (
                    <Ionicons name="star-outline" size={18} color={cores.textoApagado} />
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
    </Tela>
  );
}

const estilos = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  heroi: { alignItems: "center", marginTop: 22 },
  camera: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: cores.ouro,
    borderWidth: 2,
    borderColor: cores.madeira900,
    justifyContent: "center",
    alignItems: "center",
  },
  nome: { ...tipo.display, fontSize: 24, marginTop: 14 },
  acoesFoto: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  btnMini: { fontFamily: fontes.corpo, color: cores.textoSuave, fontSize: 14 },
  ponto: { color: cores.ouroEscuro, fontSize: 7 },
  numeros: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    backgroundColor: cores.cartao,
    borderRadius: raios.g,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingVertical: 12,
  },
  numero: { alignItems: "center", paddingHorizontal: 34 },
  numeroValor: { fontFamily: fontes.tituloBlack, color: cores.ouroClaro, fontSize: 22 },
  numeroDivisor: { width: 1, height: 30, backgroundColor: cores.borda },

  bioBox: {
    backgroundColor: cores.pergaminho,
    borderRadius: raios.m,
    borderWidth: 1,
    borderColor: cores.ouroEscuro,
    padding: 16,
    marginTop: 22,
  },
  bioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  bioTitulo: {
    fontFamily: fontes.titulo,
    color: cores.madeira600,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  bioTexto: { fontFamily: fontes.corpo, color: cores.tinta, fontSize: 17, lineHeight: 23 },
  inputBio: {
    borderWidth: 1,
    borderColor: "rgba(58,40,24,0.4)",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: raios.p,
    padding: 10,
    minHeight: 80,
    fontFamily: fontes.corpo,
    fontSize: 17,
    color: cores.tinta,
  },
  contadorCaracteres: {
    fontFamily: fontes.corpoItalico,
    fontSize: 13,
    color: cores.madeira600,
    textAlign: "right",
    marginTop: 4,
  },

  linkAcao: { fontFamily: fontes.corpoForte, color: cores.ouro, fontSize: 14 },
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

  listaJogos: { gap: 8, marginTop: 14 },
  jogoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.cartao,
    borderRadius: raios.m,
    borderWidth: 1,
    borderColor: cores.linha,
    padding: 8,
    gap: 12,
  },
  jogoItemAtivo: {
    backgroundColor: "rgba(212,175,55,0.12)",
    borderColor: cores.bordaForte,
  },
  jogoItemImg: { width: 46, height: 46, borderRadius: raios.p },
  jogoItemImgPlaceholder: {
    backgroundColor: cores.madeira700,
    justifyContent: "center",
    alignItems: "center",
  },
  jogoItemNome: { ...tipo.subtitulo, fontSize: 16, flex: 1 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
