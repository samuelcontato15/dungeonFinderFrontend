import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  usuario: string;
  email: string;
  bio?: string;
  fotoPerfil?: string | null;
  isAdmin?: boolean;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (emailOrUser: string, senha: string) => Promise<void>;
  signUp: (usuario: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  // Busca dados completos do usuário no backend pelo ID
  async function fetchFullUser(id: string): Promise<User | null> {
    try {
      const response = await api.get(`/usuarios/${id}`);
      const data = response.data;
      return {
        id: data.id,
        usuario: data.nick,
        email: data.email,
        bio: data.bio,
        fotoPerfil: data.fotoPerfil,
        isAdmin: data.isAdmin,
      };
    } catch (error) {
      console.error("Erro ao buscar dados completos do usuário:", error);
      return null;
    }
  }

  async function loadStoredUser() {
    try {
      const storedUser = await AsyncStorage.getItem("@DungeonFinder:user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Se temos ID, buscar dados atualizados do backend
        if (parsedUser.id) {
          const fullUser = await fetchFullUser(parsedUser.id);
          if (fullUser) {
            setUser(fullUser);
            // Atualizar storage com dados completos
            await AsyncStorage.setItem(
              "@DungeonFinder:user",
              JSON.stringify(fullUser),
            );
          } else {
            setUser(parsedUser);
          }
        } else {
          setUser(parsedUser);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar usuário:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Busca o ID real do usuário pelo nick após login
  async function buscarIdPorNick(nick: string): Promise<string> {
    try {
      const response =
        await api.get<{ id: string; nick: string }[]>("/usuarios");
      const encontrado = response.data.find(
        (u) => u.nick.toLowerCase() === nick.toLowerCase(),
      );
      return encontrado?.id ?? "";
    } catch {
      return "";
    }
  }

  async function signIn(emailOrUser: string, senha: string) {
    const response = await api.post<string>("/auth/login", {
      email: emailOrUser,
      senha,
    });

    const token = response.data;

    // Determina o nick a partir do email ou usuário digitado
    const nick = emailOrUser.includes("@")
      ? emailOrUser.split("@")[0]
      : emailOrUser;

    // Salva token primeiro para que as próximas chamadas já usem ele
    await AsyncStorage.setItem("@DungeonFinder:token", token);

    // Busca o ID real no backend
    const id = await buscarIdPorNick(nick);

    // Busca dados completos do usuário
    const fullUser = await fetchFullUser(id);

    if (!fullUser) {
      throw new Error("Usuário não encontrado no backend");
    }

    await AsyncStorage.setItem("@DungeonFinder:user", JSON.stringify(fullUser));
    setUser(fullUser);
  }

  async function signUp(usuario: string, email: string, senha: string) {
    try {
      const response = await api.post<string>("/auth/register", {
        nick: usuario,
        email,
        senha,
      });

      const token = response.data;
      await AsyncStorage.setItem("@DungeonFinder:token", token);

      // Busca o ID real no backend
      const id = await buscarIdPorNick(usuario);

      // Busca dados completos do usuário
      const fullUser = await fetchFullUser(id);

      if (!fullUser) {
        throw new Error("Usuário não encontrado após cadastro");
      }

      await AsyncStorage.setItem(
        "@DungeonFinder:user",
        JSON.stringify(fullUser),
      );
      setUser(fullUser);
    } catch (e: any) {
      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", JSON.stringify(e?.response?.data));
      console.log("MESSAGE:", e?.message);
      throw e;
    }
  }

  async function signOut() {
    await AsyncStorage.multiRemove([
      "@DungeonFinder:token",
      "@DungeonFinder:user",
    ]);
    setUser(null);
  }

  // Função para atualizar os dados do usuário localmente e no storage
  async function updateUser(updatedData: Partial<User>) {
    if (!user) return;

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    await AsyncStorage.setItem(
      "@DungeonFinder:user",
      JSON.stringify(updatedUser),
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
