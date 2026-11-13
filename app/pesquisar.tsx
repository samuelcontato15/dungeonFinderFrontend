import BarraNavegacao from "@/components/BarraNavegacao";
import { Avatar, BotaoIcone, Campo, Carregando, EstadoVazio, Tela, TituloSecao, estiloCartao } from "@/components/ui";
import api from "@/services/api";
import { cores, fontes, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
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

type Dados = {
  jogos: Jogo[];
  usuarios: Usuario[];
  guildas: Guilda[];
};

function SecaoResultados<T>({
  titulo,
  itens,
  renderItem,
}: {
  titulo: string;
  itens: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  if (itens.length === 0) return null;
  return (
    <View style={estilos.secao}>
      <TituloSecao
        titulo={titulo}
        direita={<Text style={estilos.contagem}>{itens.length}</Text>}
      />
      <View style={{ gap: 8 }}>
        {itens.map((item, i) => (
          <React.Fragment key={i}>{renderItem(item)}</React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default function Pesquisar() {
  const margens = useSafeAreaInsets();
  const roteador = useRouter();
  const refEntrada = useRef<TextInput>(null);

  const [busca, setBusca] = useState("");
  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => refEntrada.current?.focus(), 100);

    async function carregarDados() {
      try {
        const [jogosRes, usuariosRes, guildasRes] = await Promise.all([
          api.get("/jogos"),
          api.get("/usuarios"),
          api.get("/guildas"),
        ]);
        setDados({
          jogos: jogosRes.data as Jogo[],
          usuarios: usuariosRes.data as Usuario[],
          guildas: guildasRes.data as Guilda[],
        });
      } catch (err) {
        console.log("Erro ao carregar dados:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
    return () => clearTimeout(t);
  }, []);

  const filtrar = useCallback((termo: string): Dados | null => {
    if (!dados) return null;
    const t = termo.toLowerCase();
    return {
      jogos: dados.jogos.filter(j => j.nome.toLowerCase().includes(t)),
      usuarios: dados.usuarios.filter(u =>
        u.nick.toLowerCase().includes(t) || (u.bio ?? "").toLowerCase().includes(t)
      ),
      guildas: dados.guildas.filter(g =>
        g.nome.toLowerCase().includes(t) || (g.descricao ?? "").toLowerCase().includes(t)
      ),
    };
  }, [dados]);

  const resultados = busca.trim() ? filtrar(busca) : dados;

  const semResultados =
    resultados &&
    resultados.jogos.length === 0 &&
    resultados.usuarios.length === 0 &&
    resultados.guildas.length === 0;

  return (
    <Tela>
      <View style={[estilos.cabecalho, { paddingTop: margens.top + 12 }]}>
        <BotaoIcone icone="chevron-back" onPress={() => roteador.back()} />
        <View style={{ flex: 1 }}>
          <Campo
            ref={refEntrada}
            icone="search-outline"
            placeholder="Buscar jogos, guildas, jogadores…"
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            direita={
              busca.length > 0 ? (
                <TouchableOpacity onPress={() => setBusca("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color={cores.textoSuave} />
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={estilos.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {carregando && <View style={{ marginTop: 60 }}><Carregando /></View>}

        {!carregando && semResultados && (
          <EstadoVazio
            icone="search-outline"
            texto={`Nenhum resultado para "${busca}"`}
            dica="Tente outro nome ou confira a grafia."
          />
        )}

        {!carregando && resultados && (
          <>
            <SecaoResultados
              titulo="Jogos"
              itens={resultados.jogos}
              renderItem={(jogo: Jogo) => (
                <TouchableOpacity
                  style={[estiloCartao.base, estiloCartao.linha, estilos.card]}
                  activeOpacity={0.8}
                  onPress={() => roteador.push({
                    pathname: "/telaJogo",
                    params: { jogoId: jogo.id },
                  } as any)}
                >
                  <Avatar uri={jogo.capa} tamanho={46} icone="game-controller-outline" quadrado />
                  <Text style={[estilos.cardNome, { flex: 1 }]} numberOfLines={1}>{jogo.nome}</Text>
                  <Ionicons name="chevron-forward" size={16} color={cores.ouroEscuro} />
                </TouchableOpacity>
              )}
            />

            <SecaoResultados
              titulo="Guildas"
              itens={resultados.guildas}
              renderItem={(guilda: Guilda) => (
                <TouchableOpacity
                  style={[estiloCartao.base, estiloCartao.linha, estilos.card]}
                  activeOpacity={0.8}
                  onPress={() => roteador.push(`/detalhes/guilda/${guilda.id}` as any)}
                >
                  <Avatar uri={guilda.banner} tamanho={46} icone="shield-outline" quadrado />
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.cardNome} numberOfLines={1}>{guilda.nome}</Text>
                    {guilda.descricao && (
                      <Text style={tipo.suave} numberOfLines={1}>{guilda.descricao}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={cores.ouroEscuro} />
                </TouchableOpacity>
              )}
            />

            <SecaoResultados
              titulo="Jogadores"
              itens={resultados.usuarios}
              renderItem={(usuario: Usuario) => (
                <TouchableOpacity
                  style={[estiloCartao.base, estiloCartao.linha, estilos.card]}
                  activeOpacity={0.8}
                  onPress={() => roteador.push(`/detalhes/usuario/${usuario.id}` as any)}
                >
                  <Avatar uri={usuario.fotoPerfil} tamanho={46} />
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.cardNome} numberOfLines={1}>{usuario.nick}</Text>
                    {usuario.bio && (
                      <Text style={tipo.suave} numberOfLines={1}>{usuario.bio}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={cores.ouroEscuro} />
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </ScrollView>

      <BarraNavegacao />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 10 },
  secao: { marginBottom: 26 },
  contagem: { fontFamily: fontes.corpoItalico, color: cores.textoSuave, fontSize: 14 },
  card: { padding: 10 },
  cardNome: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 14, letterSpacing: 0.5 },
});
