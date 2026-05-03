import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dadosJogos } from "../src/data/dadosJogos";

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();

  // BIO
  const [editandoBio, setEditandoBio] = useState(false);
  const [bio, setBio] = useState("Olá, esse é meu perfil.");

  // FOTO
  const [foto, setFoto] = useState<string | null>(null);
  const [corAvatar, setCorAvatar] = useState("#D4AF37");

  const cores = ["#D4AF37","#FF6B6B","#4ECDC4","#1A535C","#3A86FF"];

  // FAVORITOS
  const [favoritos, setFavoritos] = useState(["j1","j4"]);
  const [editandoFavoritos, setEditandoFavoritos] = useState(false);

  const toggleFavorito = (id: string) => {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter(f => f !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  // UPLOAD
  const escolherImagem = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permissão necessária");

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.7
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const removerImagem = () => setFoto(null);

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
          paddingHorizontal: 20
        }}
      >

        {/* HEADER */}
        <View style={estilos.header}>
          <TouchableOpacity style={estilos.botao}>
            <Text style={estilos.botaoTxt}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botao} onPress={handleLogout}>
            <Text style={estilos.botaoTxt}>Log-out</Text>
          </TouchableOpacity>
        </View>

        {/* PERFIL */}
        <View style={estilos.perfil}>
          
          {/* FOTO */}
          <View style={{ alignItems: "center" }}>
            <View style={{ position: "relative" }}>
              <TouchableOpacity onPress={escolherImagem}>
                {foto ? (
                  <Image source={{ uri: foto }} style={estilos.avatar} />
                ) : (
                  <View style={[estilos.avatar,{ backgroundColor: corAvatar, justifyContent:"center", alignItems:"center"}]}>
                    <Ionicons name="person" size={40} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>

              {/* LÁPIS */}
              <TouchableOpacity style={estilos.lapis} onPress={escolherImagem}>
                <Ionicons name="pencil" size={14} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection:"row", gap:10, marginTop:5 }}>
              <TouchableOpacity onPress={escolherImagem}>
                <Text style={estilos.btnMini}>Upload</Text>
              </TouchableOpacity>

              {foto && (
                <TouchableOpacity onPress={removerImagem}>
                  <Text style={estilos.btnMini}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* CORES */}
            <View style={{ flexDirection:"row", marginTop:8 }}>
              {cores.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCorAvatar(c)}
                  style={[
                    estilos.cor,
                    { backgroundColor:c },
                    corAvatar === c && { borderWidth:2, borderColor:"#FFF" }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* INFO */}
          <View style={{ flex:1 }}>
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
                  />

                  <TouchableOpacity
                    style={estilos.salvar}
                    onPress={() => setEditandoBio(false)}
                  >
                    <Text style={estilos.salvarTxt}>Salvar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={estilos.bioTexto}>{bio}</Text>
              )}
            </View>
          </View>
        </View>

        {/* FAVORITOS */}
        <Text style={estilos.titulo}>RPG'S FAVORITOS</Text>

        <View style={estilos.favoritos}>
          {favoritos.map(id => {
            const jogo = dadosJogos.find(j => j.id === id);
            return (
              <View key={id} style={{ position:"relative" }}>
                <Image source={jogo?.fonte} style={estilos.img} />

                {editandoFavoritos && (
                  <TouchableOpacity
                    style={estilos.remover}
                    onPress={() => toggleFavorito(id)}
                  >
                    <Ionicons name="close" size={14} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity onPress={() => setEditandoFavoritos(!editandoFavoritos)}>
          <Text style={estilos.editar}>
            {editandoFavoritos ? "Salvar favoritos" : "Editar favoritos"}
          </Text>
        </TouchableOpacity>

        {/* LISTA */}
        {editandoFavoritos && (
          <View style={estilos.lista}>
            {dadosJogos.map(jogo => {
              const ativo = favoritos.includes(jogo.id);

              return (
                <TouchableOpacity
                  key={jogo.id}
                  style={[
                    estilos.card,
                    ativo && { borderColor:"gold", borderWidth:2 }
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
  fundo:{ flex:1 },
  overlay:{ ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(0,0,0,0.9)" },

  header:{ flexDirection:"row", justifyContent:"space-between", marginBottom:20 },
  botao:{ backgroundColor:"#666", padding:8, borderRadius:6 },
  botaoTxt:{ color:"#FFF" },

  perfil:{ flexDirection:"row", gap:15, marginBottom:20 },

  nome:{ color:"#E8D5A3", fontSize:20, marginBottom:6 },

  bioBox:{ backgroundColor:"#FFF", borderRadius:10, padding:10 },
  bioHeader:{ flexDirection:"row", justifyContent:"space-between", marginBottom:5 },
  bioTitulo:{ fontWeight:"bold" },

  bioTexto:{ color:"#000" },

  inputBio:{
    borderWidth:1,
    borderColor:"#ccc",
    borderRadius:6,
    padding:8,
    minHeight:60
  },

  salvar:{
    marginTop:8,
    backgroundColor:"#333",
    padding:6,
    borderRadius:6,
    alignItems:"center"
  },

  salvarTxt:{ color:"#FFF" },

  titulo:{ color:"#E8D5A3", fontSize:16, marginBottom:10 },

  favoritos:{ flexDirection:"row", gap:10, marginBottom:10 },

  img:{ width:60, height:60 },

  remover:{
    position:"absolute",
    top:-5,
    right:-5,
    backgroundColor:"red",
    borderRadius:10,
    padding:2
  },

  editar:{ color:"#FFF", marginBottom:15 },

  lista:{ flexDirection:"row", flexWrap:"wrap", gap:10 },

  card:{
    width:"30%",
    backgroundColor:"#222",
    padding:5,
    borderRadius:8,
    alignItems:"center"
  },

  imgLista:{ width:50, height:50 },

  nomeJogo:{ color:"#FFF", fontSize:10, textAlign:"center" },

  avatar:{
    width:90,
    height:90,
    borderRadius:45,
    borderWidth:2,
    borderColor:"#444"
  },

  lapis:{
    position:"absolute",
    bottom:0,
    right:0,
    backgroundColor:"#FFF",
    padding:5,
    borderRadius:12
  },

  btnMini:{ color:"#FFF", fontSize:12 },

  cor:{ width:20, height:20, borderRadius:10, marginRight:5 },

  footer:{ position:"absolute", bottom:0, left:0, right:0 }
});