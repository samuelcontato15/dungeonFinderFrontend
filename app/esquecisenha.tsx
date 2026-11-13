import { Botao, BotaoIcone, Campo, Cartao, Tela } from "@/components/ui";
import { cores, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RedefinirSenha() {
  const router = useRouter();
  const margens = useSafeAreaInsets();

  const [usuario, setUsuario] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleRedefinir() {
    // Validações básicas
    if (!usuario.trim() || !novaSenha.trim() || !confirmarSenha.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!", [
        { text: "OK", onPress: () => router.replace("/login") }
      ]);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível redefinir a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Tela>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[estilos.container, { paddingTop: margens.top + 10, paddingBottom: margens.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BotaoIcone icone="chevron-back" onPress={() => router.back()} />

          <View style={estilos.corpo}>
            <View>
              <Text style={estilos.titulo}>Redefinir Senha</Text>
              <Text style={tipo.italico}>Até os melhores heróis perdem a chave.</Text>
            </View>

            <Cartao style={estilos.cartao}>
              <Campo
                label="Confirmar Usuário ou Email"
                icone="person-outline"
                placeholder="Seu usuário cadastrado"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
              />

              <Campo
                label="Nova Senha"
                icone="lock-closed-outline"
                placeholder="Digite a nova senha"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry={!mostrarSenha}
              />

              <Campo
                label="Confirmar Nova Senha"
                icone="lock-closed-outline"
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!mostrarSenha}
                direita={
                  <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} hitSlop={10}>
                    <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={cores.textoSuave} />
                  </TouchableOpacity>
                }
              />

              <Botao titulo="Alterar Senha" onPress={handleRedefinir} carregando={carregando} />
            </Cartao>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24 },
  corpo: { flex: 1, justifyContent: "center", gap: 20, paddingVertical: 24 },
  titulo: { ...tipo.display, fontSize: 28, color: cores.pergaminho, letterSpacing: 2 },
  cartao: { gap: 16, padding: 20 },
});
