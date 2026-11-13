import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Botao, Cabecalho, Tela } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { cores, fontes, raios, tipo } from "@/theme/tema";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECOES = [
  { chave: "usuarios", icone: "people", titulo: "Gerenciar Usuários", texto: "Visualizar, editar e remover usuários", rota: "/admin/usuarios", acao: "Abrir gerenciamento" },
  { chave: "jogos", icone: "game-controller", titulo: "Gerenciar Jogos", texto: "Adicionar e editar jogos", rota: "/admin/jogos", acao: "Abrir gerenciamento" },
  { chave: "guildas", icone: "shield", titulo: "Gerenciar Guildas", texto: "Controlar guildas e membros", rota: "/admin/guildas", acao: "Abrir gerenciamento" },
  { chave: "eventos", icone: "calendar", titulo: "Gerenciar Eventos", texto: "Criar e editar eventos", rota: "/admin/eventos", acao: "Abrir gerenciamento" },
  { chave: "raids", icone: "skull", titulo: "Gerenciar Raids", texto: "Organizar raids do sistema", rota: "/admin/raids", acao: "Abrir gerenciamento" },
  { chave: "relatorios", icone: "bar-chart", titulo: "Relatórios", texto: "Estatísticas da plataforma", rota: "/admin/relatorios", acao: "Abrir relatórios" },
] as const;

export default function Admin() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [abaAberta, setAbaAberta] = useState<string | null>(null);

  if (!user?.isAdmin) {
    return <Redirect href="/telaJogo" />;
  }

  function toggleAba(nome: string) {
    setAbaAberta((prev) => (prev === nome ? null : nome));
  }

  return (
    <Tela>
      <Cabecalho
        titulo="Painel Administrativo"
        subtitulo={`Bem-vindo, ${user.usuario}`}
      />

      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {SECOES.map((secao) => {
          const aberta = abaAberta === secao.chave;
          return (
            <TouchableOpacity
              key={secao.chave}
              style={[styles.card, aberta && styles.cardAberto]}
              onPress={() => toggleAba(secao.chave)}
              activeOpacity={0.85}
            >
              <View style={styles.linha}>
                <View style={styles.icone}>
                  <Ionicons name={secao.icone} size={24} color={cores.ouro} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{secao.titulo}</Text>
                  <Text style={tipo.suave}>{secao.texto}</Text>
                </View>

                <Ionicons
                  name={aberta ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={cores.ouro}
                />
              </View>

              {aberta && (
                <Botao
                  titulo={secao.acao}
                  icone="arrow-forward"
                  pequeno
                  onPress={() => router.push(secao.rota)}
                  style={styles.menuButton}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 6, gap: 12 },
  card: {
    backgroundColor: cores.cartao,
    borderRadius: raios.g,
    padding: 16,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  cardAberto: { borderColor: cores.bordaForte },
  linha: { flexDirection: "row", alignItems: "center", gap: 14 },
  icone: {
    width: 48,
    height: 48,
    borderRadius: raios.m,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: cores.borda,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontFamily: fontes.titulo,
    color: cores.pergaminho,
    fontSize: 15,
    letterSpacing: 0.6,
  },
  menuButton: { alignSelf: "flex-start", marginTop: 14, marginLeft: 62 },
});
