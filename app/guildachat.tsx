import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
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
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

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
    <ImageBackground source={require("../assets/fundo1.png")} style={estilos.fundo}>
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <View style={[estilos.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#E8D5A3" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>TAVERNA DA GUILDA</Text>
        <Ionicons name="information-circle-outline" size={24} color="#E8D5A3" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={estilos.chatArea}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {mensagens.map((msg) => {
            const isMe = msg.usuario?.id === user?.id;
            return (
              <View key={msg.id} style={[estilos.balaoWrapper, isMe ? estilos.minhaMensagem : estilos.mensagemOutro]}>
                {!isMe && <Text style={estilos.nomeUsuario}>{msg.usuario?.nick || "Membro"}</Text>}
                <View style={[estilos.balao, isMe ? estilos.balaoMeu : estilos.balaoDele]}>
                  <Text style={estilos.textoMensagem}>{msg.conteudo}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={[estilos.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput 
            style={estilos.input} 
            placeholder="Digite uma mensagem..." 
            placeholderTextColor="#888"
            value={texto}
            onChangeText={setTexto}
          />
          <TouchableOpacity style={estilos.btnEnviar} onPress={enviarMensagem}>
            <Ionicons name="send" size={20} color="#1a1008" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.85)" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderColor: "rgba(212,175,55,0.2)" },
  headerTitulo: { color: "#E8D5A3", fontSize: 16, fontWeight: "bold", fontFamily: "serif" },
  chatArea: { padding: 20, gap: 15 },
  balaoWrapper: { maxWidth: "80%" },
  minhaMensagem: { alignSelf: "flex-end" },
  mensagemOutro: { alignSelf: "flex-start" },
  nomeUsuario: { color: "#D4AF37", fontSize: 10, marginBottom: 2, marginLeft: 5 },
  balao: { padding: 10, borderRadius: 15 },
  balaoMeu: { backgroundColor: "#D4AF37", borderBottomRightRadius: 0 },
  balaoDele: { backgroundColor: "#EAE0D5", borderTopLeftRadius: 0 },
  textoMensagem: { color: "#1a1008", fontSize: 14 },
  inputContainer: { flexDirection: "row", padding: 15, backgroundColor: "#1a1008", borderTopWidth: 1, borderColor: "rgba(212,175,55,0.2)", alignItems: "center", gap: 10 },
  input: { flex: 1, backgroundColor: "rgba(232,213,163,0.9)", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, color: "#1a1008" },
  btnEnviar: { backgroundColor: "#D4AF37", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
});