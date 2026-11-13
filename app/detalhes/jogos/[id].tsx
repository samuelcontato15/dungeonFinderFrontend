import BarraNavegacao from "@/components/BarraNavegacao";
import { Abas, Avatar, Campo, Carregando, EstadoVazio, Selo, Tela, estiloCartao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { brilhoOuro, cores, fontes, gradientes, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
      const [usuariosRes, amizadesRes, guildasRes] = await Promise.all([
        api.get("/usuarios"),
        user?.id ? api.get(`/amizades/usuario/${user.id}`) : Promise.resolve({ data: [] }),
        user?.id ? api.get(`/guildas/usuario/${user.id}`) : Promise.resolve({ data: [] })
      ]);
      const amizades = amizadesRes.data || [];
      const amigosIds = amizades
        .filter((amz: any) => amz.status === "ACEITO")
        .map((amz: any) => (amz.solicitante.id === user?.id ? amz.destinatario.id : amz.solicitante.id));

      setUsuarios(usuariosRes.data.filter((u: UsuarioAPI) => u.id !== user?.id && amigosIds.includes(u.id)));

      setGuildas(guildasRes.data || []);

    } catch (err) {
      console.log("Erro ao carregar comunidade:", err);
    } finally {
      setCarregando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => u.nick.toLowerCase().includes(busca.toLowerCase()));
  const guildasFiltradas = guildas.filter((g) => g.nome.toLowerCase().includes(busca.toLowerCase()));

  const renderUsuario = ({ item }: { item: UsuarioAPI }) => (
    <TouchableOpacity style={[estiloCartao.base, estiloCartao.linha]} activeOpacity={0.8} onPress={() => router.push(`/detalhes/usuario/${item.id}` as any)}>
      <Avatar uri={item.fotoPerfil} tamanho={52} destaque />
      <View style={estilos.cardInfo}>
        <Text style={estilos.cardNome} numberOfLines={1}>{item.nick}</Text>
        <Text style={tipo.suave} numberOfLines={2}>{item.bio || "Sem bio"}</Text>
      </View>
      <Selo texto="Amigo" icone="heart" />
    </TouchableOpacity>
  );

  const renderGuilda = ({ item }: { item: GuildaAPI }) => (
    <TouchableOpacity style={[estiloCartao.base, estiloCartao.linha]} activeOpacity={0.8} onPress={() => router.push(`/detalhes/guilda/${item.id}` as any)}>
      <Avatar uri={item.banner} tamanho={52} icone="shield" quadrado />
      <View style={estilos.cardInfo}>
        <Text style={estilos.cardNome} numberOfLines={1}>{item.nome}</Text>
        <Text style={tipo.suave} numberOfLines={2}>{item.descricao || "Sem descrição"}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={cores.ouro} />
    </TouchableOpacity>
  );

  return (
    <Tela>
      <View style={[estilos.container, { paddingTop: insets.top + 16 }]}>
        <Text style={estilos.titulo}>Comunidade</Text>
        <Text style={[tipo.italico, { marginBottom: 16 }]}>Seus aliados e as suas guildas.</Text>

        <Abas
          valor={aba}
          aoMudar={(chave) => { setAba(chave); setBusca(""); }}
          opcoes={[
            { chave: "usuarios", rotulo: "Amigos", icone: "people" },
            { chave: "guildas", rotulo: "Guildas", icone: "shield" },
          ]}
        />

        <View style={{ marginTop: 12 }}>
          <Campo
            icone="search-outline"
            placeholder={aba === "usuarios" ? "Buscar amigo..." : "Buscar guilda..."}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {carregando ? (
          <Carregando />
        ) : (
          <FlatList<any>
            data={aba === "usuarios" ? usuariosFiltrados : guildasFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={aba === "usuarios" ? renderUsuario : renderGuilda}
            contentContainerStyle={{ gap: 10, paddingBottom: 130, paddingTop: 14 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EstadoVazio
                icone={aba === "usuarios" ? "people-outline" : "shield-outline"}
                texto={busca ? "Nenhum resultado encontrado" : "Nenhum dado cadastrado"}
              />
            }
          />
        )}
      </View>

      {aba === "guildas" && (
        <TouchableOpacity style={[estilos.fab, { bottom: insets.bottom + 92 }]} activeOpacity={0.85} onPress={() => router.push("/guildascriar")}>
          <LinearGradient colors={gradientes.ouro} style={StyleSheet.absoluteFill} />
          <Ionicons name="add" size={30} color={cores.tinta} />
        </TouchableOpacity>
      )}

      <View style={estilos.footer}><BarraNavegacao /></View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  titulo: { ...tipo.display, fontSize: 26, color: cores.pergaminho, letterSpacing: 2 },
  cardInfo: { flex: 1, gap: 2 },
  cardNome: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 15, letterSpacing: 0.6 },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: cores.ouroClaro,
    ...brilhoOuro,
  },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
