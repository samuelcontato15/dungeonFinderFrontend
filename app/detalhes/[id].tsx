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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.textContainer}>
            <Text style={styles.titulo}>{jogo.nome}</Text>
            <Text style={styles.descricao}>{jogo.desc}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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
});