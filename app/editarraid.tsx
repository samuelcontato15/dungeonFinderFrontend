import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
      <View style={estilos.loading}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <ScrollView
      style={estilos.container}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: 40,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <Text style={estilos.titulo}>Editar Raid</Text>

      <Text style={estilos.label}>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={estilos.input}
        placeholderTextColor="#777"
      />

      <Text style={estilos.label}>Descrição</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        style={[estilos.input, { height: 100 }]}
        multiline
        placeholderTextColor="#777"
      />

      <Text style={estilos.label}>Mínimo jogadores</Text>
      <TextInput
        value={minJogadores}
        onChangeText={setMinJogadores}
        keyboardType="numeric"
        style={estilos.input}
      />

      <Text style={estilos.label}>Máximo jogadores</Text>
      <TextInput
        value={maxJogadores}
        onChangeText={setMaxJogadores}
        keyboardType="numeric"
        style={estilos.input}
      />

      <Text style={estilos.label}>Data da raid</Text>

      <TouchableOpacity
        style={estilos.input}
        onPress={() => setMostrarData(true)}
      >
        <Text style={{ color: "#FFF" }}>
          {inicioEm.toLocaleString("pt-BR")}
        </Text>
      </TouchableOpacity>

      {/* PICKER SEM BUG */}
      <DateTimePickerModal
        isVisible={mostrarData}
        mode="datetime"
        onConfirm={confirmarData}
        onCancel={() => setMostrarData(false)}
      />

      <TouchableOpacity
        style={estilos.botaoSalvar}
        onPress={salvarEdicao}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="save-outline" size={18} color="#FFF" />
            <Text style={estilos.textoSalvar}>Salvar Alterações</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 20,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },

  titulo: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    color: "#D4AF37",
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#1c1c1c",
    padding: 14,
    borderRadius: 10,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#333",
  },

  botaoSalvar: {
    marginTop: 30,
    backgroundColor: "#D4AF37",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  textoSalvar: {
    color: "#FFF",
    fontWeight: "bold",
  },
});