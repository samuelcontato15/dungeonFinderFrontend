import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UsuarioEncontrado {
  id: string;
  nick: string;
  fotoPerfil: string | null;
  corAvatar?: string;
  bio: string | null;
}

interface Amizade {
  id: string;
  solicitante: UsuarioEncontrado;
  destinatario: UsuarioEncontrado;
}

export default function Amigos() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
 
  const { guildaId } = useLocalSearchParams<{ guildaId?: string }>();

  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<UsuarioEncontrado[]>([]);
  const [amizades, setAmizades] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [adicionando, setAdicionando] = useState<string | null>(null);
  const [adicionados, setAdicionados] = useState<string[]>([]);

  useEffect(() => {
    carregarAmizades();
  }, []);

  async function carregarAmizades() {
    if (!user?.id) return;
    try {
      const response = await api.get<Amizade[]>(`/amizades/usuario/${user.id}`);
      const ids = response.data.map((amz) =>
        amz.solicitante.id === user.id ? amz.destinatario.id : amz.solicitante.id
      );
      setAmizades(ids);
    } catch (e) {
      console.log("Erro ao carregar amizades", e);
    }
  }

  async function handleBuscar() {
    if (!busca.trim()) return;

    try {
      setCarregando(true);
      const response = await api.get<UsuarioEncontrado[]>("/usuarios");

      const filtrados = response.data.filter(
        (u) =>
          u.nick.toLowerCase().includes(busca.toLowerCase()) &&
          u.id !== user?.id
      );

      setResultados(filtrados);

      if (filtrados.length === 0) {
        Alert.alert("Nenhum resultado", "Nenhum usuário encontrado com esse nome.");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível buscar usuários.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleAdicionar(destinatarioId: string) {
  if (!user?.id) {
    Alert.alert("Erro", "Usuário não identificado.");
    return;
  }

  try {
    setAdicionando(destinatarioId);

    if (guildaId) {

      console.log("ENVIANDO CONVITE GUILDA");
      console.log("guildaId:", guildaId);
      console.log("destinatarioId:", destinatarioId);

      const response = await api.post(
        `/guildas/${guildaId}/membros/${destinatarioId}/convidar`,
        {},
        {
          headers: {
            "X-Usuario-Id": user.id,
          },
        }
      );

      console.log("SUCESSO:", response.data);

      Alert.alert(
        "Convite enviado!",
        "Pedido para entrar na guilda enviado."
      );

    } else {

      console.log("ENVIANDO AMIZADE");

      const response = await api.post(
        `/amizades?destinatarioId=${destinatarioId}`,
        {},
        {
          headers: {
            "X-Usuario-Id": user.id,
          },
        }
      );

      console.log("SUCESSO:", response.data);

      Alert.alert(
        "Solicitação enviada!",
        "Pedido de amizade enviado com sucesso."
      );
    }

    setAdicionados((prev) => [...prev, destinatarioId]);

  } catch (error: any) {

    console.log("ERRO COMPLETO:");
    console.log(error);

    console.log("STATUS:");
    console.log(error?.response?.status);

    console.log("DATA:");
    console.log(error?.response?.data);

    console.log("MESSAGE:");
    console.log(error?.message);

    Alert.alert(
      "Erro",
      JSON.stringify(error?.response?.data) ||
      error?.message ||
      "Não foi possível enviar a solicitação."
    );

  } finally {
    setAdicionando(null);
  }
}
  return (
    <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo} resizeMode="cover">
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          <Text style={estilos.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        {/* O título muda dinamicamente dependendo de onde o usuário veio */}
        <Text style={estilos.titulo}>
          {guildaId ? "Convidar para Guilda" : "Buscar Amigos"}
        </Text>

        <View style={estilos.buscaRow}>
          <View style={estilos.inputContainer}>
            <Ionicons name="search-outline" size={18} color="#888" />
            <TextInput
              style={estilos.input}
              placeholder="Nome de usuário..."
              placeholderTextColor="#888"
              value={busca}
              onChangeText={setBusca}
              autoCapitalize="none"
              onSubmitEditing={handleBuscar}
              returnKeyType="search"
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => { setBusca(""); setResultados([]); }}>
                <Ionicons name="close-circle" size={18} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={estilos.btnBuscar} onPress={handleBuscar} activeOpacity={0.8}>
            <Text style={estilos.btnBuscarTexto}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {carregando && <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 30 }} />}

        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const jaAdicionado = adicionados.includes(item.id);
            const esteAdicionando = adicionando === item.id;
            
            // Se for convite de guilda, ignoramos a verificação de "já é amigo" no botão
            const jaEhAmigo = !guildaId && amizades.includes(item.id);

            return (
              <View style={estilos.card}>
                <View style={estilos.avatarCirculo}>
                  {item.fotoPerfil ? (
                    <Image source={{ uri: item.fotoPerfil }} style={estilos.avatarImagem} />
                  ) : (
                    <View style={[estilos.avatarFallback, { backgroundColor: item.corAvatar || "#D4AF37" }]}>
                      <Ionicons name="person" size={28} color="#FFF" />
                    </View>
                  )}
                </View>

                <View style={estilos.cardInfo}>
                  <Text style={estilos.cardNick}>{item.nick}</Text>
                  {item.bio ? (
                    <Text style={estilos.cardBio} numberOfLines={1}>{item.bio}</Text>
                  ) : (
                    <Text style={estilos.cardBioVazio}>Sem bio</Text>
                  )}
                </View>

                {jaEhAmigo ? (
                  <View style={estilos.btnAmigo}>
                    <Text style={estilos.btnAmigoTexto}>Amigos</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[estilos.btnAdicionar, jaAdicionado && estilos.btnAdicionado]}
                    onPress={() => !jaAdicionado && handleAdicionar(item.id)}
                    disabled={jaAdicionado || esteAdicionando}
                    activeOpacity={0.8}
                  >
                    {esteAdicionando ? (
                      <ActivityIndicator size="small" color="#1a1008" />
                    ) : (
                      <Text style={estilos.btnAdicionarTexto}>
                        {jaAdicionado ? "Enviado ✓" : guildaId ? "Convidar" : "Adicionar"}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.65)" },
  container: { flex: 1, paddingHorizontal: 24 },
  btnVoltar: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginBottom: 8 },
  btnVoltarTexto: { color: "#D4AF37", fontSize: 14 },
  titulo: { color: "#E8D5A3", fontSize: 24, fontWeight: "900", letterSpacing: 2, marginBottom: 20 },
  buscaRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  inputContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(232,213,163,0.85)", borderRadius: 8, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#1a1008" },
  btnBuscar: { backgroundColor: "#D4AF37", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  btnBuscarTexto: { color: "#1a1008", fontWeight: "700", fontSize: 14 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "rgba(212,175,55,0.2)", gap: 12 },
  avatarCirculo: { width: 56, height: 56, borderRadius: 28, overflow: "hidden" },
  avatarImagem: { width: "100%", height: "100%" },
  avatarFallback: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  cardInfo: { flex: 1, gap: 4 },
  cardNick: { color: "#E8D5A3", fontSize: 15, fontWeight: "700" },
  cardBio: { color: "#aaa", fontSize: 12 },
  cardBioVazio: { color: "#666", fontSize: 12, fontStyle: "italic" },
  btnAdicionar: { backgroundColor: "#D4AF37", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, minWidth: 90, alignItems: "center" },
  btnAdicionado: { backgroundColor: "rgba(212,175,55,0.3)", borderWidth: 1, borderColor: "#D4AF37" },
  btnAdicionarTexto: { color: "#1a1008", fontWeight: "700", fontSize: 12 },
  btnAmigo: { backgroundColor: "#444", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, minWidth: 90, alignItems: "center" },
  btnAmigoTexto: { color: "#FFF", fontWeight: "700", fontSize: 12 },
});