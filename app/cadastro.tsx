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

  return (
    <Tela>
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
          <BotaoIcone icone="chevron-back" onPress={() => router.back()} />

          <View style={{ marginTop: 8 }}>
            <Text style={estilos.titulo}>Cadastro</Text>
            <Text style={tipo.italico}>Todo herói começa escolhendo um nome.</Text>
          </View>

          <Cartao style={estilos.cartao}>
            <Campo
              label="Usuário"
              icone="person-outline"
              erro={erros.usuario}
              placeholder="Escolha um nome de herói"
              value={usuario}
              onChangeText={(v) => { setUsuario(v); if (erros.usuario) validarCampo("usuario", v); }}
              onBlur={() => validarCampo("usuario", usuario)}
              autoCapitalize="none"
              maxLength={15}
            />

            <Campo
              label="Email"
              icone="mail-outline"
              erro={erros.email}
              placeholder="seu@email.com"
              value={email}
              onChangeText={(v) => { setEmail(v); if (erros.email) validarCampo("email", v); }}
              onBlur={() => validarCampo("email", email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Campo
              label="Senha"
              icone="lock-closed-outline"
              erro={erros.senha}
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={(v) => { setSenha(v); if (erros.senha || erros.confirmarSenha) validarCampo("senha", v); }}
              onBlur={() => validarCampo("senha", senha)}
              secureTextEntry={!mostrarSenha}
              direita={
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} hitSlop={10}>
                  <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={cores.textoSuave} />
                </TouchableOpacity>
              }
            />

            <Campo
              label="Confirmar senha"
              icone="lock-closed-outline"
              erro={erros.confirmarSenha}
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChangeText={(v) => { setConfirmarSenha(v); if (erros.confirmarSenha) validarCampo("confirmarSenha", v); }}
              onBlur={() => validarCampo("confirmarSenha", confirmarSenha)}
              secureTextEntry={!mostrarSenha}
            />

            <Botao
              titulo="Cadastrar"
              onPress={handleCadastrar}
              carregando={carregando}
              disabled={carregando || !usuario || !email || !senha || !confirmarSenha}
              style={{ marginTop: 4 }}
            />
          </Cartao>

          <View style={estilos.loginLinha}>
            <Text style={tipo.suave}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={estilos.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  scroll: { paddingHorizontal: 24, gap: 16 },
  titulo: { ...tipo.display, fontSize: 34, color: cores.pergaminho, letterSpacing: 3 },
  cartao: { gap: 14, padding: 20 },
  loginLinha: { flexDirection: "row", justifyContent: "center" },
  loginLink: { fontFamily: fontes.corpoForte, color: cores.ouro, fontSize: 14 },
});
