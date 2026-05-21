import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatGuilda() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Design estático para demonstração
  const mensagensMock = [
    { id: "1", user: "Admin", text: "Sejam Bem-vindos à nossa guilda! 🍺", isMe: false },
    { id: "2", user: "Guerreiro123", text: "Salve! Que horas é a raid amanhã?", isMe: false },
    { id: "3", user: "Você", text: "Acho que as 20h, vou estar logado.", isMe: true },
  ];

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

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={estilos.chatArea}>
          {mensagensMock.map((msg) => (
            <View key={msg.id} style={[estilos.balaoWrapper, msg.isMe ? estilos.minhaMensagem : estilos.mensagemOutro]}>
              {!msg.isMe && <Text style={estilos.nomeUsuario}>{msg.user}</Text>}
              <View style={[estilos.balao, msg.isMe ? estilos.balaoMeu : estilos.balaoDele]}>
                <Text style={estilos.textoMensagem}>{msg.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[estilos.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput 
            style={estilos.input} 
            placeholder="Digite uma mensagem..." 
            placeholderTextColor="#888" 
          />
          <TouchableOpacity style={estilos.btnEnviar}>
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
  
  nomeUsuario: { color: "#D4AF37", fontSize: 12, marginBottom: 4, marginLeft: 5 },
  balao: { padding: 12, borderRadius: 15 },
  balaoMeu: { backgroundColor: "#D4AF37", borderBottomRightRadius: 0 },
  balaoDele: { backgroundColor: "#EAE0D5", borderTopLeftRadius: 0 },
  textoMensagem: { color: "#1a1008", fontSize: 14 },

  inputContainer: { flexDirection: "row", padding: 15, backgroundColor: "#1a1008", borderTopWidth: 1, borderColor: "rgba(212,175,55,0.2)", alignItems: "center", gap: 10 },
  input: { flex: 1, backgroundColor: "rgba(232,213,163,0.9)", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, color: "#1a1008" },
  btnEnviar: { backgroundColor: "#D4AF37", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
});