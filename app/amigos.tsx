import { Avatar, Botao, Cabecalho, Campo, Carregando, EstadoVazio, Selo, Tela, estiloCartao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
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
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    if (!user?.id) return;
    try {
      const [aceitasRes, enviadasRes] = await Promise.all([
        api.get<Amizade[]>(`/amizades/usuario/${user.id}`),
        api.get<Amizade[]>(`/amizades/usuario/${user.id}/enviadas`)
      ]);

      const idsAceitos = aceitasRes.data.map((amz) =>
        amz.solicitante.id === user.id ? amz.destinatario.id : amz.solicitante.id
      );
      setAmizades(idsAceitos);

      const idsEnviados = enviadasRes.data.map((amz) => amz.destinatario.id);
      setAdicionados(idsEnviados);
    } catch (e) {
      console.log("Erro ao carregar dados", e);
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
        await api.post(
          `/guildas/${guildaId}/membros/${destinatarioId}/convidar`,
          {},
          {
            headers: {
              ...api.defaults.headers.common,
              "X-Usuario-Id": user.id,
            },
          }
        );
        Alert.alert("Convite enviado!", "Pedido para entrar na guilda enviado.");
      } else {
        await api.post(
          `/amizades?destinatarioId=${destinatarioId}`,
          {},
          {
            headers: {
              ...api.defaults.headers.common,
              "X-Usuario-Id": user.id,
            },
          }
        );
        Alert.alert("Solicitação enviada!", "Pedido de amizade enviado com sucesso.");
      }

      setAdicionados((prev) => [...prev, destinatarioId]);
    } catch (error: any) {
      Alert.alert("Erro", error?.response?.data?.message || "Não foi possível enviar a solicitação.");
    } finally {
      setAdicionando(null);
    }
  }

  return (
    <Tela>
      <Cabecalho
        titulo={guildaId ? "Convidar para Guilda" : "Buscar Amigos"}
        subtitulo={guildaId ? "Chame aliados para a sua guilda" : "Encontre companheiros de aventura"}
      />

      <View style={[estilos.container, { paddingBottom: insets.bottom + 20 }]}>
        <View style={estilos.buscaRow}>
          <View style={{ flex: 1 }}>
            <Campo
              icone="search-outline"
              placeholder="Nome de usuário..."
              value={busca}
              onChangeText={setBusca}
              autoCapitalize="none"
              onSubmitEditing={handleBuscar}
              returnKeyType="search"
              direita={
                busca.length > 0 ? (
                  <TouchableOpacity onPress={() => { setBusca(""); setResultados([]); }} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={cores.textoSuave} />
                  </TouchableOpacity>
                ) : undefined
              }
            />
          </View>
          <Botao titulo="Buscar" onPress={handleBuscar} style={{ paddingHorizontal: 16 }} />
        </View>

        {carregando && <View style={{ marginTop: 40 }}><Carregando /></View>}

        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            carregando ? null : (
              <EstadoVazio
                icone="compass-outline"
                texto="Digite um nome e toque em Buscar."
              />
            )
          }
          renderItem={({ item }) => {
            const jaAdicionado = adicionados.includes(item.id);
            const esteAdicionando = adicionando === item.id;
            const jaEhAmigo = !guildaId && amizades.includes(item.id);

            return (
              <View style={[estiloCartao.base, estiloCartao.linha]}>
                <Avatar uri={item.fotoPerfil} tamanho={54} />

                <View style={estilos.cardInfo}>
                  <Text style={estilos.cardNick} numberOfLines={1}>{item.nick}</Text>
                  {item.bio ? <Text style={tipo.suave} numberOfLines={1}>{item.bio}</Text> : <Text style={tipo.italico}>Sem bio</Text>}
                </View>

                {jaEhAmigo ? (
                  <Selo texto="Amigos" icone="heart" tom="musgo" />
                ) : (
                  <Botao
                    titulo={jaAdicionado ? "Enviado ✓" : guildaId ? "Convidar" : "Adicionar"}
                    variante={jaAdicionado ? "secundario" : "primario"}
                    pequeno
                    onPress={() => !jaAdicionado && handleAdicionar(item.id)}
                    disabled={jaAdicionado}
                    carregando={esteAdicionando}
                    style={{ minWidth: 96 }}
                  />
                )}
              </View>
            );
          }}
        />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  buscaRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  cardInfo: { flex: 1, gap: 2 },
  cardNick: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 15, letterSpacing: 0.6 },
});
