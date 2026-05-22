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

export default function CriarGuilda() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [bannerBase64, setBannerBase64] = useState<string | null>(null);
  
  const [jogos, setJogos] = useState<any[]>([]);
  const [jogoSelecionado, setJogoSelecionado] = useState<string>("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    api.get("/jogos")
      .then((res) => setJogos(res.data))
      .catch(() => console.log("Erro ao carregar jogos"));
  }, []);


  const escolherImagem = async () => {
    // Pede permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria para escolher um banner.');
      return;
    }

    // Abre a galeria
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9], // Formato de banner
      quality: 0.5, // Reduz um pouco a qualidade para não pesar o Base64 no banco
      base64: true, // Essencial para salvar no banco como TEXT
    });

    if (!result.canceled && result.assets[0].base64) {
      // Cria a string base64 completa para ser lida como imagem
      setBannerBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleCriar = async () => {
    if (!nome || !descricao || !jogoSelecionado) {
      Alert.alert("Erro", "Preencha o nome, descrição e selecione um jogo.");
      return;
    }

    setCarregando(true);
    try {
      const novaGuilda = {
        nome,
        descricao,
        banner: bannerBase64, // Envia a string gigante da imagem
        maxMembros: 100, // Valor padrão
      };

      // Chama o endpoint de criar guilda mandando o ID do jogo pela URL (RequestParam)
      const res = await api.post(`/guildas?jogoId=${jogoSelecionado}`, novaGuilda, {
        headers: { "X-Usuario-Id": user?.id },
      });

      Alert.alert("Sucesso!", "Guilda criada com sucesso.");
router.replace(`/detalhes/guilda/${res.data.id}`);    } catch (error: any) {
      Alert.alert("Erro", error.response?.data?.message || "Não foi possível criar a guilda.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo}>
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#E8D5A3" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>CRIAR GUILDA</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={estilos.container}>
        
        {/* GALERIA - BANNER */}
        <Text style={estilos.label}>Banner da Guilda</Text>
        <TouchableOpacity style={estilos.btnGaleria} onPress={escolherImagem}>
          {bannerBase64 ? (
            <Image source={{ uri: bannerBase64 }} style={estilos.imgBanner} />
          ) : (
            <View style={estilos.galeriaVazia}>
              <Ionicons name="image-outline" size={40} color="#D4AF37" />
              <Text style={estilos.galeriaTexto}>Tocar para escolher da galeria</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={estilos.label}>Nome da Guilda</Text>
        <TextInput 
          style={estilos.input} 
          placeholder="Ex: Cavaleiros de Azeroth" 
          placeholderTextColor="#888" 
          value={nome} 
          onChangeText={setNome} 
        />

        <Text style={estilos.label}>Mensagem Inicial / Regras</Text>
        <TextInput 
          style={[estilos.input, { height: 100, textAlignVertical: "top" }]} 
          placeholder="Quais os requisitos para entrar?" 
          placeholderTextColor="#888" 
          multiline 
          value={descricao} 
          onChangeText={setDescricao} 
        />

        <Text style={estilos.label}>Selecione o Jogo</Text>
        <View style={estilos.jogosContainer}>
          {jogos.map((j) => (
            <TouchableOpacity 
              key={j.id} 
              style={[estilos.jogoBtn, jogoSelecionado === j.id && estilos.jogoBtnAtivo]} 
              onPress={() => setJogoSelecionado(j.id)}
            >
              <Text style={[estilos.jogoTxt, jogoSelecionado === j.id && estilos.jogoTxtAtivo]}>
                {j.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={estilos.btnCriar} onPress={handleCriar} disabled={carregando}>
          {carregando ? (
            <ActivityIndicator color="#1a1008" />
          ) : (
            <Text style={estilos.btnCriarTxt}>FORJAR GUILDA</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.75)" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20 },
  headerTitulo: { color: "#E8D5A3", fontSize: 18, fontWeight: "bold" },
  container: { padding: 20, paddingBottom: 50 },
  label: { color: "#D4AF37", fontSize: 14, fontWeight: "bold", marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: "rgba(232,213,163,0.9)", borderRadius: 8, padding: 12, fontSize: 14, color: "#1a1008" },
  
  // Estilos da Galeria
  btnGaleria: { height: 150, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 8, borderWidth: 1, borderColor: "#D4AF37", overflow: "hidden", justifyContent: "center", alignItems: "center" },
  imgBanner: { width: "100%", height: "100%", resizeMode: "cover" },
  galeriaVazia: { alignItems: "center" },
  galeriaTexto: { color: "#D4AF37", marginTop: 10, fontSize: 12 },

  jogosContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  jogoBtn: { borderWidth: 1, borderColor: "#D4AF37", borderRadius: 8, padding: 10, backgroundColor: "rgba(0,0,0,0.5)" },
  jogoBtnAtivo: { backgroundColor: "#D4AF37" },
  jogoTxt: { color: "#E8D5A3", fontSize: 12 },
  jogoTxtAtivo: { color: "#1a1008", fontWeight: "bold" },
  btnCriar: { backgroundColor: "#D4AF37", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 40 },
  btnCriarTxt: { color: "#1a1008", fontWeight: "bold", fontSize: 16, letterSpacing: 1 },
});