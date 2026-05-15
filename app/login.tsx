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
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const margens = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [emailOrUser, setEmailOrUser] = useState("");
  const [senha, setSenha]             = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando]   = useState(false);

  async function handleEntrar() {
    if (!emailOrUser.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha com e-mail e senha.");
      return;
    }
    try {
      setCarregando(true);
      await signIn(emailOrUser.trim(), senha);
      router.replace("/home");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível fazer login. Verifique suas credenciais.");
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
            <Text style={estilos.titulo}>Login</Text>

          
            <View style={estilos.campoWrapper}>
              <Text style={estilos.label}>Email</Text>
              <View style={estilos.inputContainer}>
                <TextInput
                  style={estilos.input}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#888"
                  value={emailOrUser}
                  onChangeText={setEmailOrUser}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

          
            <View style={estilos.campoWrapper}>
              <Text style={estilos.label}>Senha</Text>
              <View style={estilos.inputContainer}>
                <TextInput
                  style={[estilos.input, { flex: 1 }]}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#888"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!mostrarSenha}
                />
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={estilos.olho}>
                  <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#aaa" />
                </TouchableOpacity>
              </View>
            </View>

        <View style={estilos.esqueceuLinha}>
  <Text style={estilos.esqueceuTexto}>Esqueceu a senha? </Text>
  <TouchableOpacity onPress={() => router.push("/esquecisenha")}>
    <Text style={estilos.esqueceuLink}>Clique aqui</Text>
  </TouchableOpacity>
</View>

    
            <TouchableOpacity
              style={[estilos.botao, carregando && { opacity: 0.7 }]}
              onPress={handleEntrar}
              disabled={carregando}
              activeOpacity={0.8}
            >
              {carregando
                ? <ActivityIndicator color="#1a1008" />
                : <Text style={estilos.botaoTexto}>Entrar</Text>
              }
            </TouchableOpacity>

          
            <View style={estilos.cadastroLinha}>
              <Text style={estilos.cadastroTexto}>Não tem conta? </Text>
              <TouchableOpacity onPress={() => router.push("/cadastro")}>
                <Text style={estilos.cadastroLink}>Criar Conta</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 30,
    fontWeight: "900",
    color: "#E8D5A3",
    letterSpacing: 2,
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
  esqueceuLinha: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -6,
  },
  esqueceuTexto: { color: "#ccc", fontSize: 12 },
  esqueceuLink: { color: "#D4AF37", fontSize: 12, fontWeight: "700" },
  botao: {
    backgroundColor: "#D4AF37",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  botaoTexto: {
    color: "#1a1008",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cadastroLinha: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  cadastroTexto: { color: "#999", fontSize: 13 },
  cadastroLink: { color: "#D4AF37", fontSize: 13, fontWeight: "700" },
});