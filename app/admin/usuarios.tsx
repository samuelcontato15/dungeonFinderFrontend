import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";

import api from "@/services/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [senhaHash, setSenhaHash] = useState("");
  const [bio, setBio] = useState("");

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);

  async function carregarUsuarios() {
    try {
      const response = await api.get("/usuarios");

      setUsuarios(response.data);
    } catch {
      Alert.alert("Erro", "Erro ao carregar usuários");
    }
  }

  async function criarUsuario() {
    try {
      await api.post("/usuarios", {
        nick,
        email,
        senhaHash,
        bio,
      });

      Alert.alert("Sucesso", "Usuário criado");

      limparCampos();

      carregarUsuarios();
    } catch {
      Alert.alert("Erro", "Erro ao criar usuário");
    }
  }

  async function editarUsuario(id: string) {
    try {
      await api.put(`/usuarios/${id}`, {
        nick,
        bio,
      });

      Alert.alert("Sucesso", "Usuário atualizado");

      limparCampos();

      carregarUsuarios();

      setUsuarioSelecionado(null);
    } catch {
      Alert.alert("Erro", "Erro ao editar");
    }
  }

  async function deletarUsuario(id: string) {
    try {
      await api.delete(`/usuarios/${id}`);

      carregarUsuarios();

      Alert.alert("Sucesso", "Usuário deletado");
    } catch {
      Alert.alert("Erro", "Erro ao deletar");
    }
  }

  function limparCampos() {
    setNick("");
    setEmail("");
    setSenhaHash("");
    setBio("");
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Usuários
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nick"
        placeholderTextColor="#999"
        value={nick}
        onChangeText={setNick}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        secureTextEntry
        value={senhaHash}
        onChangeText={setSenhaHash}
      />

      <TextInput
        style={styles.input}
        placeholder="Bio"
        placeholderTextColor="#999"
        value={bio}
        onChangeText={setBio}
      />

      {usuarioSelecionado ? (
        <TouchableOpacity
          style={styles.editar}
          onPress={() =>
            editarUsuario(usuarioSelecionado.id)
          }
        >
          <Text style={styles.botaoTxt}>
            Salvar edição
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.criar}
          onPress={criarUsuario}
        >
          <Text style={styles.botaoTxt}>
            Criar usuário
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        scrollEnabled={false}
        data={usuarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>
                {item.nick}
              </Text>

              <Text style={styles.texto}>
                {item.email}
              </Text>

              <Text style={styles.bio}>
                {item.bio || "Sem bio"}
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              <TouchableOpacity
                style={styles.editar}
                onPress={() => {
                  setUsuarioSelecionado(item);

                  setNick(item.nick);
                  setEmail(item.email);
                  setBio(item.bio || "");
                }}
              >
                <Text style={styles.botaoTxt}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deletar}
                onPress={() =>
                  deletarUsuario(item.id)
                }
              >
                <Text style={styles.botaoTxt}>
                  Deletar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },

  title: {
    color: "#D4AF37",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  criar: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  editar: {
    backgroundColor: "#1565C0",
    padding: 10,
    borderRadius: 8,
  },

  deletar: {
    backgroundColor: "#B00020",
    padding: 10,
    borderRadius: 8,
  },

  botaoTxt: {
    color: "#FFF",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  nome: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  texto: {
    color: "#AAA",
    marginTop: 4,
  },

  bio: {
    color: "#CCC",
    marginTop: 6,
    width: 180,
  },
});