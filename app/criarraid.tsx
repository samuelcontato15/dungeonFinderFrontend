import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CriarRaid() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { jogoId } = useLocalSearchParams<{ jogoId: string }>();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [minJogadores, setMin] = useState("2");
  const [maxJogadores, setMax] = useState("10");
  const [inicioEm, setInicioEm] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Formata automaticamente DD/MM enquanto digita
  function formatarData(texto: string) {
    let numeros = texto.replace(/\D/g, "");
    if (numeros.length > 4) numeros = numeros.slice(0, 4);
    if (numeros.length > 2) {
      numeros = numeros.slice(0, 2) + "/" + numeros.slice(2);
    }
    setInicioEm(numeros);
  }

  async function handleCriar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "O nome da raid é obrigatório.");
      return;
    }
    if (!inicioEm.trim()) {
      Alert.alert("Atenção", "Informe a data de início (DD/MM).");
      return;
    }
    if (parseInt(minJogadores) > parseInt(maxJogadores)) {
      Alert.alert("Atenção", "Mínimo não pode ser maior que o máximo.");
      return;
    }
    if (!user?.id) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    // Valida formato DD/MM
    const partes = inicioEm.split("/");
    if (partes.length !== 2 || partes[0].length !== 2 || partes[1].length !== 2) {
      Alert.alert("Formato inválido", "Use DD/MM (ex: 25/12)");
      return;
    }

    try {
      setCarregando(true);
      const ano = new Date().getFullYear();
      const dataFormatada = `${ano}-${partes[1]}-${partes[0]}T20:00:00`;

      await api.post(
        `/raids?jogoId=${jogoId}`,
        {
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          minJogadores: parseInt(minJogadores),
          maxJogadores: parseInt(maxJogadores),
          inicioEm: dataFormatada,
        },
        { headers: { "X-Usuario-Id": user.id } }
      );

      Alert.alert("Sucesso!", "Raid criada com sucesso.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Não foi possível criar a raid.";
      Alert.alert("Erro", msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo} resizeMode="cover">
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[estilos.scroll, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
            <Text style={estilos.btnVoltarTexto}>Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.titulo}>Criar Raid</Text>

          <View style={estilos.campo}>
            <Text style={estilos.label}>Nome da raid *</Text>
            <TextInput
              style={estilos.input}
              placeholder="Ex: Den of Nalorakh"
              placeholderTextColor="#888"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.label}>Descrição</Text>
            <TextInput
              style={[estilos.input, { height: 90, textAlignVertical: "top" }]}
              placeholder="Descreva sua raid..."
              placeholderTextColor="#888"
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />
          </View>

          <View style={estilos.linha}>
            <View style={[estilos.campo, { flex: 1 }]}>
              <Text style={estilos.label}>Mín. jogadores *</Text>
              <TextInput
                style={estilos.input}
                placeholder="2"
                placeholderTextColor="#888"
                value={minJogadores}
                onChangeText={setMin}
                keyboardType="numeric"
              />
            </View>
            <View style={[estilos.campo, { flex: 1 }]}>
              <Text style={estilos.label}>Máx. jogadores *</Text>
              <TextInput
                style={estilos.input}
                placeholder="10"
                placeholderTextColor="#888"
                value={maxJogadores}
                onChangeText={setMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.label}>Data de início * (DD/MM)</Text>
            <TextInput
              style={estilos.input}
              placeholder="Ex: 25/12"
              placeholderTextColor="#888"
              value={inicioEm}
              onChangeText={formatarData}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <TouchableOpacity
            style={[estilos.btnCriar, carregando && { opacity: 0.7 }]}
            onPress={handleCriar}
            disabled={carregando}
            activeOpacity={0.8}
          >
            {carregando ? (
              <ActivityIndicator color="#1a1008" />
            ) : (
              <Text style={estilos.btnCriarTexto}>Criar Raid</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.65)" },
  scroll: { paddingHorizontal: 24, gap: 16 },
  btnVoltar: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  btnVoltarTexto: { color: "#D4AF37", fontSize: 14 },
  titulo: { color: "#E8D5A3", fontSize: 26, fontWeight: "900", letterSpacing: 2 },
  campo: { gap: 6 },
  label: { color: "#E8D5A3", fontSize: 13, fontWeight: "600" },
  input: { backgroundColor: "rgba(232,213,163,0.85)", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1a1008" },
  linha: { flexDirection: "row", gap: 12 },
  btnCriar: { backgroundColor: "#D4AF37", paddingVertical: 15, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnCriarTexto: { color: "#1a1008", fontSize: 15, fontWeight: "700", letterSpacing: 1 },
});