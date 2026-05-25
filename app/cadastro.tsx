import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

type CamposErro = {
  usuario?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarEmail(email: string): string | undefined {
  if (!email.trim()) return "Informe o e-mail.";
  if (!REGEX_EMAIL.test(email.trim())) return "E-mail inválido.";
}

function validarCampos(
  usuario: string,
  email: string,
  senha: string,
  confirmarSenha: string
): CamposErro {
  const erros: CamposErro = {};

  if (!usuario.trim()) erros.usuario = "Escolha um nome de herói.";
  else if (usuario.trim().length < 4) erros.usuario = "O nick deve ter pelo menos 4 caracteres.";
  else if (usuario.trim().length > 15) erros.usuario = "O nick não pode ter mais de 15 caracteres.";

  const erroEmail = validarEmail(email);
  if (erroEmail) erros.email = erroEmail;

  if (!senha) {
    erros.senha = "Informe a senha.";
  } else if (senha.length < 6) {
    erros.senha = "Mínimo de 6 caracteres.";
  }

  if (!confirmarSenha) {
    erros.confirmarSenha = "Confirme a senha.";
  } else if (senha !== confirmarSenha) {
    erros.confirmarSenha = "As senhas não coincidem.";
  }

  return erros;
}

function isEmailDuplicado(e: any): boolean {
  const status = e?.response?.status;
  const data = e?.response?.data;
  const msg = (e?.message ?? "").toLowerCase();

  if (status === 409) return true;
  if (status === 422 || status === 400) {
    const body = JSON.stringify(data ?? "").toLowerCase();
    if (body.includes("email") && (body.includes("already") || body.includes("duplicado") || body.includes("exists") || body.includes("em uso"))) return true;
  }
  if (msg.includes("email") && (msg.includes("already") || msg.includes("duplicado") || msg.includes("exists"))) return true;

  return false;
}

function ErroTexto({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <View style={estilos.erroLinha}>
      <Ionicons name="alert-circle-outline" size={13} color="#FF6B6B" />
      <Text style={estilos.erroTexto}>{msg}</Text>
    </View>
  );
}


export default function Cadastro() {
  const router = useRouter();
  const margens = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<CamposErro>({});

  function validarCampo(campo: keyof CamposErro, valor: string) {
    const novosErros = { ...erros };

    switch (campo) {
      case "usuario":
        if (!valor.trim()) novosErros.usuario = "Escolha um nome de herói.";
        else if (valor.trim().length < 4) novosErros.usuario = "O nick deve ter pelo menos 4 caracteres.";
        else if (valor.trim().length > 15) novosErros.usuario = "O nick não pode ter mais de 15 caracteres.";
        else delete novosErros.usuario;
        break;
      case "email": {
        const erroEmail = validarEmail(valor);
        if (erroEmail) novosErros.email = erroEmail;
        else delete novosErros.email;
        break;
      }
      case "senha":
        if (!valor) novosErros.senha = "Informe a senha.";
        else if (valor.length < 6) novosErros.senha = "Mínimo de 6 caracteres.";
        else delete novosErros.senha;
        
        if (confirmarSenha && valor !== confirmarSenha)
          novosErros.confirmarSenha = "As senhas não coincidem.";
        else if (confirmarSenha && valor === confirmarSenha)
          delete novosErros.confirmarSenha;
        break;
      case "confirmarSenha":
        if (!valor) novosErros.confirmarSenha = "Confirme a senha.";
        else if (senha !== valor) novosErros.confirmarSenha = "As senhas não coincidem.";
        else delete novosErros.confirmarSenha;
        break;
    }

    setErros(novosErros);
  }

  async function handleCadastrar() {
    const novosErros = validarCampos(usuario, email, senha, confirmarSenha);

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      setCarregando(true);
      await signUp(usuario.trim(), email.trim(), senha);
      Alert.alert("Sucesso!", "Conta criada com sucesso!", [
        { text: "Entrar", onPress: () => router.replace("/") },
      ]);
    } catch (e: any) {
      if (isEmailDuplicado(e)) {
        setErros((prev) => ({
          ...prev,
          email: "Este e-mail já está em uso.",
        }));
      } else {
        Alert.alert(
          "Erro ao cadastrar",
          e?.response?.data?.message ?? e?.message ?? "Tente novamente mais tarde."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  const inputBorda = (campo: keyof CamposErro) =>
    erros[campo] ? estilos.inputErro : null;

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
              style={[estilos.input, inputBorda("usuario")]}
              placeholder="Escolha um nome de herói"
              placeholderTextColor="#888"
              value={usuario}
              onChangeText={(v) => { setUsuario(v); if (erros.usuario) validarCampo("usuario", v); }}
              onBlur={() => validarCampo("usuario", usuario)}
              autoCapitalize="none"
              maxLength={15}
            />
            <ErroTexto msg={erros.usuario} />
          </View>

          
          <View style={estilos.campoWrapper}>
            <Text style={estilos.label}>Email</Text>
            <TextInput
              style={[estilos.input, inputBorda("email")]}
              placeholder="seu@email.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={(v) => { setEmail(v); if (erros.email) validarCampo("email", v); }}
              onBlur={() => validarCampo("email", email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ErroTexto msg={erros.email} />
          </View>

          
          <View style={estilos.campoWrapper}>
            <Text style={estilos.label}>Senha</Text>
            <View>
              <TextInput
                style={[estilos.input, estilos.senhaInput, inputBorda("senha")]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#888"
                value={senha}
                onChangeText={(v) => { setSenha(v); if (erros.senha || erros.confirmarSenha) validarCampo("senha", v); }}
                onBlur={() => validarCampo("senha", senha)}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={estilos.olho}>
                <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#555" />
              </TouchableOpacity>
            </View>
            <ErroTexto msg={erros.senha} />
          </View>

          
          <View style={estilos.campoWrapper}>
            <Text style={estilos.label}>Confirmar senha</Text>
            <TextInput
              style={[estilos.input, inputBorda("confirmarSenha")]}
              placeholder="Repita a senha"
              placeholderTextColor="#888"
              value={confirmarSenha}
              onChangeText={(v) => { setConfirmarSenha(v); if (erros.confirmarSenha) validarCampo("confirmarSenha", v); }}
              onBlur={() => validarCampo("confirmarSenha", confirmarSenha)}
              secureTextEntry={!mostrarSenha}
            />
            <ErroTexto msg={erros.confirmarSenha} />
          </View>

         
          <TouchableOpacity
            style={[
              estilos.botao,
              (carregando || !usuario || !email || !senha || !confirmarSenha) && { opacity: 0.5 },
            ]}
            onPress={handleCadastrar}
            disabled={carregando || !usuario || !email || !senha || !confirmarSenha}
            activeOpacity={0.8}
          >
            {carregando
              ? <ActivityIndicator color="#1a1008" />
              : <Text style={estilos.botaoTexto}>Cadastrar</Text>
            }
          </TouchableOpacity>

          <View style={estilos.loginLinha}>
            <Text style={estilos.loginTexto}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
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
  campoWrapper: { gap: 4 },
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
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputErro: {
    borderColor: "#FF6B6B",
  },
  senhaInput: {
    paddingRight: 46,
  },
  olho: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  erroLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  erroTexto: {
    color: "#FF6B6B",
    fontSize: 12,
  },
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