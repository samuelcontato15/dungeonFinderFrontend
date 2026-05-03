import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
    <ImageBackground
      source={require("../assets/fundo1.png")} 
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[estilos.container, { paddingTop: margens.top + 10, paddingBottom: margens.bottom + 20 }]}>
          
          <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
            <Text style={estilos.btnVoltarTexto}>Voltar</Text>
          </TouchableOpacity>

          <View style={estilos.corpo}>
            <Text style={estilos.titulo}>Redefinir Senha</Text>

            <View style={estilos.campoWrapper}>
              <Text style={estilos.label}>Confirmar Usuário ou Email</Text>
              <View style={estilos.inputContainer}>
                <TextInput
                  style={estilos.input}
                  placeholder="Seu usuário cadastrado"
                  placeholderTextColor="#888"
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                />
              </View>
            </View>

    
            <View style={estilos.campoWrapper}>
              <Text style={estilos.label}>Nova Senha</Text>
              <View style={estilos.inputContainer}>
                <TextInput
                  style={[estilos.input, { flex: 1 }]}
                  placeholder="Digite a nova senha"
                  placeholderTextColor="#888"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry={!mostrarSenha}
                />
              </View>
            </View>

            {/* Confirmar Senha */}
            <View style={estilos.campoWrapper}>
              <Text style={estilos.label}>Confirmar Nova Senha</Text>
              <View style={estilos.inputContainer}>
                <TextInput
                  style={[estilos.input, { flex: 1 }]}
                  placeholder="Repita a nova senha"
                  placeholderTextColor="#888"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry={!mostrarSenha}
                />
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={estilos.olho}>
                  <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#aaa" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[estilos.botao, carregando && { opacity: 0.7 }]}
              onPress={handleRedefinir}
              disabled={carregando}
              activeOpacity={0.8}
            >
              {carregando
                ? <ActivityIndicator color="#1a1008" />
                : <Text style={estilos.botaoTexto}>Alterar Senha</Text>
              }
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.60)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  btnVoltarTexto: { color: "#D4AF37", fontSize: 14 },
  corpo: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#E8D5A3",
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  campoWrapper: { gap: 6 },
  label: {
    color: "#E8D5A3",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232,213,163,0.85)",
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: "#1a1008",
  },
  olho: { paddingLeft: 8 },
  botao: {
    backgroundColor: "#D4AF37",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: {
    color: "#1a1008",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
});