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
} from "react-native";

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
  const [modal, setModal] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [banner, setBanner] = useState("");
  const [inicioEm, setInicioEm] = useState("");
  const [fimEm, setFimEm] = useState("");

  const [editandoId, setEditandoId] =
    useState<string | null>(null);

  useEffect(() => {
    carregarEventos();
  }, []);

  async function carregarEventos() {
    try {
      const response = await api.get("/eventos");
      setEventos(response.data);
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível carregar eventos"
      );
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
    setInicioEm(evento.inicioEm);
    setFimEm(evento.fimEm);

    setEditandoId(evento.id);
    setModal(true);
  }

  function limparCampos() {
    setNome("");
    setDescricao("");
    setBanner("");
    setInicioEm("");
    setFimEm("");
    setEditandoId(null);
  }

  async function salvarEvento() {
    try {
      const body = {
        nome,
        descricao,
        banner,
        inicioEm,
        fimEm,
      };

      if (editandoId) {
        await api.put(`/eventos/${editandoId}`, body, {
          headers: {
            "X-Usuario-Id": user?.id,
          },
        });

        Alert.alert("Sucesso", "Evento atualizado");
      } else {
        await api.post(
          "/eventos?jogoId=UUID_DO_JOGO",
          body,
          {
            headers: {
              "X-Usuario-Id": user?.id,
            },
          }
        );

        Alert.alert("Sucesso", "Evento criado");
      }

      setModal(false);
      limparCampos();
      carregarEventos();
    } catch (error: any) {
      console.log(error.response?.data);

      Alert.alert(
        "Erro",
        JSON.stringify(error.response?.data)
      );
    }
  }

  async function deletarEvento(id: string) {
    try {
      await api.delete(`/eventos/${id}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      carregarEventos();
    } catch {
      Alert.alert("Erro", "Não foi possível deletar");
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 20,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#FFF"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoCriar}
        onPress={abrirCriacao}
      >
        <Ionicons
          name="add-circle"
          size={20}
          color="#111"
        />

        <Text style={styles.botaoCriarTexto}>
          Criar Evento
        </Text>
      </TouchableOpacity>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>
                {item.nome}
              </Text>

              <Text style={styles.descricao}>
                {item.descricao}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => editarEvento(item)}
            >
              <Ionicons
                name="create"
                size={24}
                color="#D4AF37"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deletarEvento(item.id)}
            >
              <Ionicons
                name="trash"
                size={24}
                color="red"
              />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modal} animationType="slide">
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => setModal(false)}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          <Text style={styles.tituloModal}>
            {editandoId
              ? "Editar Evento"
              : "Novo Evento"}
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

          <TextInput
            placeholder="Início"
            placeholderTextColor="#777"
            style={styles.input}
            value={inicioEm}
            onChangeText={setInicioEm}
          />

          <TextInput
            placeholder="Fim"
            placeholderTextColor="#777"
            style={styles.input}
            value={fimEm}
            onChangeText={setFimEm}
          />

          <TouchableOpacity
            style={styles.salvar}
            onPress={salvarEvento}
          >
            <Text style={styles.salvarTexto}>
              Salvar
            </Text>
          </TouchableOpacity>
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

  salvar: {
    backgroundColor: "#D4AF37",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  salvarTexto: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 16,
  },
});