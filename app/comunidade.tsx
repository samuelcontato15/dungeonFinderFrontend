import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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

type UsuarioAPI = { id: string; nick: string; fotoPerfil: string | null; bio: string | null; };
type GuildaAPI = { id: string; nome: string; descricao: string | null; banner: string | null; };

export default function Comunidade() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();

  const [aba, setAba] = useState<"usuarios" | "guildas">("usuarios");
  const [usuarios, setUsuarios] = useState<UsuarioAPI[]>([]);
  const [guildas, setGuildas] = useState<GuildaAPI[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    setCarregando(true);
    try {
      // Busca paralela: Usuários, Amizades e TODAS as Guildas
      const [usuariosRes, amizadesRes, guildasRes] = await Promise.all([
        api.get("/usuarios"),
        user?.id ? api.get(`/amizades/usuario/${user.id}`) : Promise.resolve({ data: [] }),
        api.get("/guildas") // <--- ROTA GERAL PARA LISTAR TODAS
      ]);

      // Processa amigos
      const amizades = amizadesRes.data || [];
      const amigosIds = amizades
        .filter((amz: any) => amz.status === "ACEITO")
        .map((amz: any) => (amz.solicitante.id === user?.id ? amz.destinatario.id : amz.solicitante.id));

      setUsuarios(usuariosRes.data.filter((u: UsuarioAPI) => u.id !== user?.id && amigosIds.includes(u.id)));
      
      // Carrega a lista completa de guildas do servidor
      setGuildas(guildasRes.data || []);

    } catch (err) {
      console.log("Erro ao carregar comunidade:", err);
    } finally {
      setCarregando(false);
    }
  };

  // Filtros
  const usuariosFiltrados = usuarios.filter((u) => u.nick.toLowerCase().includes(busca.toLowerCase()));
  const guildasFiltradas = guildas.filter((g) => g.nome.toLowerCase().includes(busca.toLowerCase()));

  // Renderizadores
  const renderUsuario = ({ item }: { item: UsuarioAPI }) => (
    <TouchableOpacity style={[estilos.card, estilos.cardAmigo]} onPress={() => router.push(`/detalhes/usuario/${item.id}` as any)}>
      <View style={estilos.avatarCirculo}>
        {item.fotoPerfil ? <Image source={{ uri: item.fotoPerfil }} style={estilos.avatarImg} /> : <Ionicons name="person" size={26} color="#E8D5A3" />}
      </View>
      <View style={estilos.cardInfo}>
        <Text style={estilos.cardNome}>{item.nick}</Text>
        <Text style={estilos.cardSub}>{item.bio || "Sem bio"}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGuilda = ({ item }: { item: GuildaAPI }) => (
    <TouchableOpacity style={estilos.card} activeOpacity={0.8} onPress={() => router.push(`/detalhes/guilda/${item.id}` as any)}>
      <View style={estilos.avatarCirculo}>
        {item.banner ? <Image source={{ uri: item.banner }} style={estilos.avatarImg} /> : <Ionicons name="shield" size={26} color="#E8D5A3" />}
      </View>
      <View style={estilos.cardInfo}>
        <Text style={estilos.cardNome}>{item.nome}</Text>
        <Text style={estilos.cardSub}>{item.descricao || "Sem descrição"}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo}>
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.container, { paddingTop: insets.top + 10 }]}>
        <Text style={estilos.titulo}>COMUNIDADE</Text>

        <View style={estilos.abas}>
          <TouchableOpacity style={[estilos.aba, aba === "usuarios" && estilos.abaAtiva]} onPress={() => { setAba("usuarios"); setBusca(""); }}>
            <Ionicons name="people" size={16} color={aba === "usuarios" ? "#1a1008" : "#E8D5A3"} />
            <Text style={[estilos.abaTxt, aba === "usuarios" && estilos.abaTxtAtiva]}>Amigos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[estilos.aba, aba === "guildas" && estilos.abaAtiva]} onPress={() => { setAba("guildas"); setBusca(""); }}>
            <Ionicons name="shield" size={16} color={aba === "guildas" ? "#1a1008" : "#E8D5A3"} />
            <Text style={[estilos.abaTxt, aba === "guildas" && estilos.abaTxtAtiva]}>Guildas</Text>
          </TouchableOpacity>
        </View>

        <View style={estilos.inputContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput style={estilos.input} placeholder={aba === "usuarios" ? "Buscar amigo..." : "Buscar guilda..."} placeholderTextColor="#888" value={busca} onChangeText={setBusca} />
        </View>

        {carregando ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 40 }} />
        ) : (
       
<FlatList<any> 
  data={aba === "usuarios" ? usuariosFiltrados : guildasFiltradas}
  keyExtractor={(item) => item.id}
  renderItem={aba === "usuarios" ? renderUsuario : renderGuilda}
  contentContainerStyle={{ gap: 10, paddingBottom: 120, paddingTop: 10 }}
  showsVerticalScrollIndicator={false}
  ListEmptyComponent={
    <Text style={estilos.vazio}>
      {busca ? "Nenhum resultado encontrado" : "Nenhum dado cadastrado"}
    </Text>
  }
/>
        )}
      </View>

      {aba === "guildas" && (
        <TouchableOpacity style={[estilos.fab, { bottom: insets.bottom + 90 }]} onPress={() => router.push("/guildascriar")}>
          <Ionicons name="add" size={32} color="#1a1008" />
        </TouchableOpacity>
      )}

      <View style={estilos.footer}><BarraNavegacao /></View>
    </ImageBackground>
  );
}


const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.65)" },
  container: { flex: 1, paddingHorizontal: 20 },
  titulo: { color: "#E8D5A3", fontSize: 22, fontWeight: "900", letterSpacing: 2, marginBottom: 16 },
  abas: { flexDirection: "row", gap: 10, marginBottom: 10 },
  aba: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#D4AF37" },
  abaAtiva: { backgroundColor: "#D4AF37" },
  abaTxt: { color: "#E8D5A3", fontWeight: "700", fontSize: 14 },
  abaTxtAtiva: { color: "#1a1008" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(232,213,163,0.85)", borderRadius: 8, paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#1a1008" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "rgba(212,175,55,0.2)", gap: 12 },
  cardAmigo: { borderColor: "#D4AF37", borderWidth: 2, shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 8 },
  avatarCirculo: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#444", justifyContent: "center", alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: "#E8D5A3" },
  avatarImg: { width: "100%", height: "100%" },
  cardInfo: { flex: 1, gap: 4 },
  cardNome: { color: "#E8D5A3", fontSize: 15, fontWeight: "700" },
  cardSub: { color: "#aaa", fontSize: 12 },
  amigoIndicator: { backgroundColor: "rgba(212,175,55,0.2)", borderRadius: 12, padding: 4 },
  vazio: { color: "#999", fontStyle: "italic", textAlign: "center", marginTop: 40 },

  // Estilo do Botão de + (Floating Action Button)
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: "#FFF"
  },

  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },
});