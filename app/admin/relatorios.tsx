import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Cabecalho, Tela } from "@/components/ui";
import api from "@/services/api";
import { cores, fontes, raios, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";

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

  const cartoes = [
    { rotulo: "Usuários", valor: usuarios, icone: "people" },
    { rotulo: "Jogos", valor: jogos, icone: "game-controller" },
    { rotulo: "Raids", valor: raids, icone: "skull" },
  ] as const;

  return (
    <Tela>
      <Cabecalho titulo="Relatórios" subtitulo="Os números da plataforma" />

      <View style={styles.container}>
        {cartoes.map((c) => (
          <View key={c.rotulo} style={styles.card}>
            <View style={styles.icone}>
              <Ionicons name={c.icone} size={26} color={cores.ouro} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={tipo.rotulo}>{c.rotulo}</Text>
              <Text style={styles.numero}>{c.valor}</Text>
            </View>
          </View>
        ))}
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 6, gap: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    backgroundColor: cores.cartao,
    padding: 20,
    borderRadius: raios.g,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  icone: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: cores.borda,
    justifyContent: "center",
    alignItems: "center",
  },
  numero: { fontFamily: fontes.tituloBlack, color: cores.ouroClaro, fontSize: 38, lineHeight: 46 },
});
