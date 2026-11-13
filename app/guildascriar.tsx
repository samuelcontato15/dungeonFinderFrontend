import { Botao, Cabecalho, Campo, Cartao, Tela } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, gradientes, raios, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
  const [jogosSelecionados, setJogosSelecionados] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);

  const toggleJogo = (id: string) => {
    setJogosSelecionados(prev =>
      prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
    );
  };

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

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9], 
      quality: 0.5, 
      base64: true, 
    });

    if (!result.canceled && result.assets[0].base64) {
      setBannerBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleCriar = async () => {
    if (!nome || !descricao || jogosSelecionados.length === 0) {
      Alert.alert("Erro", "Preencha o nome, descrição e selecione ao menos um jogo.");
      return;
    }

    setCarregando(true);
    try {
      const novaGuilda = {
        nome,
        descricao,
        banner: bannerBase64, 
        maxMembros: 100, 
      };

      const jogosParam = jogosSelecionados.join(",");
      const res = await api.post(`/guildas?jogoId=${jogosParam}`, novaGuilda, {
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
    <Tela>
      <Cabecalho titulo="Criar Guilda" subtitulo="Erga um estandarte para o seu grupo" />

      <ScrollView
        contentContainerStyle={[estilos.container, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* GALERIA - BANNER */}
        <View style={{ gap: 6 }}>
          <Text style={tipo.rotulo}>Banner da Guilda</Text>
          <TouchableOpacity style={estilos.btnGaleria} onPress={escolherImagem} activeOpacity={0.85}>
            {bannerBase64 ? (
              <>
                <Image source={{ uri: bannerBase64 }} style={estilos.imgBanner} />
                <View style={estilos.trocar}>
                  <Ionicons name="camera" size={14} color={cores.tinta} />
                </View>
              </>
            ) : (
              <View style={estilos.galeriaVazia}>
                <Ionicons name="image-outline" size={36} color={cores.ouro} />
                <Text style={tipo.italico}>Tocar para escolher da galeria</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Cartao style={estilos.cartao}>
          <Campo
            label="Nome da Guilda"
            icone="shield-outline"
            placeholder="Ex: Cavaleiros de Azeroth"
            value={nome}
            onChangeText={setNome}
          />

          <Campo
            label="Mensagem Inicial / Regras"
            placeholder="Quais os requisitos para entrar?"
            multiline
            value={descricao}
            onChangeText={setDescricao}
          />
        </Cartao>

        <View style={{ gap: 10 }}>
          <Text style={tipo.rotulo}>Selecione os Jogos</Text>
          <View style={estilos.jogosContainer}>
            {jogos.map((j) => {
              const ativo = jogosSelecionados.includes(j.id);
              return (
                <TouchableOpacity
                  key={j.id}
                  style={[estilos.jogoBtn, ativo && estilos.jogoBtnAtivo]}
                  onPress={() => toggleJogo(j.id)}
                  activeOpacity={0.8}
                >
                  {ativo && <LinearGradient colors={gradientes.ouro} style={StyleSheet.absoluteFill} />}
                  {ativo && <Ionicons name="checkmark" size={14} color={cores.tinta} />}
                  <Text style={[estilos.jogoTxt, ativo && estilos.jogoTxtAtivo]}>
                    {j.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Botao
          titulo="Forjar Guilda"
          icone="hammer-outline"
          onPress={handleCriar}
          carregando={carregando}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 6, gap: 20 },
  cartao: { gap: 16, padding: 18 },
  btnGaleria: {
    height: 160,
    backgroundColor: cores.campo,
    borderRadius: raios.g,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imgBanner: { width: "100%", height: "100%", resizeMode: "cover" },
  trocar: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: cores.ouro,
    justifyContent: "center",
    alignItems: "center",
  },
  galeriaVazia: { alignItems: "center", gap: 8 },
  jogosContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  jogoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.pilula,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: cores.cartao,
    overflow: "hidden",
  },
  jogoBtnAtivo: { borderColor: cores.ouroClaro },
  jogoTxt: { fontFamily: fontes.corpoForte, color: cores.pergaminho, fontSize: 15 },
  jogoTxtAtivo: { color: cores.tinta },
});
