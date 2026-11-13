import { Botao, BotaoIcone, Campo, Cartao, Tela } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { cores, fontes, tipo } from "@/theme/tema";
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

export default function Login() {
  const router = useRouter();
  const margens = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [emailOrUser, setEmailOrUser] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleEntrar() {
    try {
      setCarregando(true);
      await signIn(emailOrUser.trim(), senha);
      router.replace("/");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível fazer login. e-mail ou senha incorretos.");
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
              <Text style={estilos.titulo}>Login</Text>
              <Text style={tipo.italico}>A taverna sentiu sua falta, aventureiro.</Text>
            </View>

            <Cartao style={estilos.cartao}>
              <Campo
                label="Email"
                icone="mail-outline"
                placeholder="Digite seu e-mail"
                value={emailOrUser}
                onChangeText={setEmailOrUser}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Campo
                label="Senha"
                icone="lock-closed-outline"
                placeholder="Digite sua senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
                direita={
                  <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} hitSlop={10}>
                    <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={cores.textoSuave} />
                  </TouchableOpacity>
                }
              />

              <View style={estilos.linha}>
                <Text style={tipo.suave}>Esqueceu a senha? </Text>
                <TouchableOpacity onPress={() => router.push("/esquecisenha")}>
                  <Text style={estilos.link}>Clique aqui</Text>
                </TouchableOpacity>
              </View>

              <Botao titulo="Entrar" onPress={handleEntrar} carregando={carregando} />
            </Cartao>

            <View style={[estilos.linha, { justifyContent: "center" }]}>
              <Text style={tipo.suave}>Não tem conta? </Text>
              <TouchableOpacity onPress={() => router.push("/cadastro")}>
                <Text style={estilos.link}>Criar Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24 },
  corpo: { flex: 1, justifyContent: "center", gap: 20, paddingVertical: 24 },
  titulo: { ...tipo.display, fontSize: 34, color: cores.pergaminho, letterSpacing: 3 },
  cartao: { gap: 16, padding: 20 },
  linha: { flexDirection: "row", alignItems: "center" },
  link: { fontFamily: fontes.corpoForte, color: cores.ouro, fontSize: 14 },
});
