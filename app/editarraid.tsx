import { Botao, Cabecalho, Campo, Carregando, Cartao, Tela } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, raios, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function EditarRaid() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { raidId } = useLocalSearchParams<{ raidId: string }>();
  const { user } = useAuth();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [minJogadores, setMinJogadores] = useState("1");
  const [maxJogadores, setMaxJogadores] = useState("5");

  const [inicioEm, setInicioEm] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);

  useEffect(() => {
    carregarRaid();
  }, []);

  async function carregarRaid() {
    try {
      const res = await api.get(`/raids/${raidId}`);
      const raid = res.data;

      setNome(raid.nome || "");
      setDescricao(raid.descricao || "");
      setMinJogadores(String(raid.minJogadores || 1));
      setMaxJogadores(String(raid.maxJogadores || 5));
      setInicioEm(raid.inicioEm ? new Date(raid.inicioEm) : new Date());
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar a raid.");
      router.back();
    } finally {
      setCarregando(false);
    }
  }

  async function salvarEdicao() {
    if (!nome.trim()) {
      Alert.alert("Erro", "Digite um nome.");
      return;
    }

    try {
      setSalvando(true);

      await api.put(
        `/raids/${raidId}`,
        {
          nome,
          descricao,
          minJogadores: Number(minJogadores),
          maxJogadores: Number(maxJogadores),
          inicioEm: inicioEm.toISOString(),
        },
        {
          headers: {
            "X-Usuario-Id": user?.id,
          },
        }
      );

      Alert.alert("Sucesso", "Raid atualizada.");
      router.back();
    } catch (error: any) {
      console.log(error?.response?.data);
      Alert.alert(
        "Erro",
        error?.response?.data?.message || "Erro ao atualizar raid."
      );
    } finally {
      setSalvando(false);
    }
  }

  function confirmarData(date: Date) {
    setInicioEm(date);
    setMostrarData(false);
  }

  if (carregando) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  return (
    <Tela>
      <Cabecalho titulo="Editar Raid" subtitulo="Ajuste os planos da missão" />

      <ScrollView
        contentContainerStyle={[estilos.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Cartao style={estilos.cartao}>
          <Campo
            label="Nome"
            icone="skull-outline"
            value={nome}
            onChangeText={setNome}
          />

          <Campo
            label="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            multiline
          />

          <View style={estilos.linha}>
            <View style={{ flex: 1 }}>
              <Campo
                label="Mínimo jogadores"
                icone="person-outline"
                value={minJogadores}
                onChangeText={setMinJogadores}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Campo
                label="Máximo jogadores"
                icone="people-outline"
                value={maxJogadores}
                onChangeText={setMaxJogadores}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={tipo.rotulo}>Data da raid</Text>
            <TouchableOpacity
              style={estilos.seletor}
              onPress={() => setMostrarData(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={18} color={cores.ouro} />
              <Text style={estilos.seletorTexto}>
                {inicioEm.toLocaleString("pt-BR")}
              </Text>
              <Ionicons name="chevron-down" size={16} color={cores.textoApagado} />
            </TouchableOpacity>
          </View>
        </Cartao>

        {/* PICKER SEM BUG */}
        <DateTimePickerModal
          isVisible={mostrarData}
          mode="datetime"
          onConfirm={confirmarData}
          onCancel={() => setMostrarData(false)}
        />

        <Botao
          titulo="Salvar Alterações"
          icone="save-outline"
          onPress={salvarEdicao}
          carregando={salvando}
        />
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 6, gap: 18 },
  cartao: { gap: 16, padding: 18 },
  linha: { flexDirection: "row", gap: 12 },
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
});
