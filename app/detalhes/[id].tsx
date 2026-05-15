<<<<<<< HEAD
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ImageBackground, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

// Mapa de slug → imagens locais
const fundosPorSlug: Record<string, any> = {
  "world-of-warcraft":        require("@/assets/fundowow.png"),
  "albion-online":            require("@/assets/fundoalbion.png"),
  "the-elder-scrolls-online": require("@/assets/fundoelder.png"),
  "daggerheart":              require("@/assets/fundodagger.png"),
  "dungeons-and-dragons":     require("@/assets/fundoded.png"),
  "ordem-paranormal":         require("@/assets/fundoop.png"),
  "tormenta":                 require("@/assets/fundotormenta.png"),
};

const capasPorSlug: Record<string, any> = {
  "world-of-warcraft":        require("@/assets/wow.png"),
  "albion-online":            require("@/assets/ALBIONONLINE.png"),
  "the-elder-scrolls-online": require("@/assets/elder.png"),
  "daggerheart":              require("@/assets/dagger.png"),
  "dungeons-and-dragons":     require("@/assets/DeD.png"),
  "ordem-paranormal":         require("@/assets/rpgdocellbit.png"),
  "tormenta":                 require("@/assets/tormenta.png"),
};

interface Jogo {
  id: string;
  nome: string;
  slug: string;
  capa: string;
  criadoEm: string;
}

export default function Detalhes() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const idFinal = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    fetch(`http://10.0.2.2:8080/jogos/${idFinal}`)  // 10.0.2.2 = localhost no emulador Android
      .then((res) => {
        if (!res.ok) throw new Error("Erro na requisição");
        return res.json();
      })
      .then((data: Jogo) => setJogo(data))
      .catch(() => setErro("Jogo não encontrado"))
      .finally(() => setLoading(false));
  }, [idFinal]);

  // Loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Erro ou jogo não encontrado
  if (erro || !jogo) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>{erro ?? "Jogo não encontrado"}</Text>
      </View>
    );
  }

  const imagemFundo = fundosPorSlug[jogo.slug];
  const imagemCapa  = capasPorSlug[jogo.slug];

  return (
    <ImageBackground
      source={imagemFundo}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={[styles.safeContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerBanner}>
          <Image source={imagemCapa} style={styles.logoImage} />
        </View>

=======
import { useLocalSearchParams } from 'expo-router';
import {View, Text, Image, ImageBackground, ScrollView, SafeAreaView} from 'react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dadosJogos } from '@/data/dadosJogos';
   
    export default function Detalhes() {
        const {id} = useLocalSearchParams();
        const insets = useSafeAreaInsets();

        const idFinal = Array.isArray(id) ? id [0] : id;

        const jogo = dadosJogos.find((item) => item.id === idFinal);

        if (!jogo) {
        return (
            <View>
                <Text>Jogo não encontrado</Text>
            </View>
        )   
        }

          return (
    <ImageBackground
      source={jogo.fundo}
      style={styles.background}
      resizeMode="cover"
    >
      {/* overlay escuro */}
      <View style={styles.overlay} />

      <SafeAreaView
        style={[styles.safeContainer, { paddingTop: insets.top }]}
      >
        {/* topo com logo */}
        <View style={styles.headerBanner}>
          <Image source={jogo.fonte} style={styles.logoImage} />
        </View>

        {/* conteúdo */}
>>>>>>> 41d401315629be16c93fcb19bbf4ce4203b282cc
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.textContainer}>
            <Text style={styles.titulo}>{jogo.nome}</Text>
<<<<<<< HEAD
            {/* desc não existe na entidade ainda — veja observação abaixo */}
=======
            <Text style={styles.descricao}>{jogo.desc}</Text>
>>>>>>> 41d401315629be16c93fcb19bbf4ce4203b282cc
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  background:   { flex: 1 },
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  safeContainer:{ flex: 1 },
  headerBanner: { width: "100%", minHeight: 120, justifyContent: "center", alignItems: "center" },
  logoImage:    { width: "75%", height: 100, resizeMode: "contain" },
  scrollContent:{ paddingHorizontal: 25, paddingBottom: 40 },
  textContainer:{ marginTop: 10 },
  titulo:       { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  descricao:    { color: "#fff", fontSize: 18, lineHeight: 26, textAlign: "center" },
  center:       { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
=======
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  safeContainer: {
    flex: 1,
  },

  headerBanner: {
    width: "100%",
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  logoImage: {
    width: "75%",
    height: 100,
    resizeMode: "contain",
  },

  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },

  textContainer: {
    marginTop: 10,
  },

  titulo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  descricao: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
>>>>>>> 41d401315629be16c93fcb19bbf4ce4203b282cc
});