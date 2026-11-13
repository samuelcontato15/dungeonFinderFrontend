import { Avatar, Cabecalho, EstadoVazio, Tela } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, gradientes, raios } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatGuilda() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (id) {
      carregarMensagens();
      const interval = setInterval(carregarMensagens, 3000); // Polling a cada 3s
      return () => clearInterval(interval);
    }
  }, [id]);

  async function carregarMensagens() {
    try {
      const res = await api.get(`/guildas/${id}/mensagens`);
      setMensagens(res.data);
    } catch (e) {
      console.log("Erro ao carregar mensagens");
    }
  }

  async function enviarMensagem() {
    if (!texto.trim()) return;

    try {
      // Envia via Query Param conforme definido no seu Controller
      await api.post(`/guildas/${id}/mensagens?conteudo=${encodeURIComponent(texto)}`, {}, {
        headers: { "X-Usuario-Id": user?.id }
      });
      setTexto("");
      carregarMensagens();
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (e: any) {
      Alert.alert("Erro", e.response?.data?.message || "Não foi possível enviar a mensagem.");
    }
  }

  return (
    <Tela>
      <View style={estilos.header}>
        <Cabecalho
          titulo="Taverna da Guilda"
          subtitulo="Conversa entre os membros"
          direita={<Ionicons name="beer-outline" size={22} color={cores.ouro} />}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={estilos.chatArea}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {mensagens.length === 0 && (
            <EstadoVazio
              icone="chatbubbles-outline"
              texto="A taverna está em silêncio."
              dica="Mande a primeira mensagem para a guilda."
            />
          )}
          {mensagens.map((msg) => {
            const isMe = msg.usuario?.id === user?.id;
            return (
              <View key={msg.id} style={[estilos.linhaMensagem, isMe && { flexDirection: "row-reverse" }]}>
                {!isMe && <Avatar uri={msg.usuario?.fotoPerfil} tamanho={30} />}
                <View style={[estilos.balaoWrapper, isMe ? estilos.minhaMensagem : estilos.mensagemOutro]}>
                  {!isMe && <Text style={estilos.nomeUsuario}>{msg.usuario?.nick || "Membro"}</Text>}
                  <View style={[estilos.balao, isMe ? estilos.balaoMeu : estilos.balaoDele]}>
                    {isMe && <LinearGradient colors={gradientes.ouro} style={StyleSheet.absoluteFill} />}
                    <Text style={estilos.textoMensagem}>{msg.conteudo}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={[estilos.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            style={estilos.input}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={cores.textoApagado}
            selectionColor={cores.ouro}
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={enviarMensagem}
            returnKeyType="send"
          />
          <TouchableOpacity style={estilos.btnEnviar} onPress={enviarMensagem} activeOpacity={0.8}>
            <LinearGradient colors={gradientes.ouro} style={StyleSheet.absoluteFill} />
            <Ionicons name="send" size={18} color={cores.tinta} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  header: { borderBottomWidth: 1, borderColor: cores.borda, backgroundColor: "rgba(13,8,5,0.7)" },
  chatArea: { padding: 16, gap: 12, flexGrow: 1 },
  linhaMensagem: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  balaoWrapper: { maxWidth: "78%" },
  minhaMensagem: { alignItems: "flex-end" },
  mensagemOutro: { alignItems: "flex-start" },
  nomeUsuario: { fontFamily: fontes.titulo, color: cores.ouro, fontSize: 10, letterSpacing: 0.8, marginBottom: 3, marginLeft: 4 },
  balao: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: raios.g, overflow: "hidden" },
  balaoMeu: { backgroundColor: cores.ouro, borderBottomRightRadius: 4 },
  balaoDele: { backgroundColor: cores.pergaminho, borderBottomLeftRadius: 4 },
  textoMensagem: { fontFamily: fontes.corpo, color: cores.tinta, fontSize: 17, lineHeight: 22 },
  inputContainer: { flexDirection: "row", paddingHorizontal: 14, paddingTop: 10, backgroundColor: "rgba(13,8,5,0.96)", borderTopWidth: 1, borderColor: cores.borda, alignItems: "center", gap: 10 },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: cores.campo,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontFamily: fontes.corpo,
    fontSize: 17,
    color: cores.texto,
    ...({ outlineStyle: "none" } as object),
  },
  btnEnviar: { width: 44, height: 44, borderRadius: 22, overflow: "hidden", justifyContent: "center", alignItems: "center" },
});
