import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar, Botao, Cabecalho, Campo, Cartao, EstadoVazio, Selo, Tela, TituloSecao, estiloCartao } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { cores, fontes, raios, tipo } from "@/theme/tema";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const categoriasBase = [
  { nome: "Novidade", valor: "NOVIDADE" },
  { nome: "MMO", valor: "MMO" },
  { nome: "RPG de Mesa", valor: "RPG" },
];

const combinacoes: Record<string, string> = {
  "": "MMO",
  "MMO": "MMO",
  "NOVIDADE": "NOVIDADE",
  "RPG": "RPG",
  "MMO,NOVIDADE": "NOVIDADE_MMO",
  "NOVIDADE,RPG": "NOVIDADE_RPG",
  "MMO,RPG": "MMO_RPG",
  "MMO,NOVIDADE,RPG": "NOVIDADE_MMO_RPG",
};

function enumParaCheckboxes(valor: string): string[] {
  if (!valor) return [];
  if (valor === "NOVIDADE_MMO_RPG") return ["NOVIDADE", "MMO", "RPG"];
  if (valor === "NOVIDADE_MMO") return ["NOVIDADE", "MMO"];
  if (valor === "NOVIDADE_RPG") return ["NOVIDADE", "RPG"];
  if (valor === "MMO_RPG") return ["MMO", "RPG"];
  if (valor === "NOVIDADE") return ["NOVIDADE"];
  if (valor === "MMO") return ["MMO"];
  if (valor === "RPG") return ["RPG"];
  return [];
}

