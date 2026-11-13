import { Botao, Cabecalho, Campo, Cartao, Tela } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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
    <Tela>
      <Cabecalho titulo="Criar Raid" subtitulo="Convoque heróis para a missão" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[estilos.scroll, { paddingBottom: insets.bottom + 30 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Cartao style={estilos.cartao}>
            <Campo
              label="Nome da raid *"
              icone="skull-outline"
              placeholder="Ex: Den of Nalorakh"
              value={nome}
              onChangeText={setNome}
            />

            <Campo
              label="Descrição"
              placeholder="Descreva sua raid..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />

            <View style={estilos.linha}>
              <View style={{ flex: 1 }}>
                <Campo
                  label="Mín. jogadores *"
                  icone="person-outline"
                  placeholder="2"
                  value={minJogadores}
                  onChangeText={setMin}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Campo
                  label="Máx. jogadores *"
                  icone="people-outline"
                  placeholder="10"
                  value={maxJogadores}
                  onChangeText={setMax}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Campo
              label="Data de início * (DD/MM)"
              icone="calendar-outline"
              placeholder="Ex: 25/12"
              value={inicioEm}
              onChangeText={formatarData}
              keyboardType="numeric"
              maxLength={5}
            />
          </Cartao>

          <Botao
            titulo="Criar Raid"
            icone="flag-outline"
            onPress={handleCriar}
            carregando={carregando}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 6, gap: 18 },
  cartao: { gap: 16, padding: 18 },
  linha: { flexDirection: "row", gap: 12 },
});
