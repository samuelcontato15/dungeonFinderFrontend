import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";

import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function Jogos() {
  const { user } = useAuth();

  const [jogos, setJogos] = useState<any[]>([]);

  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [capa, setCapa] = useState("");

  async function carregarJogos() {
    try {
      const response = await api.get("/jogos");

      setJogos(response.data);
    } catch {
      Alert.alert("Erro", "Erro ao carregar jogos");
    }
  }

  async function criarJogo() {
    try {
      await api.post(
        "/jogos",
        {
          nome,
          slug,
          capa,
        },
        {
          headers: {
            "X-Usuario-Id": user?.id,
          },
        }
      );

      Alert.alert("Sucesso", "Jogo criado");

      setNome("");
      setSlug("");
      setCapa("");

      carregarJogos();
    } catch {
      Alert.alert("Erro", "Erro ao criar jogo");
    }
  }

  async function deletarJogo(id: string) {
    try {
      await api.delete(`/jogos/${id}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      carregarJogos();

      Alert.alert("Sucesso", "Jogo removido");
    } catch {
      Alert.alert("Erro", "Erro ao deletar");
    }
  }

  async function editarJogo(id: string) {
    try {
      await api.put(
        `/jogos/${id}`,
        {
          nome: nome,
          slug: slug,
          capa: capa,
        },
        {
          headers: {
            "X-Usuario-Id": user?.id,
          },
        }
      );

      Alert.alert("Sucesso", "Jogo atualizado");

      carregarJogos();
    } catch {
      Alert.alert("Erro", "Erro ao editar");
    }
  }

  useEffect(() => {
    carregarJogos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Jogos
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#999"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Slug"
        placeholderTextColor="#999"
        value={slug}
        onChangeText={setSlug}
      />

      <TextInput
        style={styles.input}
        placeholder="Capa"
        placeholderTextColor="#999"
        value={capa}
        onChangeText={setCapa}
      />

      <TouchableOpacity
        style={styles.botaoCriar}
        onPress={criarJogo}
      >
        <Text style={styles.botaoTxt}>
          Criar jogo
        </Text>
      </TouchableOpacity>

      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.nome}>
                {item.nome}
              </Text>

              <Text style={styles.slug}>
                {item.slug}
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              <TouchableOpacity
                style={styles.editar}
                onPress={() => editarJogo(item.id)}
              >
                <Text style={styles.botaoTxt}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deletar}
                onPress={() => deletarJogo(item.id)}
              >
                <Text style={styles.botaoTxt}>
                  Deletar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },

  title: {
    color: "#D4AF37",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  botaoCriar: {
    backgroundColor: "#D4AF37",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  nome: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  slug: {
    color: "#AAA",
    marginTop: 4,
  },

  editar: {
    backgroundColor: "#1565C0",
    padding: 10,
    borderRadius: 8,
  },

  deletar: {
    backgroundColor: "#B00020",
    padding: 10,
    borderRadius: 8,
  },

  botaoTxt: {
    color: "#FFF",
    fontWeight: "bold",
  },
});