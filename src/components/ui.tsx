import { brilhoOuro, cores, fontes, gradientes, raios, sombra, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { forwardRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

/* ───────────── Tela ───────────── */

export function Tela({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require("../../assets/fundo1.png")}
      style={e.tela}
      resizeMode="cover"
    >
      <LinearGradient
        colors={gradientes.tela}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar barStyle="light-content" />
      {children}
    </ImageBackground>
  );
}

export function Carregando({ texto }: { texto?: string }) {
  return (
    <View style={e.carregando}>
      <ActivityIndicator size="large" color={cores.ouro} />
      {!!texto && <Text style={[tipo.italico, { marginTop: 12 }]}>{texto}</Text>}
    </View>
  );
}

/* ───────────── Cabeçalho ───────────── */

export function BotaoIcone({
  icone,
  onPress,
  cor = cores.ouro,
  tamanho = 40,
  style,
}: {
  icone: NomeIcone;
  onPress?: () => void;
  cor?: string;
  tamanho?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        e.botaoIcone,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
        style,
      ]}
    >
      <Ionicons name={icone} size={tamanho * 0.5} color={cor} />
    </TouchableOpacity>
  );
}

export function Cabecalho({
  titulo,
  subtitulo,
  direita,
  semVoltar,
  aoVoltar,
}: {
  titulo: string;
  subtitulo?: string;
  direita?: React.ReactNode;
  semVoltar?: boolean;
  aoVoltar?: () => void;
}) {
  const margens = useSafeAreaInsets();
  const roteador = useRouter();
  return (
    <View style={[e.cabecalho, { paddingTop: margens.top + 10 }]}>
      {!semVoltar && (
        <BotaoIcone
          icone="chevron-back"
          onPress={aoVoltar ?? (() => roteador.back())}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={e.cabecalhoTitulo} numberOfLines={1}>
          {titulo}
        </Text>
        {!!subtitulo && (
          <Text style={tipo.italico} numberOfLines={1}>
            {subtitulo}
          </Text>
        )}
      </View>
      {direita}
    </View>
  );
}

/* ───────────── Botão ───────────── */

type Variante = "primario" | "secundario" | "perigo" | "sucesso" | "neutro";

const CORES_VARIANTE: Record<Variante, { fundo: string; texto: string; borda: string }> = {
  primario: { fundo: cores.ouro, texto: cores.tinta, borda: cores.ouroClaro },
  secundario: { fundo: "rgba(212,175,55,0.08)", texto: cores.ouro, borda: cores.bordaForte },
  perigo: { fundo: cores.vinho, texto: "#FBE9E4", borda: "rgba(224,98,90,0.6)" },
  sucesso: { fundo: cores.musgo, texto: "#F0F8E8", borda: "rgba(143,203,107,0.6)" },
  neutro: { fundo: cores.madeira600, texto: cores.pergaminho, borda: cores.linha },
};

export function Botao({
  titulo,
  icone,
  onPress,
  carregando,
  disabled,
  variante = "primario",
  pequeno,
  style,
}: {
  titulo: string;
  icone?: NomeIcone;
  onPress?: () => void;
  carregando?: boolean;
  disabled?: boolean;
  variante?: Variante;
  pequeno?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = CORES_VARIANTE[variante];
  const inativo = disabled || carregando;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inativo}
      activeOpacity={0.8}
      style={[
        e.botao,
        pequeno && e.botaoPequeno,
        { backgroundColor: c.fundo, borderColor: c.borda },
        variante === "primario" && !pequeno && sombra,
        inativo && { opacity: 0.55 },
        style,
      ]}
    >
      {variante === "primario" && (
        <LinearGradient colors={gradientes.ouro} style={StyleSheet.absoluteFill} />
      )}
      {carregando ? (
        <ActivityIndicator size="small" color={c.texto} />
      ) : (
        <>
          {icone && <Ionicons name={icone} size={pequeno ? 14 : 18} color={c.texto} />}
          <Text
            style={[e.botaoTexto, pequeno && e.botaoTextoPequeno, { color: c.texto }]}
            numberOfLines={1}
          >
            {titulo}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/* ───────────── Campo ───────────── */

type CampoProps = TextInputProps & {
  label?: string;
  icone?: NomeIcone;
  erro?: string;
  direita?: React.ReactNode;
  estiloCaixa?: StyleProp<ViewStyle>;
};

export const Campo = forwardRef<TextInput, CampoProps>(function Campo(
  { label, icone, erro, direita, estiloCaixa, style, multiline, onFocus, onBlur, ...resto },
  ref
) {
  const [foco, setFoco] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {!!label && <Text style={tipo.rotulo}>{label}</Text>}
      <View
        style={[
          e.campo,
          multiline && { alignItems: "flex-start" },
          foco && e.campoFoco,
          !!erro && e.campoErro,
          estiloCaixa,
        ]}
      >
        {icone && (
          <Ionicons
            name={icone}
            size={18}
            color={foco ? cores.ouro : cores.textoApagado}
            style={multiline ? { marginTop: 13 } : undefined}
          />
        )}
        <TextInput
          ref={ref}
          placeholderTextColor={cores.textoApagado}
          selectionColor={cores.ouro}
          multiline={multiline}
          {...resto}
          onFocus={(ev) => {
            setFoco(true);
            onFocus?.(ev);
          }}
          onBlur={(ev) => {
            setFoco(false);
            onBlur?.(ev);
          }}
          style={[
            e.campoInput,
            multiline && { minHeight: 96, textAlignVertical: "top" },
            style,
          ]}
        />
        {direita}
      </View>
      {!!erro && (
        <View style={e.erroLinha}>
          <Ionicons name="alert-circle-outline" size={13} color={cores.vinhoClaro} />
          <Text style={e.erroTexto}>{erro}</Text>
        </View>
      )}
    </View>
  );
});

/* ───────────── Cartão, Avatar, Selo ───────────── */

export function Cartao({
  children,
  style,
  destaque,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  destaque?: boolean;
}) {
  return (
    <View style={[e.cartao, destaque && e.cartaoDestaque, style]}>{children}</View>
  );
}

export const estiloCartao = StyleSheet.create({
  base: {
    backgroundColor: cores.cartao,
    borderRadius: raios.g,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
  },
  linha: { flexDirection: "row", alignItems: "center", gap: 12 },
});

export function Avatar({
  uri,
  tamanho = 48,
  icone = "person",
  destaque,
  quadrado,
}: {
  uri?: string | null;
  tamanho?: number;
  icone?: NomeIcone;
  destaque?: boolean;
  quadrado?: boolean;
}) {
  const raio = quadrado ? raios.m : tamanho / 2;
  return (
    <View
      style={[
        e.avatar,
        { width: tamanho, height: tamanho, borderRadius: raio },
        destaque && { borderColor: cores.ouro, borderWidth: 2 },
        destaque && brilhoOuro,
      ]}
    >
      <View style={[e.avatarMiolo, { borderRadius: raio }]}>
        {uri ? (
          <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <Ionicons name={icone} size={tamanho * 0.46} color={cores.ouro} />
        )}
      </View>
    </View>
  );
}

type Tom = "ouro" | "musgo" | "vinho" | "ambar" | "neutro";

const CORES_TOM: Record<Tom, { fundo: string; texto: string }> = {
  ouro: { fundo: "rgba(212,175,55,0.16)", texto: cores.ouroClaro },
  musgo: { fundo: "rgba(78,122,58,0.28)", texto: cores.musgoClaro },
  vinho: { fundo: "rgba(142,42,42,0.32)", texto: cores.vinhoClaro },
  ambar: { fundo: "rgba(224,150,45,0.18)", texto: cores.ambar },
  neutro: { fundo: "rgba(232,213,163,0.1)", texto: cores.textoSuave },
};

export function Selo({
  texto,
  icone,
  tom = "ouro",
}: {
  texto: string;
  icone?: NomeIcone;
  tom?: Tom;
}) {
  const c = CORES_TOM[tom];
  return (
    <View style={[e.selo, { backgroundColor: c.fundo, borderColor: c.texto + "55" }]}>
      {icone && <Ionicons name={icone} size={12} color={c.texto} />}
      <Text style={[e.seloTexto, { color: c.texto }]}>{texto}</Text>
    </View>
  );
}

/* ───────────── Seções ───────────── */

export function TituloSecao({
  titulo,
  direita,
  style,
}: {
  titulo: string;
  direita?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[e.tituloSecao, style]}>
      <View style={e.losango} />
      <Text style={e.tituloSecaoTexto}>{titulo}</Text>
      <LinearGradient
        colors={[cores.bordaForte, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={e.tituloSecaoLinha}
      />
      {direita}
    </View>
  );
}

export function Divisor({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[e.divisor, style]}>
      <LinearGradient
        colors={["transparent", cores.bordaForte]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={e.divisorLinha}
      />
      <View style={e.losango} />
      <LinearGradient
        colors={[cores.bordaForte, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={e.divisorLinha}
      />
    </View>
  );
}

export function EstadoVazio({
  icone = "skull-outline",
  texto,
  dica,
}: {
  icone?: NomeIcone;
  texto: string;
  dica?: string;
}) {
  return (
    <View style={e.vazio}>
      <View style={e.vazioIcone}>
        <Ionicons name={icone} size={26} color={cores.ouroEscuro} />
      </View>
      <Text style={[tipo.italico, { textAlign: "center", fontSize: 16 }]}>{texto}</Text>
      {!!dica && (
        <Text style={[tipo.suave, { textAlign: "center", color: cores.textoApagado }]}>
          {dica}
        </Text>
      )}
    </View>
  );
}

export function Abas<T extends string>({
  opcoes,
  valor,
  aoMudar,
}: {
  opcoes: { chave: T; rotulo: string; icone?: NomeIcone }[];
  valor: T;
  aoMudar: (chave: T) => void;
}) {
  return (
    <View style={e.abas}>
      {opcoes.map((o) => {
        const ativa = o.chave === valor;
        return (
          <TouchableOpacity
            key={o.chave}
            style={[e.aba, ativa && e.abaAtiva]}
            onPress={() => aoMudar(o.chave)}
            activeOpacity={0.8}
          >
            {ativa && (
              <LinearGradient colors={gradientes.ouro} style={StyleSheet.absoluteFill} />
            )}
            {o.icone && (
              <Ionicons
                name={o.icone}
                size={15}
                color={ativa ? cores.tinta : cores.textoSuave}
              />
            )}
            <Text style={[e.abaTexto, ativa && { color: cores.tinta }]}>{o.rotulo}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  carregando: { flex: 1, justifyContent: "center", alignItems: "center" },

  botaoIcone: {
    backgroundColor: "rgba(18,12,8,0.78)",
    borderWidth: 1,
    borderColor: cores.borda,
    justifyContent: "center",
    alignItems: "center",
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  cabecalhoTitulo: {
    fontFamily: fontes.titulo,
    color: cores.pergaminho,
    fontSize: 20,
    letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },

  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: raios.m,
    borderWidth: 1,
    overflow: "hidden",
  },
  botaoPequeno: { minHeight: 34, paddingHorizontal: 14, borderRadius: raios.pilula, gap: 5 },
  botaoTexto: { fontFamily: fontes.titulo, fontSize: 14, letterSpacing: 1.2 },
  botaoTextoPequeno: { fontSize: 11, letterSpacing: 0.8 },

  campo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: cores.campo,
    borderRadius: raios.m,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
  },
  campoFoco: { borderColor: cores.ouro, backgroundColor: "rgba(10,6,3,0.8)" },
  campoErro: { borderColor: cores.vinhoClaro },
  campoInput: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
    fontFamily: fontes.corpo,
    fontSize: 17,
    color: cores.texto,
    // remove o contorno azul no navegador
    ...({ outlineStyle: "none" } as object),
  },
  erroLinha: { flexDirection: "row", alignItems: "center", gap: 4 },
  erroTexto: { fontFamily: fontes.corpo, color: cores.vinhoClaro, fontSize: 14 },

  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: raios.g,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
  },
  cartaoDestaque: { borderColor: cores.bordaForte },

  avatar: {
    borderWidth: 1,
    borderColor: cores.bordaForte,
    backgroundColor: cores.madeira700,
  },
  avatarMiolo: {
    flex: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  selo: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: raios.pilula,
    borderWidth: 1,
  },
  seloTexto: { fontFamily: fontes.titulo, fontSize: 10, letterSpacing: 0.8 },

  losango: {
    width: 7,
    height: 7,
    backgroundColor: cores.ouro,
    transform: [{ rotate: "45deg" }],
  },
  tituloSecao: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  tituloSecaoTexto: {
    fontFamily: fontes.titulo,
    color: cores.pergaminho,
    fontSize: 15,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  tituloSecaoLinha: { flex: 1, height: 1 },
  divisor: { flexDirection: "row", alignItems: "center", gap: 10 },
  divisorLinha: { flex: 1, height: 1 },

  vazio: { alignItems: "center", gap: 8, paddingVertical: 28, paddingHorizontal: 20 },
  vazioIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: "rgba(18,12,8,0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  abas: {
    flexDirection: "row",
    backgroundColor: cores.campo,
    borderRadius: raios.m,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 4,
    gap: 4,
  },
  aba: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: raios.p,
    overflow: "hidden",
  },
  abaAtiva: {},
  abaTexto: {
    fontFamily: fontes.titulo,
    color: cores.textoSuave,
    fontSize: 12,
    letterSpacing: 1.2,
  },
});
