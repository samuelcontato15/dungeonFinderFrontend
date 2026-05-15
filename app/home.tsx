import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BarraNavegacao from "@/components/BarraNavegacao";
import { useAuth } from "@/context/AuthContext";

const EVENTOS = [
  {
    id: "1",
    titulo: "Fase do estilo",
    descricao:
      "Tirem o pó das suas armaduras e participem de uma competição de moda de proporções surreais! Falem com um NPC de transmogrificação em qualquer cidade principal para participar da Prova de Estilo!",
    duracao: "até 08/08/2026",
    imagem: require("../assets/elder.png"),
  },
];

const RAIDS = [
  {
    id: "1",
    nome: "Den of Nalorakh",
    nivel: "Nível mínimo: 80, 5 vagas, buscando: 3",
    membros: [
      { id: "1", rotulo: "DRUIDA",        imagem: require("../assets/wow.png")          },
      { id: "2", rotulo: "DEMON HUNTER",  imagem: require("../assets/dagger.png")       },
      { id: "3", rotulo: "MONGE",         imagem: require("../assets/elder.png")        },
      { id: "4", rotulo: "ILLIDAN",       imagem: require("../assets/ALBIONONLINE.png") },
      { id: "5", rotulo: "MORGANA",       imagem: require("../assets/tormenta.png")     },
    ],
  },
];

export default function Home() {
  const margens = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <ImageBackground
      source={require("../assets/fundo1.png")}
      style={estilos.fundo}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
       
        <Image
          source={require("../assets/wow.png")}
          style={[estilos.bannerTopo, { marginTop: margens.top }]}
          resizeMode="cover"
        />

       
        <View style={estilos.corpo}>
          <Text style={estilos.secaoTitulo}>EVENTOS</Text>

          {EVENTOS.map((evento) => (
            <View key={evento.id}>
              <Text style={estilos.eventoNome}>{evento.titulo}</Text>
              <View style={estilos.eventoCard}>
                <Image source={evento.imagem} style={estilos.eventoImagem} resizeMode="cover" />
                <Text style={estilos.eventoDesc}>{evento.descricao}</Text>
              </View>
              <Text style={estilos.eventoDuracao}>Duração: {evento.duracao}</Text>
              <TouchableOpacity style={estilos.btnSeta}>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {/* RAIDS */}
          <Text style={[estilos.secaoTitulo, { marginTop: 28 }]}>RAIDS</Text>

          {RAIDS.map((raid) => (
            <View key={raid.id} style={estilos.raidCard}>
              <Text style={estilos.raidNome}>{raid.nome}</Text>
              <Text style={estilos.raidNivel}>{raid.nivel}</Text>

              <View style={estilos.raidMembros}>
                {raid.membros.map((m) => (
                  <View key={m.id} style={estilos.membroCol}>
                    <Image source={m.imagem} style={estilos.membroAvatar} resizeMode="cover" />
                    <Text style={estilos.membroRotulo} numberOfLines={1}>{m.rotulo}</Text>
                  </View>
                ))}

                {/* Botão + para criar/entrar na raid */}
                <View style={estilos.membroCol}>
                  <TouchableOpacity style={estilos.btnMais}>
                    <Ionicons name="add" size={26} color="#D4AF37" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={estilos.btnSeta}>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo:   { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },

  bannerTopo: {
    width: "90%",
    height: 120,
  },

  corpo: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  secaoTitulo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 10,
  },

  eventoNome: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  eventoCard: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  eventoImagem: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  eventoDesc: {
    flex: 1,
    color: "#ddd",
    fontSize: 11,
    lineHeight: 16,
  },
  eventoDuracao: {
    color: "#fff",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },

  btnSeta: {
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 4,
  },

  // Raid
  raidCard: {
    marginBottom: 16,
  },
  raidNome: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  raidNivel: {
    color: "#ccc",
    fontSize: 11,
    marginBottom: 12,
  },
  raidMembros: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  membroCol: {
    alignItems: "center",
    gap: 4,
    width: 48,
  },
  membroAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  membroRotulo: {
    color: "#ccc",
    fontSize: 8,
    textAlign: "center",
  },
  btnMais: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(212,175,55,0.05)",
  },
});