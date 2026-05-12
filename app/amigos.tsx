import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

interface UsuarioEncontrado {
  id: string;
  nick: string;
  fotoPerfil: string | null;
  bio: string | null;
}

export default function Amigos() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [busca, setBusca]           = useState("");
  const [resultados, setResultados] = useState<UsuarioEncontrado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [adicionando, setAdicionando] = useState<string | null>(null);
  const [adicionados, setAdicionados] = useState<string[]>([]);

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
      Alert.alert("Erro", "Usuário não identificado. Faça login novamente.");
      return;
    }
    try {
      setAdicionando(destinatarioId);
      await api.post(
        `/amizades?destinatarioId=${destinatarioId}`,
        {},
        { headers: { "X-Usuario-Id": user.id } }
      );
      setAdicionados((prev) => [...prev, destinatarioId]);
      Alert.alert("Solicitação enviada!", "Pedido de amizade enviado com sucesso.");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Não foi possível enviar a solicitação.";
      Alert.alert("Erro", msg);
    } finally {
      setAdicionando(null);
    }
  }

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>

        {/* Header */}
        <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          <Text style={estilos.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <Text style={estilos.titulo}>Buscar Amigos</Text>

        {/* Campo de busca */}
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

        {/* Loading */}
        {carregando && (
          <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 30 }} />
        )}

        {/* Resultados */}
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const jaAdicionado = adicionados.includes(item.id);
            const esteAdicionando = adicionando === item.id;

            return (
              <View style={estilos.card}>
                {/* Avatar */}
                <View style={estilos.avatarCirculo}>
                  <Ionicons name="person" size={32} color="#D4AF37" />
                </View>

                {/* Info */}
                <View style={estilos.cardInfo}>
                  <Text style={estilos.cardNick}>{item.nick}</Text>
                  {item.bio ? (
                    <Text style={estilos.cardBio} numberOfLines={1}>{item.bio}</Text>
                  ) : (
                    <Text style={estilos.cardBioVazio}>Sem bio</Text>
                  )}
                </View>

                {/* Botão adicionar */}
                <TouchableOpacity
                  style={[
                    estilos.btnAdicionar,
                    jaAdicionado && estilos.btnAdicionado,
                  ]}
                  onPress={() => !jaAdicionado && handleAdicionar(item.id)}
                  disabled={jaAdicionado || esteAdicionando}
                  activeOpacity={0.8}
                >
                  {esteAdicionando ? (
                    <ActivityIndicator size="small" color="#1a1008" />
                  ) : (
                    <Text style={estilos.btnAdicionarTexto}>
                      {jaAdicionado ? "Enviado ✓" : "Adicionar"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo:   { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.65)" },
  container: { flex: 1, paddingHorizontal: 24 },

  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  btnVoltarTexto: { color: "#D4AF37", fontSize: 14 },

  titulo: {
    color: "#E8D5A3",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 20,
  },

  buscaRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232,213,163,0.85)",
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1a1008",
  },
  btnBuscar: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnBuscarTexto: {
    color: "#1a1008",
    fontWeight: "700",
    fontSize: 14,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    gap: 12,
  },
  avatarCirculo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(212,175,55,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, gap: 4 },
  cardNick: { color: "#E8D5A3", fontSize: 15, fontWeight: "700" },
  cardBio:  { color: "#aaa", fontSize: 12 },
  cardBioVazio: { color: "#666", fontSize: 12, fontStyle: "italic" },

  btnAdicionar: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  btnAdicionado: {
    backgroundColor: "rgba(212,175,55,0.3)",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  btnAdicionarTexto: {
    color: "#1a1008",
    fontWeight: "700",
    fontSize: 12,
  },
});