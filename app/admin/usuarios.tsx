import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Avatar, Botao, Cabecalho, Campo, Cartao, Selo, Tela, TituloSecao, estiloCartao } from "@/components/ui";
import api from "@/services/api";
import { cores, fontes, tipo } from "@/theme/tema";

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
      const payload: any = { nick, email, bio };
      if (senhaHash.trim()) payload.senhaHash = senhaHash;

      await api.put(`/usuarios/${id}`, payload);

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
    <Tela>
      <Cabecalho titulo="Usuários" subtitulo="Os heróis registrados" />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Cartao style={styles.form} destaque={!!usuarioSelecionado}>
          {usuarioSelecionado && (
            <Selo texto={`Editando ${usuarioSelecionado.nick}`} icone="create" tom="ambar" />
          )}

          <Campo
            label="Nick"
            icone="person-outline"
            placeholder="Nick"
            value={nick}
            onChangeText={setNick}
            autoCapitalize="none"
          />

          <Campo
            label="Email"
            icone="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Campo
            label="Senha"
            icone="lock-closed-outline"
            placeholder={
              usuarioSelecionado
                ? "Nova senha (deixe em branco para não alterar)"
                : "Senha"
            }
            secureTextEntry
            value={senhaHash}
            onChangeText={setSenhaHash}
          />

          <Campo
            label="Bio"
            placeholder="Bio"
            value={bio}
            onChangeText={setBio}
          />

          {usuarioSelecionado ? (
            <Botao
              titulo="Salvar edição"
              icone="save-outline"
              onPress={() => editarUsuario(usuarioSelecionado.id)}
            />
          ) : (
            <Botao
              titulo="Criar usuário"
              icone="person-add-outline"
              variante="sucesso"
              onPress={criarUsuario}
            />
          )}
        </Cartao>

        <TituloSecao titulo="Usuários cadastrados" style={{ marginTop: 8, marginBottom: 0 }} />

        <FlatList
          scrollEnabled={false}
          data={usuarios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <View style={[estiloCartao.base, estiloCartao.linha]}>
              <Avatar uri={item.fotoPerfil} tamanho={48} />

              <View style={{ flex: 1 }}>
                <Text style={styles.nome} numberOfLines={1}>{item.nick}</Text>

                <Text style={tipo.suave} numberOfLines={1}>{item.email}</Text>

                <Text style={tipo.italico} numberOfLines={2}>{item.bio || "Sem bio"}</Text>
              </View>

              <View style={{ gap: 8 }}>
                <Botao
                  titulo="Editar"
                  variante="secundario"
                  pequeno
                  onPress={async () => {
                    const response = await api.get(`/usuarios/${item.id}`);
                    const usuario = response.data;
                    setUsuarioSelecionado(usuario);
                    setNick(usuario.nick || "");
                    setEmail(usuario.email || "");
                    setSenhaHash("");
                    setBio(usuario.bio || "");
                  }}
                />

                <Botao
                  titulo="Deletar"
                  variante="perigo"
                  pequeno
                  onPress={() => deletarUsuario(item.id)}
                />
              </View>
            </View>
          )}
        />
      </ScrollView>
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 40, gap: 16 },
  form: { gap: 14, padding: 18 },
  nome: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 15, letterSpacing: 0.6 },
});
