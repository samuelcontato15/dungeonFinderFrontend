import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BarraNavegacao           from "@/components/BarraNavegacao";
import SecaoJogos, { ItemJogo } from "@/components/SecaoJogos";

const novidades: ItemJogo[] = [
  { id: "j3", fonte: require("../assets/elder.png")  },
  { id: "j4", fonte: require("../assets/dagger.png") },
];

const jogos: ItemJogo[] = [
  { id: "j1", fonte: require("../assets/wow.png")          },
  { id: "j2", fonte: require("../assets/ALBIONONLINE.png") },
  { id: "j3", fonte: require("../assets/elder.png")        },
  { id: "j4", fonte: require("../assets/dagger.png")       },
];

const rpgMesa: ItemJogo[] = [
  { id: "r1", fonte: require("../assets/DeD.png")          },
  { id: "r2", fonte: require("../assets/rpgdocellbit.png") },
  { id: "r3", fonte: require("../assets/tormenta.png")     },
];

export default function Inicio() {
  const margens = useSafeAreaInsets();

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
        contentContainerStyle={[estilos.rolagem, { paddingTop: margens.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <SecaoJogos titulo="NOVIDADES"   dados={novidades} larguraCard={200} alturaCard={110} />
        <SecaoJogos titulo="GAMES"       dados={jogos}     larguraCard={140} alturaCard={80}  />
        <SecaoJogos titulo="RPG DE MESA" dados={rpgMesa}   larguraCard={130} alturaCard={75}  />
        <View style={{ height: 20 }} />
      </ScrollView>

      <BarraNavegacao />
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo:   { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  rolagem: { paddingHorizontal: 16, paddingBottom: 10 },
});