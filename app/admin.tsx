import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Admin() {

  const { user } = useAuth();
  const router = useRouter();

  const [abaAberta, setAbaAberta] = useState<string | null>(null);

  if (!user?.isAdmin) {
    return <Redirect href="/home" />;
  }

  function toggleAba(nome: string) {
    setAbaAberta((prev) =>
      prev === nome ? null : nome
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Painel Administrativo
      </Text>

      <Text style={styles.subtitle}>
        Bem-vindo, {user.usuario}
      </Text>

      {/* USUÁRIOS */}

      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleAba("usuarios")}
      >
        <Ionicons
          name="people"
          size={28}
          color="#D4AF37"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Gerenciar Usuários
          </Text>

          <Text style={styles.cardText}>
            Visualizar, editar e remover usuários
          </Text>

          {abaAberta === "usuarios" && (
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => router.push("/admin/usuarios")}
              >
                <Text style={styles.menuText}>
                  Abrir gerenciamento
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* JOGOS */}

      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleAba("jogos")}
      >
        <Ionicons
          name="game-controller"
          size={28}
          color="#D4AF37"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Gerenciar Jogos
          </Text>

          <Text style={styles.cardText}>
            Adicionar e editar jogos
          </Text>

          {abaAberta === "jogos" && (
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => router.push("/admin/jogos")}
              >
                <Text style={styles.menuText}>
                  Abrir gerenciamento
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* GUILDAS */}

      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleAba("guildas")}
      >
        <Ionicons
          name="shield"
          size={28}
          color="#D4AF37"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Gerenciar Guildas
          </Text>

          <Text style={styles.cardText}>
            Controlar guildas e membros
          </Text>

          {abaAberta === "guildas" && (
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => router.push("/admin/guildas")}
              >
                <Text style={styles.menuText}>
                  Abrir gerenciamento
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* EVENTOS */}

      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleAba("eventos")}
      >
        <Ionicons
          name="calendar"
          size={28}
          color="#D4AF37"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Gerenciar Eventos
          </Text>

          <Text style={styles.cardText}>
            Criar e editar eventos
          </Text>

          {abaAberta === "eventos" && (
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => router.push("/admin/eventos")}
              >
                <Text style={styles.menuText}>
                  Abrir gerenciamento
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* RAIDS */}

      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleAba("raids")}
      >
        <Ionicons
          name="skull"
          size={28}
          color="#D4AF37"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Gerenciar Raids
          </Text>

          <Text style={styles.cardText}>
            Organizar raids do sistema
          </Text>

          {abaAberta === "raids" && (
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => router.push("/admin/raids")}
              >
                <Text style={styles.menuText}>
                  Abrir gerenciamento
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* RELATÓRIOS */}

      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleAba("relatorios")}
      >
        <Ionicons
          name="bar-chart"
          size={28}
          color="#D4AF37"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Relatórios
          </Text>

          <Text style={styles.cardText}>
            Estatísticas da plataforma
          </Text>

          {abaAberta === "relatorios" && (
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => router.push("/admin/relatorios")}
              >
                <Text style={styles.menuText}>
                  Abrir relatórios
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#111",
    padding: 20,
    gap: 16,
  },

  title: {
    color: "#D4AF37",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 40,
  },

  subtitle: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    borderWidth: 1,
    borderColor: "#333",
  },

  cardTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  cardText: {
    color: "#AAA",
    marginTop: 4,
    width: 220,
  },

  menu: {
    marginTop: 14,
  },

  menuButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  menuText: {
    color: "#111",
    fontWeight: "bold",
  },
});