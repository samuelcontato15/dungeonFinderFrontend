import { Platform, TextStyle, ViewStyle } from "react-native";

// Tema "taverna": madeira escura, ouro envelhecido e pergaminho.
export const cores = {
  fundo: "#0D0805",
  madeira900: "#120C08",
  madeira800: "#1C130C",
  madeira700: "#2A1D12",
  madeira600: "#3A2818",

  ouro: "#D4AF37",
  ouroClaro: "#F2D675",
  ouroEscuro: "#8C6B22",

  pergaminho: "#E8D5A3",
  pergaminhoClaro: "#F5E9C8",

  texto: "#F3E9D2",
  textoSuave: "#B8A88A",
  textoApagado: "#7D705C",
  tinta: "#1A1008",

  vinho: "#8E2A2A",
  vinhoClaro: "#E0625A",
  musgo: "#4E7A3A",
  musgoClaro: "#8FCB6B",
  ambar: "#E0962D",

  cartao: "rgba(18,12,8,0.84)",
  cartaoClaro: "rgba(42,29,18,0.78)",
  campo: "rgba(10,6,3,0.62)",
  borda: "rgba(212,175,55,0.22)",
  bordaForte: "rgba(212,175,55,0.6)",
  linha: "rgba(232,213,163,0.1)",
} as const;

export const gradientes = {
  ouro: ["#F2D675", "#D4AF37", "#A8842A"] as const,
  tela: ["rgba(8,5,3,0.93)", "rgba(13,8,5,0.56)", "rgba(8,5,3,0.95)"] as const,
  capa: ["transparent", "rgba(13,8,5,0.55)", "rgba(13,8,5,0.97)"] as const,
};

export const fontes = {
  titulo: "Cinzel_700Bold",
  tituloBlack: "Cinzel_900Black",
  corpo: "CrimsonText_400Regular",
  corpoItalico: "CrimsonText_400Regular_Italic",
  corpoForte: "CrimsonText_600SemiBold",
} as const;

export const raios = { p: 8, m: 12, g: 16, pilula: 999 } as const;

export const sombra: ViewStyle = Platform.select({
  android: { elevation: 6 },
  default: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
}) as ViewStyle;

export const brilhoOuro: ViewStyle = Platform.select({
  android: { elevation: 8 },
  default: {
    shadowColor: cores.ouro,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
}) as ViewStyle;

export const tipo: Record<
  "display" | "titulo" | "subtitulo" | "corpo" | "suave" | "rotulo" | "italico",
  TextStyle
> = {
  display: {
    fontFamily: fontes.tituloBlack,
    color: cores.ouro,
    letterSpacing: 3,
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  titulo: {
    fontFamily: fontes.titulo,
    color: cores.pergaminho,
    fontSize: 20,
    letterSpacing: 1.5,
  },
  subtitulo: {
    fontFamily: fontes.corpoForte,
    color: cores.texto,
    fontSize: 17,
  },
  corpo: { fontFamily: fontes.corpo, color: cores.texto, fontSize: 16, lineHeight: 22 },
  suave: { fontFamily: fontes.corpo, color: cores.textoSuave, fontSize: 14, lineHeight: 19 },
  italico: { fontFamily: fontes.corpoItalico, color: cores.textoSuave, fontSize: 15 },
  rotulo: {
    fontFamily: fontes.titulo,
    color: cores.ouro,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
};
