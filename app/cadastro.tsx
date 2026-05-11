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
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

export default function Cadastro() {
  const router = useRouter();
  const margens = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [usuario, setUsuario]             = useState("");
  const [email, setEmail]                 = useState("");
  const [senha, setSenha]                 = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha]   = useState(false);
  const [carregando, setCarregando]       = useState(false);

  async function handleCadastrar() {
    if (!usuario.trim() || !email.trim() || !senha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      setCarregando(true);
      await signUp(usuario.trim(), email.trim(), senha);
      Alert.alert("Sucesso!", "Conta criada com sucesso!", [
        { text: "Entrar", onPress: () => router.replace("/home") },
      ]);
      } catch (e: any) {
      Alert.alert(
        "Erro detalhado",
        `Status: ${e?.response?.status}\nMsg: ${e?.message}\nData: ${JSON.stringify(e?.response?.data)}`
      );
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
        <ScrollView
          contentContainerStyle={[
            estilos.scroll,
            { paddingTop: margens.top + 10, paddingBottom: margens.bottom + 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={estilos.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
            <Text style={estilos.btnVoltarTexto}>Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.titulo}>Cadastro</Text>

          <View style={estilos.campoWrapper}>
            <Text style={estilos.label}>Usuário</Text>
            <TextInput
              style={estilos.input}
              placeholder="Escolha um nome de herói"
              placeholderTextColor="#888"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
            />
          </View>

          
          <View style={estilos.campoWrapper}>
            <Text style={estilos.label}>Email</Text>
            <TextInput
              style={estilos.input}
              placeholder="seu@email.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={estilos.campoWrapper}>
            <Text style={estilos.label}>Senha</Text>
            <View style={estilos.inputRow}>
              <TextInput
                style={[estilos.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#888"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={estilos.olho}>
                <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#555" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={estilos.campoWrapper}>
            <Text style={estilos.label}>Confirmar senha</Text>
            <TextInput
              style={estilos.input}
              placeholder="Repita a senha"
              placeholderTextColor="#888"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarSenha}
            />
          </View>

          <TouchableOpacity
            style={[estilos.botao, carregando && { opacity: 0.7 }]}
            onPress={handleCadastrar}
            disabled={carregando}
            activeOpacity={0.8}
          >
            {carregando
              ? <ActivityIndicator color="#1a1008" />
              : <Text style={estilos.botaoTexto}>Cadastrar</Text>
            }
          </TouchableOpacity>

          <View style={estilos.loginLinha}>
            <Text style={estilos.loginTexto}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={estilos.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scroll: {
    paddingHorizontal: 28,
    gap: 14,
  },
  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  btnVoltarTexto: { color: "#D4AF37", fontSize: 14 },
  titulo: {
    fontSize: 30,
    fontWeight: "900",
    color: "#E8D5A3",
    letterSpacing: 2,
    marginBottom: 4,
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
  input: {
    backgroundColor: "rgba(232,213,163,0.85)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#1a1008",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232,213,163,0.85)",
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  olho: { paddingLeft: 8 },
  botao: {
    backgroundColor: "#D4AF37",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  botaoTexto: {
    color: "#1a1008",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
  loginLinha: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  loginTexto: { color: "#999", fontSize: 13 },
  loginLink: { color: "#D4AF37", fontSize: 13, fontWeight: "700" },
});