export default function Jogos() {
  const { user } = useAuth();

  const [jogos, setJogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [capa, setCapa] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [checkboxes, setCheckboxes] = useState<string[]>([]);

  function gerarSlug(texto: string): string {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function carregarJogos() {
    try {
      const response = await api.get("/jogos");
      setJogos(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Erro ao carregar jogos");
    }
  }

  function limparFormulario() {
    setNome("");
    setCapa("");
    setCheckboxes([]);
    setEditandoId(null);
  }

  function obterCategoria(): string {
    const chave = [...checkboxes].sort().join(",");
    return combinacoes[chave] || "MMO";
  }

  
  async function salvarJogo() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Nome do jogo é obrigatório");
      return;
    }

    const slug = gerarSlug(nome);
    const payload = {
      nome: nome.trim(),
      slug,
      capa: capa || "",
      categoria: obterCategoria(),
    };


    setLoading(true);
    try {
      if (editandoId) {
        await api.put(`/jogos/${editandoId}`, payload, {
          headers: { "X-Usuario-Id": user?.id },
        });
        Alert.alert("Sucesso", "Jogo atualizado");
      } else {
        await api.post("/jogos", payload, {
          headers: { "X-Usuario-Id": user?.id },
        });
        Alert.alert("Sucesso", "Jogo criado");
      }
      limparFormulario();
      carregarJogos();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao salvar jogo";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  function iniciarEdicao(item: any) {
    setNome(item.nome);
    setCapa(item.capa || "");
    setCheckboxes(enumParaCheckboxes(item.categoria));
    setEditandoId(item.id);
  }

  async function deletarJogo(id: string) {
    Alert.alert("Confirmar", "Tem certeza que deseja deletar este jogo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/jogos/${id}`, {
              headers: { "X-Usuario-Id": user?.id },
            });
            Alert.alert("Sucesso", "Jogo removido");
            carregarJogos();
            if (editandoId === id) limparFormulario();
          } catch {
            Alert.alert("Erro", "Erro ao deletar");
          }
        },
      },
    ]);
  }

  async function escolherImagem() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled) {
      const img = result.assets[0];
      const base64String = img.base64 ? `data:image/jpeg;base64,${img.base64}` : img.uri;
      setCapa(base64String);
    }
  }

  function removerCapa() {
    setCapa("");
  }

  function toggleCheckbox(valor: string) {
    setCheckboxes(prev =>
      prev.includes(valor) ? prev.filter(v => v !== valor) : [...prev, valor]
    );
  }

  useEffect(() => {
    carregarJogos();
  }, []);

  const insets = useSafeAreaInsets();

  const formulario = (
    <View style={{ gap: 20, marginBottom: 6 }}>
      <Cartao style={styles.formCard} destaque={!!editandoId}>
        {editandoId && <Selo texto="Editando jogo" icone="create" tom="ambar" />}

        <Campo
          label="Nome do jogo *"
          icone="game-controller-outline"
          placeholder="Nome do jogo *"
          value={nome}
          onChangeText={setNome}
        />

        {nome.trim() !== "" && (
          <Text style={styles.slugPreview}>Slug: {gerarSlug(nome)}</Text>
        )}

        <View style={{ gap: 8 }}>
          <Text style={tipo.rotulo}>Categorias *</Text>
          <View style={styles.checkboxGroup}>
            {categoriasBase.map(cat => {
              const marcado = checkboxes.includes(cat.valor);
              return (
                <TouchableOpacity
                  key={cat.valor}
                  style={[styles.checkbox, marcado && styles.checkboxAtivo]}
                  onPress={() => toggleCheckbox(cat.valor)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={marcado ? "checkbox" : "square-outline"}
                    size={18}
                    color={marcado ? cores.ouroClaro : cores.textoApagado}
                  />
                  <Text style={[styles.checkboxLabel, marcado && { color: cores.ouroClaro }]}>{cat.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={tipo.rotulo}>Capa do jogo</Text>
          {capa ? (
            <View style={{ gap: 10 }}>
              <Image source={{ uri: capa }} style={styles.previewCapa} />
              <View style={styles.botoesCapa}>
                <Botao titulo="Trocar" icone="image-outline" variante="secundario" pequeno onPress={escolherImagem} />
                <Botao titulo="Remover" icone="trash-outline" variante="perigo" pequeno onPress={removerCapa} />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.botaoSelecionarCapa} onPress={escolherImagem} activeOpacity={0.8}>
              <Ionicons name="cloud-upload-outline" size={20} color={cores.ouro} />
              <Text style={tipo.italico}>Escolher imagem da galeria</Text>
            </TouchableOpacity>
          )}

          <Campo
            icone="link-outline"
            placeholder="Ou insira URL da capa (opcional)"
            value={capa}
            onChangeText={setCapa}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formButtons}>
          <Botao
            titulo={editandoId ? "Atualizar Jogo" : "Criar Jogo"}
            onPress={salvarJogo}
            carregando={loading}
            style={{ flex: 1 }}
          />

          {editandoId && (
            <Botao titulo="Cancelar" variante="neutro" onPress={limparFormulario} style={{ flex: 1 }} />
          )}
        </View>
      </Cartao>

      <TituloSecao titulo="Jogos cadastrados" style={{ marginBottom: 0 }} />
    </View>
  );

  return (
    <Tela>
      <Cabecalho titulo="Gerenciar Jogos" subtitulo="O catálogo de aventuras" />

      <FlatList
        data={jogos}
        keyExtractor={item => item.id}
        ListHeaderComponent={formulario}
        ListEmptyComponent={
          <EstadoVazio icone="game-controller-outline" texto="Nenhum jogo cadastrado" />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[estiloCartao.base, estiloCartao.linha, { padding: 10 }]}>
            <Avatar uri={item.capa} tamanho={60} icone="game-controller" quadrado />
            <View style={styles.cardInfo}>
              <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.slug} numberOfLines={1}>slug: {item.slug}</Text>
              <Selo texto={item.categoria || "MMO"} />
            </View>
            <View style={styles.cardActions}>
              <Botao titulo="Editar" variante="secundario" pequeno onPress={() => iniciarEdicao(item)} />
              <Botao titulo="Deletar" variante="perigo" pequeno onPress={() => deletarJogo(item.id)} />
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: insets.bottom + 30, gap: 10 }}
      />
    </Tela>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: 16, padding: 18 },
  slugPreview: { fontFamily: fontes.corpoItalico, color: cores.textoSuave, fontSize: 14, marginTop: -8 },
  checkboxGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: raios.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.campo,
  },
  checkboxAtivo: { borderColor: cores.ouro, backgroundColor: "rgba(212,175,55,0.14)" },
  checkboxLabel: { fontFamily: fontes.corpoForte, color: cores.textoSuave, fontSize: 15 },
  botaoSelecionarCapa: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.campo,
    borderRadius: raios.m,
    paddingVertical: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    borderStyle: "dashed",
  },
  previewCapa: { width: "100%", height: 150, borderRadius: raios.m, backgroundColor: cores.madeira900, resizeMode: "cover" },
  botoesCapa: { flexDirection: "row", gap: 10 },
  formButtons: { flexDirection: "row", gap: 12 },
  cardInfo: { flex: 1, gap: 3 },
  nome: { fontFamily: fontes.titulo, color: cores.pergaminho, fontSize: 14, letterSpacing: 0.5 },
  slug: { ...tipo.suave, fontSize: 13 },
  cardActions: { gap: 8 },
});
