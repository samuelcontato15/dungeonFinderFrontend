import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import api from "@/services/api";

export default function Relatorios() {
  const [usuarios, setUsuarios] = useState(0);
  const [jogos, setJogos] = useState(0);
  const [raids, setRaids] = useState(0);

  async function carregarDados() {
    try {
      const usuariosResponse = await api.get("/usuarios");
      const jogosResponse = await api.get("/jogos");
      const raidsResponse = await api.get("/raids");

      setUsuarios(usuariosResponse.data.length);
      setJogos(jogosResponse.data.length);
      setRaids(raidsResponse.data.length);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Relatórios
      </Text>

      <View style={styles.card}>
        <Text style={styles.numero}>
          {usuarios}
        </Text>

        <Text style={styles.label}>
          Usuários
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.numero}>
          {jogos}
        </Text>

        <Text style={styles.label}>
          Jogos
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.numero}>
          {raids}
        </Text>

        <Text style={styles.label}>
          Raids
        </Text>
      </View>
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
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#1E1E1E",
    padding: 25,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: "center",
  },

  numero: {
    color: "#D4AF37",
    fontSize: 42,
    fontWeight: "bold",
  },

  label: {
    color: "#FFF",
    marginTop: 10,
    fontSize: 18,
  },
});