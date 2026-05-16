import { Link } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type ItemJogo = {
  id: string;
  fonte: any;
};

type Propriedades = {
  titulo: string;
  dados: ItemJogo[];
  larguraCard?: number;
  alturaCard?: number;
};

export default function SecaoJogos({
  titulo,
  dados,
  larguraCard = 150,
  alturaCard = 90,
}: Propriedades) {
  return (
    <View style={estilos.secao}>
      <View style={estilos.linhaTitulo}>
        <View style={estilos.acento} />
        <Text style={estilos.titulo}>{titulo}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.fileira}
      >
        {dados.map((item) => (
          <Link key={item.id} href={`/detalhes/${item.id}`} asChild>
            <TouchableOpacity activeOpacity={0.8}>
              <Image
                source={item.fonte}
                style={{
                  width: larguraCard,
                  height: alturaCard,
                  borderRadius: 10,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>

      <View style={estilos.divisor} />
    </View>
  );
}

const estilos = StyleSheet.create({
  secao: { marginTop: 18 },
  linhaTitulo: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  acento: {
    width: 4,
    height: 18,
    backgroundColor: "#D4AF37",
    borderRadius: 2,
    marginRight: 8,
  },
  titulo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  fileira: { paddingLeft: 2, paddingRight: 8, gap: 12 },
  divisor: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginTop: 16,
  },
});
