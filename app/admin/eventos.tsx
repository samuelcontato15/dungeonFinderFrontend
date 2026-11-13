import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from "react-native";

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Botao, BotaoIcone, Cabecalho, Campo, Cartao, EstadoVazio, Tela, estiloCartao } from "@/components/ui";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { cores, fontes, raios, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Eventos() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [eventos, setEventos] = useState<any[]>([]);
  const [jogos, setJogos] = useState<any[]>([]);
  const [guildas, setGuildas] = useState<any[]>([]);

  const [modal, setModal] = useState(false);
  const [modalJogo, setModalJogo] = useState(false);
  const [modalGuilda, setModalGuilda] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [banner, setBanner] = useState("");
  const [jogoSelecionado, setJogoSelecionado] = useState<any>(null);
  const [guildaSelecionada, setGuildaSelecionada] = useState<any>(null);

  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [mostrarPickerInicio, setMostrarPickerInicio] = useState(false);
  const [mostrarPickerFim, setMostrarPickerFim] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarEventos();
    carregarJogos();
    carregarGuildas();
  }, []);

  async function carregarEventos() {
    try {
      const response = await api.get("/eventos");
      setEventos(response.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar eventos");
    }
  }

  async function carregarJogos() {
    try {
      const response = await api.get("/jogos");
      setJogos(response.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar jogos");
    }
  }

  async function carregarGuildas() {
    try {
      const response = await api.get("/guildas");
      setGuildas(response.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar guildas");
    }
  }

  function abrirCriacao() {
    limparCampos();
    setModal(true);
  }

  function editarEvento(evento: any) {
    setNome(evento.nome);
    setDescricao(evento.descricao);
    setBanner(evento.banner);
    setDataInicio(new Date(evento.inicioEm));
    setDataFim(new Date(evento.fimEm));
    setJogoSelecionado(jogos.find((j) => j.id === evento.jogoId) ?? null);
    setGuildaSelecionada(guildas.find((g) => g.id === evento.guildaId) ?? null);
    setEditandoId(evento.id);
    setModal(true);
  }

  function limparCampos() {
    setNome("");
    setDescricao("");
    setBanner("");
    setDataInicio(new Date());
    setDataFim(new Date());
    setJogoSelecionado(null);
    setGuildaSelecionada(null);
    setEditandoId(null);
  }

  function formatarParaBackend(date: Date): string {
    return date.toISOString().slice(0, 19);
  }

  function formatarParaExibir(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function abrirPickerInicio() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: dataInicio,
        mode: "date",
        onChange: (_, date) => {
          if (!date) return;
          DateTimePickerAndroid.open({
            value: date,
            mode: "time",
            onChange: (_, time) => {
              if (time) setDataInicio(time);
            },
          });
        },
      });
    } else {
      setMostrarPickerInicio(true);
    }
  }

  function abrirPickerFim() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: dataFim,
        mode: "date",
        onChange: (_, date) => {
          if (!date) return;
          DateTimePickerAndroid.open({
            value: date,
            mode: "time",
            onChange: (_, time) => {
              if (time) setDataFim(time);
            },
          });
        },
      });
    } else {
      setMostrarPickerFim(true);
    }
  }

  async function salvarEvento() {
    if (!editandoId && !jogoSelecionado) {
      Alert.alert("Atenção", "Selecione um jogo para o evento");
      return;
    }

    if (!editandoId && !guildaSelecionada) {
      Alert.alert("Atenção", "Selecione uma guilda para o evento");
      return;
    }

    try {
      const body = {
        nome,
        descricao,
        banner,
        inicioEm: formatarParaBackend(dataInicio),
        fimEm: formatarParaBackend(dataFim),
      };

      if (editandoId) {
        await api.put(`/eventos/${editandoId}`, body, {
          headers: { "X-Usuario-Id": user?.id },
        });
        Alert.alert("Sucesso", "Evento atualizado");
      } else {
        await api.post(
          `/eventos?jogoId=${jogoSelecionado.id}&guildaId=${guildaSelecionada.id}`,
          body,
          { headers: { "X-Usuario-Id": user?.id } }
        );
        Alert.alert("Sucesso", "Evento criado");
      }

      setModal(false);
      limparCampos();
      carregarEventos();
    } catch (error: any) {
      console.log(error.response?.data);
      Alert.alert("Erro", JSON.stringify(error.response?.data));
    }
  }

  async function deletarEvento(id: string) {
    try {
      await api.delete(`/eventos/${id}`, {
        headers: { "X-Usuario-Id": user?.id },
      });
      carregarEventos();
    } catch {
      Alert.alert("Erro", "Não foi possível deletar");
    }
  }

  return (
    <Tela>
      <Cabecalho titulo="Eventos" subtitulo="Festivais e desafios do reino" />

      <View style={styles.container}>
        <Botao titulo="Criar Evento" icone="add-circle" onPress={abrirCriacao} />

        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: insets.bottom + 30 }}
          ListEmptyComponent={
            <EstadoVazio icone="calendar-outline" texto="Nenhum evento cadastrado" />
          }
          renderItem={({ item }) => (
            <View style={[estiloCartao.base, estiloCartao.linha]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={tipo.suave}>{item.descricao}</Text>
              </View>
              <BotaoIcone icone="create-outline" tamanho={38} onPress={() => editarEvento(item)} />
              <BotaoIcone
                icone="trash-outline"
                tamanho={38}
                cor={cores.vinhoClaro}
                style={styles.btnExcluir}
                onPress={() => deletarEvento(item.id)}
              />
            </View>
          )}
        />
      </View>

      {/* ── Modal principal ── */}
      <Modal visible={modal} animationType="slide">
        <Tela>
          <Cabecalho
            titulo={editandoId ? "Editar Evento" : "Novo Evento"}
            aoVoltar={() => setModal(false)}
          />
          <ScrollView
            contentContainerStyle={styles.modal}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Cartao style={{ gap: 14, padding: 18 }}>
              <Campo label="Nome" placeholder="Nome" value={nome} onChangeText={setNome} />
              <Campo label="Descrição" placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
              <Campo label="Banner" icone="link-outline" placeholder="Banner URL" value={banner} onChangeText={setBanner} autoCapitalize="none" />

              {/* Seletor de jogo */}
              {!editandoId && (
                <TouchableOpacity
                  style={styles.seletor}
                  onPress={() => setModalJogo(true)}
                >
                  <Ionicons name="game-controller-outline" size={18} color={cores.ouro} />
                  <Text style={styles.seletorTexto}>
                    {jogoSelecionado ? jogoSelecionado.nome : "Selecionar Jogo"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={cores.textoApagado} />
                </TouchableOpacity>
              )}

              {/* Seletor de guilda */}
              {!editandoId && (
                <TouchableOpacity
                  style={styles.seletor}
                  onPress={() => setModalGuilda(true)}
                >
                  <Ionicons name="shield-outline" size={18} color={cores.ouro} />
                  <Text style={styles.seletorTexto}>
                    {guildaSelecionada
                      ? guildaSelecionada.nome
                      : "Selecionar Guilda"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={cores.textoApagado} />
                </TouchableOpacity>
              )}

              {/* Início */}
              <TouchableOpacity
                style={styles.seletor}
                onPress={abrirPickerInicio}
              >
                <Ionicons name="calendar-outline" size={18} color={cores.ouro} />
                <Text style={styles.seletorTexto}>
                  Início: {formatarParaExibir(dataInicio)}
                </Text>
              </TouchableOpacity>

              {mostrarPickerInicio && Platform.OS === "ios" && (
                <DateTimePicker
                  value={dataInicio}
                  mode="datetime"
                  display="inline"
                  themeVariant="dark"
                  onChange={(_, date) => {
                    setMostrarPickerInicio(false);
                    if (date) setDataInicio(date);
                  }}
                />
              )}

              {/* Fim */}
              <TouchableOpacity style={styles.seletor} onPress={abrirPickerFim}>
                <Ionicons name="hourglass-outline" size={18} color={cores.ouro} />
                <Text style={styles.seletorTexto}>
                  Fim: {formatarParaExibir(dataFim)}
                </Text>
              </TouchableOpacity>

              {mostrarPickerFim && Platform.OS === "ios" && (
                <DateTimePicker
                  value={dataFim}
                  mode="datetime"
                  display="inline"
                  themeVariant="dark"
                  onChange={(_, date) => {
                    setMostrarPickerFim(false);
                    if (date) setDataFim(date);
                  }}
                />
              )}
            </Cartao>

            <Botao titulo="Salvar" icone="save-outline" onPress={salvarEvento} />
          </ScrollView>
        </Tela>
      </Modal>

      {/* ── Modal seleção de jogo ── */}
      <Modal visible={modalJogo} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetCabecalho}>
              <Text style={styles.sheetTitulo}>Selecionar Jogo</Text>
              <BotaoIcone icone="close" tamanho={34} onPress={() => setModalJogo(false)} />
            </View>
            <FlatList
              data={jogos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sheetItem,
                    jogoSelecionado?.id === item.id && styles.sheetItemAtivo,
                  ]}
                  onPress={() => {
                    setJogoSelecionado(item);
                    setModalJogo(false);
                  }}
                >
                  <Text style={styles.sheetItemTexto}>{item.nome}</Text>
                  {jogoSelecionado?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color={cores.ouro} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ── Modal seleção de guilda ── */}
      <Modal visible={modalGuilda} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetCabecalho}>
              <Text style={styles.sheetTitulo}>Selecionar Guilda</Text>
              <BotaoIcone icone="close" tamanho={34} onPress={() => setModalGuilda(false)} />
            </View>
            <FlatList
              data={guildas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sheetItem,
                    guildaSelecionada?.id === item.id && styles.sheetItemAtivo,
                  ]}
                  onPress={() => {
                    setGuildaSelecionada(item);
                    setModalGuilda(false);
                  }}
                >
                  <Text style={styles.sheetItemTexto}>{item.nome}</Text>
                  {guildaSelecionada?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color={cores.ouro} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  nome: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 15, letterSpacing: 0.6 },
  btnExcluir: { backgroundColor: "rgba(142,42,42,0.25)", borderColor: "rgba(224,98,90,0.4)" },
  modal: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 40, gap: 18 },
  seletor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    backgroundColor: cores.campo,
    borderRadius: raios.m,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  seletorTexto: { flex: 1, fontFamily: fontes.corpo, fontSize: 17, color: cores.texto },
  overlay: { flex: 1, backgroundColor: "rgba(5,3,2,0.8)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: cores.madeira800,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: cores.bordaForte,
    maxHeight: "60%",
    paddingBottom: 30,
  },
  sheetCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  sheetTitulo: { ...tipo.titulo, fontSize: 17 },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: raios.m,
    backgroundColor: cores.cartaoClaro,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sheetItemAtivo: { borderColor: cores.ouro },
  sheetItemTexto: { ...tipo.subtitulo },
});
