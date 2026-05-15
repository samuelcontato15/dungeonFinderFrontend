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

export default function Raids() {
  const { user } = useAuth();

  const [raids, setRaids] = useState<any[]>([]);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  async function carregarRaids() {
    try {
      const response = await api.get("/raids");
      setRaids(response.data);
    } catch {
      Alert.alert("Erro", "Erro ao carregar raids");
    }
  }

  async function deletarRaid(id: string) {
    try {
      await api.delete(`/raids/${id}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      carregarRaids();

      Alert.alert("Sucesso", "Raid deletada");
    } catch {
      Alert.alert("Erro", "Erro ao deletar");
    }
  }

  useEffect(() => {
    carregarRaids();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raids</Text>

      <FlatList
        data={raids}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.texto}>
                {item.descricao}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deletar}
              onPress={() => deletarRaid(item.id)}
            >
              <Text style={styles.botaoTxt}>
                Deletar
              </Text>
            </TouchableOpacity>
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

  texto: {
    color: "#AAA",
    marginTop: 4,
    width: 200,
  },

  deletar: {
    backgroundColor: "#B00020",
    padding: 10,
    borderRadius: 8,
    height: 40,
  },

  botaoTxt: {
    color: "#FFF",
    fontWeight: "bold",
  },
});