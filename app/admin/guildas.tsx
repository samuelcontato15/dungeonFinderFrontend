// app/guildas.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from "react-native";

import { Botao, BotaoIcone, Cabecalho, Campo, Cartao, EstadoVazio, Tela, estiloCartao } from "@/components/ui";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { cores, fontes, tipo } from "@/theme/tema";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Guildas() {
  const { user } = useAuth();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [guildas, setGuildas] = useState<any[]>([]);
  const [modal, setModal] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [banner, setBanner] = useState("");
  const [maxMembros, setMaxMembros] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarGuildas();
  }, []);

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

  function editarGuilda(guilda: any) {
    setNome(guilda.nome);
    setDescricao(guilda.descricao);
    setBanner(guilda.banner);
    setMaxMembros(String(guilda.maxMembros));

    setEditandoId(guilda.id);
    setModal(true);
  }

  function limparCampos() {
    setNome("");
    setDescricao("");
    setBanner("");
    setMaxMembros("");
    setEditandoId(null);
  }

  async function salvarGuilda() {
    try {
      const body = {
        nome,
        descricao,
        banner,
        maxMembros: Number(maxMembros),
      };

      if (editandoId) {
        await api.put(`/guildas/${editandoId}`, body, {
          headers: {
            "X-Usuario-Id": user?.id,
          },
        });

        Alert.alert("Sucesso", "Guilda atualizada");
      } else {
        await api.post(
          "/guildas?jogoId=UUID_DO_JOGO",
          body,
          {
            headers: {
              "X-Usuario-Id": user?.id,
            },
          }
        );

        Alert.alert("Sucesso", "Guilda criada");
      }

      setModal(false);
      limparCampos();
      carregarGuildas();
    } catch (error: any) {
      console.log(error.response?.data);

      Alert.alert(
        "Erro",
        JSON.stringify(error.response?.data)
      );
    }
  }

  async function deletarGuilda(id: string) {
    try {
      await api.delete(`/guildas/${id}`, {
        headers: {
          "X-Usuario-Id": user?.id,
        },
      });

      carregarGuildas();
    } catch {
      Alert.alert("Erro", "Não foi possível deletar");
    }
  }

  return (
    <Tela>
      <Cabecalho titulo="Guildas" subtitulo="Estandartes registrados no reino" />

      <View style={styles.container}>
        <Botao titulo="Criar Guilda" icone="add-circle" onPress={abrirCriacao} />

        <FlatList
          data={guildas}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: insets.bottom + 30 }}
          ListEmptyComponent={
            <EstadoVazio icone="shield-outline" texto="Nenhuma guilda cadastrada" />
          }
          renderItem={({ item }) => (
            <View style={[estiloCartao.base, estiloCartao.linha]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={tipo.suave}>{item.descricao}</Text>
              </View>

              <BotaoIcone icone="create-outline" tamanho={38} onPress={() => editarGuilda(item)} />
              <BotaoIcone
                icone="trash-outline"
                tamanho={38}
                cor={cores.vinhoClaro}
                style={styles.btnExcluir}
                onPress={() => deletarGuilda(item.id)}
              />
            </View>
          )}
        />
      </View>

      <Modal visible={modal} animationType="slide">
        <Tela>
          <Cabecalho
            titulo={editandoId ? "Editar Guilda" : "Nova Guilda"}
            aoVoltar={() => setModal(false)}
          />
          <ScrollView
            contentContainerStyle={styles.modal}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Cartao style={{ gap: 14, padding: 18 }}>
              <Campo label="Nome" icone="shield-outline" placeholder="Nome" value={nome} onChangeText={setNome} />
              <Campo label="Descrição" placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
              <Campo label="Banner" icone="link-outline" placeholder="Banner URL" value={banner} onChangeText={setBanner} autoCapitalize="none" />
              <Campo
                label="Máx membros"
                icone="people-outline"
                placeholder="Máx membros"
                value={maxMembros}
                onChangeText={setMaxMembros}
                keyboardType="numeric"
              />
            </Cartao>

            <Botao titulo="Salvar" icone="save-outline" onPress={salvarGuilda} />
          </ScrollView>
        </Tela>
      </Modal>
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  nome: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 15, letterSpacing: 0.6 },
  btnExcluir: { backgroundColor: "rgba(142,42,42,0.25)", borderColor: "rgba(224,98,90,0.4)" },
  modal: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 40, gap: 18 },
});
