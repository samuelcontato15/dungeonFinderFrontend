import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";

import { Botao, Cabecalho, EstadoVazio, Tela, estiloCartao } from "@/components/ui";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { cores, fontes, tipo } from "@/theme/tema";

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
    <Tela>
      <Cabecalho titulo="Raids" subtitulo="Missões abertas em todo o reino" />

      <FlatList
        data={raids}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <EstadoVazio icone="skull-outline" texto="Nenhuma raid cadastrada" />
        }
        renderItem={({ item }) => (
          <View style={[estiloCartao.base, estiloCartao.linha]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              {!!item.descricao && <Text style={tipo.suave}>{item.descricao}</Text>}
            </View>

            <Botao
              titulo="Deletar"
              icone="trash-outline"
              variante="perigo"
              pequeno
              onPress={() => deletarRaid(item.id)}
            />
          </View>
        )}
      />
    </Tela>
  );
}

const styles = StyleSheet.create({
  lista: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 40, gap: 10 },
  nome: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 15, letterSpacing: 0.6 },
});
