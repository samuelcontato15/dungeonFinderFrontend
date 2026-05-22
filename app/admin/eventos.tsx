// app/eventos.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
  ScrollView,
} from "react-native";

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
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
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoCriar} onPress={abrirCriacao}>
        <Ionicons name="add-circle" size={20} color="#111" />
        <Text style={styles.botaoCriarTexto}>Criar Evento</Text>
      </TouchableOpacity>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum evento cadastrado</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.descricao}>{item.descricao}</Text>
            </View>
            <TouchableOpacity onPress={() => editarEvento(item)}>
              <Ionicons name="create" size={24} color="#D4AF37" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deletarEvento(item.id)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ── Modal principal ── */}
      <Modal visible={modal} animationType="slide">
        <ScrollView
          style={styles.modal}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => setModal(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.tituloModal}>
            {editandoId ? "Editar Evento" : "Novo Evento"}
          </Text>

          <TextInput
            placeholder="Nome"
            placeholderTextColor="#777"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />

          <TextInput
            placeholder="Descrição"
            placeholderTextColor="#777"
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
          />

          <TextInput
            placeholder="Banner URL"
            placeholderTextColor="#777"
            style={styles.input}
            value={banner}
            onChangeText={setBanner}
          />

          {/* Seletor de jogo */}
          {!editandoId && (
            <TouchableOpacity
              style={styles.seletor}
              onPress={() => setModalJogo(true)}
            >
              <Ionicons
                name="game-controller-outline"
                size={18}
                color="#777"
              />
              <Text style={styles.seletorTexto}>
                {jogoSelecionado ? jogoSelecionado.nome : "Selecionar Jogo"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#777" />
            </TouchableOpacity>
          )}

          {/* Seletor de guilda */}
          {!editandoId && (
            <TouchableOpacity
              style={styles.seletor}
              onPress={() => setModalGuilda(true)}
            >
              <Ionicons name="shield-outline" size={18} color="#777" />
              <Text style={styles.seletorTexto}>
                {guildaSelecionada
                  ? guildaSelecionada.nome
                  : "Selecionar Guilda"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#777" />
            </TouchableOpacity>
          )}

          {/* Início */}
          <TouchableOpacity
            style={styles.seletor}
            onPress={abrirPickerInicio}
          >
            <Ionicons name="calendar-outline" size={18} color="#777" />
            <Text style={styles.seletorTexto}>
              Início: {formatarParaExibir(dataInicio)}
            </Text>
          </TouchableOpacity>

          {mostrarPickerInicio && Platform.OS === "ios" && (
            <DateTimePicker
              value={dataInicio}
              mode="datetime"
              display="inline"
              onChange={(_, date) => {
                setMostrarPickerInicio(false);
                if (date) setDataInicio(date);
              }}
            />
          )}

          {/* Fim */}
          <TouchableOpacity style={styles.seletor} onPress={abrirPickerFim}>
            <Ionicons name="calendar-outline" size={18} color="#777" />
            <Text style={styles.seletorTexto}>
              Fim: {formatarParaExibir(dataFim)}
            </Text>
          </TouchableOpacity>

          {mostrarPickerFim && Platform.OS === "ios" && (
            <DateTimePicker
              value={dataFim}
              mode="datetime"
              display="inline"
              onChange={(_, date) => {
                setMostrarPickerFim(false);
                if (date) setDataFim(date);
              }}
            />
          )}

          <TouchableOpacity style={styles.salvar} onPress={salvarEvento}>
            <Text style={styles.salvarTexto}>Salvar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* ── Modal seleção de jogo ── */}
      <Modal visible={modalJogo} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetCabecalho}>
              <Text style={styles.sheetTitulo}>Selecionar Jogo</Text>
              <TouchableOpacity onPress={() => setModalJogo(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
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
                    <Ionicons name="checkmark" size={20} color="#D4AF37" />
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
              <TouchableOpacity onPress={() => setModalGuilda(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
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
                    <Ionicons name="checkmark" size={20} color="#D4AF37" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingHorizontal: 20,
  },
  botaoVoltar: {
    marginBottom: 20,
  },
  botaoCriar: {
    backgroundColor: "#D4AF37",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  botaoCriarTexto: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  nome: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  descricao: {
    color: "#AAA",
    marginTop: 4,
  },
  vazio: {
    color: "#555",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
  modal: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
    paddingTop: 60,
  },
  tituloModal: {
    color: "#D4AF37",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  seletor: {
    backgroundColor: "#1E1E1E",
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  seletorTexto: {
    color: "#FFF",
    fontSize: 15,
    flex: 1,
  },
  salvar: {
    backgroundColor: "#D4AF37",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  salvarTexto: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 30,
  },
  sheetCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  sheetTitulo: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "#222",
  },
  sheetItemAtivo: {
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  sheetItemTexto: {
    color: "#FFF",
    fontSize: 16,
  },
});