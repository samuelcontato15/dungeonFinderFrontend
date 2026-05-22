import BarraNavegacao from "@/components/BarraNavegacao";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

type Jogo = { id: string; nome: string; capa: string | null };
type Usuario = { id: string; nick: string; fotoPerfil: string | null; bio: string | null };
type Guilda = { id: string; nome: string; banner: string | null; descricao: string | null };

type Resultados = {
  jogos: Jogo[];
  usuarios: Usuario[];
  guildas: Guilda[];
};

function SecaoResultados<T>({
  titulo,
  icone,
  itens,
  renderItem,
}: {
  titulo: string;
  icone: React.ComponentProps<typeof Ionicons>["name"];
  itens: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  if (itens.length === 0) return null;
  return (
    <View style={estilos.secao}>
      <View style={estilos.secaoTituloRow}>
        <Ionicons name={icone} size={14} color="#D4AF37" />
        <Text style={estilos.secaoTitulo}>{titulo}</Text>
      </View>
      {itens.map((item, i) => (
        <React.Fragment key={i}>{renderItem(item)}</React.Fragment>
      ))}
    </View>
  );
}

export default function Pesquisar() {
  const margens = useSafeAreaInsets();
  const roteador = useRouter();
  const refEntrada = useRef<TextInput>(null);

  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Resultados | null>(null);
  const [carregando, setCarregando] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => refEntrada.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const pesquisar = useCallback(async (termo: string) => {
    if (!termo.trim()) { setResultados(null); return; }
    try {
      setCarregando(true);
      const [jogosRes, usuariosRes, guildasRes] = await Promise.all([
        api.get("/jogos"),
        api.get("/usuarios"),
        api.get("/guildas"),
      ]);

      const t = termo.toLowerCase();
      setResultados({
        jogos: (jogosRes.data as Jogo[]).filter(j => j.nome.toLowerCase().includes(t)),
        usuarios: (usuariosRes.data as Usuario[]).filter(u =>
          u.nick.toLowerCase().includes(t) || (u.bio ?? "").toLowerCase().includes(t)
        ),
        guildas: (guildasRes.data as Guilda[]).filter(g =>
          g.nome.toLowerCase().includes(t) || (g.descricao ?? "").toLowerCase().includes(t)
        ),
      });
    } catch (err) {
      console.log("Erro ao pesquisar:", err);
    } finally {
      setCarregando(false);
    }
  }, []);

  function handleBusca(texto: string) {
    setBusca(texto);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pesquisar(texto), 400);
  }

  const semResultados =
    resultados &&
    resultados.jogos.length === 0 &&
    resultados.usuarios.length === 0 &&
    resultados.guildas.length === 0;

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      {/* CABEÇALHO */}
      <View style={[estilos.cabecalho, { paddingTop: margens.top + 12 }]}>
        <TouchableOpacity onPress={() => roteador.back()} style={estilos.botaoVoltar}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={estilos.campoBusca}>
          <Ionicons name="search-outline" size={18} color="#aaa" />
          <TextInput
            ref={refEntrada}
            placeholder="Buscar jogos, guildas, jogadores…"
            placeholderTextColor="#888"
            value={busca}
            onChangeText={handleBusca}
            style={estilos.entradaBusca}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => { setBusca(""); setResultados(null); }}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* RESULTADOS */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={estilos.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {busca.length === 0 && (
          <Text style={estilos.textoVazio}>Digite para pesquisar…</Text>
        )}

        {carregando && (
          <ActivityIndicator color="#D4AF37" style={{ marginTop: 40 }} />
        )}

        {!carregando && semResultados && (
          <Text style={estilos.textoVazio}>Nenhum resultado para "{busca}"</Text>
        )}

        {!carregando && resultados && (
          <>
            <SecaoResultados
              titulo="JOGOS"
              icone="game-controller-outline"
              itens={resultados.jogos}
              renderItem={(jogo: Jogo) => (
                <TouchableOpacity
                  style={estilos.card}
                  onPress={() => roteador.push({
                    pathname: "/telaJogo",
                    params: { jogoId: jogo.id },
                  } as any)}
                >
                  <View style={estilos.avatar}>
                    {jogo.capa ? (
                      <Image source={{ uri: jogo.capa }} style={estilos.avatarImg} />
                    ) : (
                      <Ionicons name="game-controller-outline" size={22} color="#D4AF37" />
                    )}
                  </View>
                  <Text style={estilos.cardNome}>{jogo.nome}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#555" />
                </TouchableOpacity>
              )}
            />

            <SecaoResultados
              titulo="JOGADORES"
              icone="person-outline"
              itens={resultados.usuarios}
              renderItem={(usuario: Usuario) => (
                <TouchableOpacity
                  style={estilos.card}
                  onPress={() => roteador.push(`/detalhes/usuario/${usuario.id}` as any)}
                >
                  <View style={estilos.avatar}>
                    {usuario.fotoPerfil ? (
                      <Image source={{ uri: usuario.fotoPerfil }} style={estilos.avatarImg} />
                    ) : (
                      <Ionicons name="person" size={22} color="#D4AF37" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.cardNome}>{usuario.nick}</Text>
                    {usuario.bio && (
                      <Text style={estilos.cardSub} numberOfLines={1}>{usuario.bio}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#555" />
                </TouchableOpacity>
              )}
            />

            <SecaoResultados
              titulo="GUILDAS"
              icone="shield-outline"
              itens={resultados.guildas}
              renderItem={(guilda: Guilda) => (
                <TouchableOpacity
                  style={estilos.card}
                  onPress={() => roteador.push(`/detalhes/guilda/${guilda.id}` as any)}
                >
                  <View style={estilos.avatar}>
                    {guilda.banner ? (
                      <Image source={{ uri: guilda.banner }} style={estilos.avatarImg} />
                    ) : (
                      <Ionicons name="shield-outline" size={22} color="#D4AF37" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.cardNome}>{guilda.nome}</Text>
                    {guilda.descricao && (
                      <Text style={estilos.cardSub} numberOfLines={1}>{guilda.descricao}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#555" />
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </ScrollView>

      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  botaoVoltar: { padding: 4 },
  campoBusca: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  entradaBusca: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
  textoVazio: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 60,
  },
  secao: { marginBottom: 24 },
  secaoTituloRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  secaoTitulo: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.15)",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2a2010",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
  },
  avatarImg: { width: "100%", height: "100%" },
  cardNome: {
    color: "#E8D5A3",
    fontSize: 14,
    fontWeight: "700",
  },
  cardSub: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
});