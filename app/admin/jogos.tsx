import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

// Mapeamento dos valores do enum para os checkboxes
const categoriasBase = [
  { nome: "Novidade", valor: "NOVIDADE" },
  { nome: "MMO", valor: "MMO" },
  { nome: "RPG de Mesa", valor: "RPG" },
];

// Combinações possíveis
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

// Converte o valor do enum para array de checkboxes ativos
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

  // Gera slug a partir do nome
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

  // Calcula o valor do enum a partir dos checkboxes selecionados
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Jogos</Text>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Nome do jogo *"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
        />

        {nome.trim() !== "" && (
          <Text style={styles.slugPreview}>Slug: {gerarSlug(nome)}</Text>
        )}

        <Text style={styles.label}>Categorias *</Text>
        <View style={styles.checkboxGroup}>
          {categoriasBase.map(cat => (
            <TouchableOpacity
              key={cat.valor}
              style={styles.checkbox}
              onPress={() => toggleCheckbox(cat.valor)}
            >
              <Ionicons
                name={checkboxes.includes(cat.valor) ? "checkbox" : "square-outline"}
                size={22}
                color="#D4AF37"
              />
              <Text style={styles.checkboxLabel}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Capa do jogo</Text>
        {capa ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capa }} style={styles.previewCapa} />
            <View style={styles.botoesCapa}>
              <TouchableOpacity style={styles.botaoEscolherCapa} onPress={escolherImagem}>
                <Ionicons name="image-outline" size={16} color="#FFF" />
                <Text style={styles.botaoTxt}>Trocar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoRemoverCapa} onPress={removerCapa}>
                <Ionicons name="trash-outline" size={16} color="#FFF" />
                <Text style={styles.botaoTxt}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.botaoSelecionarCapa} onPress={escolherImagem}>
            <Ionicons name="cloud-upload-outline" size={20} color="#D4AF37" />
            <Text style={styles.botaoSelecionarCapaTxt}>Escolher imagem da galeria</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.input, styles.inputUrl]}
          placeholder="Ou insira URL da capa (opcional)"
          placeholderTextColor="#888"
          value={capa}
          onChangeText={setCapa}
        />

        <View style={styles.formButtons}>
          <TouchableOpacity style={styles.botaoSalvar} onPress={salvarJogo} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.botaoTxt}>{editandoId ? "Atualizar Jogo" : "Criar Jogo"}</Text>
            )}
          </TouchableOpacity>

          {editandoId && (
            <TouchableOpacity style={styles.botaoCancelar} onPress={limparFormulario}>
              <Text style={styles.botaoTxt}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={jogos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.capa ? (
              <Image source={{ uri: item.capa }} style={styles.cardCapa} />
            ) : (
              <View style={styles.cardCapaPlaceholder}>
                <Ionicons name="game-controller" size={24} color="#555" />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.slug}>slug: {item.slug}</Text>
              <Text style={styles.categoria}>categoria: {item.categoria || "MMO"}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editar} onPress={() => iniciarEdicao(item)}>
                <Text style={styles.botaoTxt}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deletar} onPress={() => deletarJogo(item.id)}>
                <Text style={styles.botaoTxt}>Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  title: { color: "#D4AF37", fontSize: 28, fontWeight: "bold", marginTop: 40, marginBottom: 20, textAlign: "center" },
  formCard: { backgroundColor: "#1E1E1E", borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#333" },
  input: { backgroundColor: "#2A2A2A", color: "#FFF", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  inputUrl: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#333" },
  label: { color: "#CCC", fontSize: 14, marginBottom: 6, marginTop: 4 },
  slugPreview: { color: "#AAA", fontSize: 12, marginTop: -6, marginBottom: 12, paddingLeft: 4 },
  checkboxGroup: { flexDirection: "row", gap: 20, marginBottom: 12 },
  checkbox: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkboxLabel: { color: "#FFF", fontSize: 14 },
  botaoSelecionarCapa: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#2A2A2A", borderRadius: 10, paddingVertical: 12, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: "#D4AF37", borderStyle: "dashed" },
  botaoSelecionarCapaTxt: { color: "#D4AF37", fontSize: 14, fontWeight: "500" },
  previewContainer: { alignItems: "center", marginBottom: 12 },
  previewCapa: { width: "100%", height: 150, borderRadius: 12, marginBottom: 8, backgroundColor: "#000", resizeMode: "cover" },
  botoesCapa: { flexDirection: "row", gap: 12 },
  botaoEscolherCapa: { flexDirection: "row", alignItems: "center", backgroundColor: "#1565C0", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, gap: 6 },
  botaoRemoverCapa: { flexDirection: "row", alignItems: "center", backgroundColor: "#B00020", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, gap: 6 },
  formButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  botaoSalvar: { flex: 1, backgroundColor: "#D4AF37", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  botaoCancelar: { flex: 1, backgroundColor: "#555", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  botaoTxt: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  card: { backgroundColor: "#1E1E1E", borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#2A2A2A" },
  cardCapa: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: "#000" },
  cardCapaPlaceholder: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: "#2A2A2A", justifyContent: "center", alignItems: "center" },
  cardInfo: { flex: 1 },
  nome: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  slug: { color: "#AAA", fontSize: 12 },
  categoria: { color: "#D4AF37", fontSize: 11, marginTop: 2 },
  cardActions: { gap: 8 },
  editar: { backgroundColor: "#1565C0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: "center" },
  deletar: { backgroundColor: "#B00020", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: "center" },
});