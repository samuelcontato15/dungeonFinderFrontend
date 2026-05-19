import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  usuario: string;
  email: string;
  bio?: string;
  fotoPerfil?: string | null;
  corAvatar?: string;
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
        corAvatar: data.corAvatar,
        isAdmin: data.isAdmin,
      };
    } catch (error: any) {
      // Token expirado ou inválido — limpa sessão e força novo login
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        await AsyncStorage.multiRemove(["@DungeonFinder:token", "@DungeonFinder:user"]);
      }
      return null;
    }
  }

  async function loadStoredUser() {
  try {
    setIsLoading(true);

    const [storedUser, token] = await AsyncStorage.multiGet([
      "@DungeonFinder:user",
      "@DungeonFinder:token",
    ]);

    const userData = storedUser[1];
    const tokenData = token[1];

    if (!userData || !tokenData) {
      setUser(null);
      return;
    }

    const parsedUser = JSON.parse(userData);

    if (!parsedUser?.id) {
      setUser(null);

      await AsyncStorage.multiRemove([
        "@DungeonFinder:user",
        "@DungeonFinder:token",
      ]);

      return;
    }

    const fullUser = await fetchFullUser(parsedUser.id);

    if (!fullUser) {
      setUser(null);

      await AsyncStorage.multiRemove([
        "@DungeonFinder:user",
        "@DungeonFinder:token",
      ]);

      return;
    }

    setUser(fullUser);

    await AsyncStorage.setItem(
      "@DungeonFinder:user",
      JSON.stringify(fullUser)
    );
  } catch (e) {
    console.error("Erro ao carregar usuário:", e);

    setUser(null);

    await AsyncStorage.multiRemove([
      "@DungeonFinder:user",
      "@DungeonFinder:token",
    ]);
  } finally {
    setIsLoading(false);
  }
}

  async function buscarIdPorNick(identificador: string): Promise<string> {
    try {
      const response = await api.get<any[]>("/usuarios");
      const encontrado = response.data.find(
        (u) =>
          u.nick?.toLowerCase() === identificador.toLowerCase() ||
          u.email?.toLowerCase() === identificador.toLowerCase()
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

    // Salva o token ANTES de qualquer outra chamada autenticada
    await AsyncStorage.setItem("@DungeonFinder:token", token);

    const id = await buscarIdPorNick(emailOrUser);

    if (!id) {
      throw new Error("Não foi possível localizar o seu ID de usuário.");
    }

    const fullUser = await fetchFullUser(id);

    if (!fullUser) {
      throw new Error("Usuário não encontrado no backend.");
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

      // Salva o token ANTES de qualquer outra chamada autenticada
      await AsyncStorage.setItem("@DungeonFinder:token", token);

      const id = await buscarIdPorNick(usuario);
      const fullUser = await fetchFullUser(id);

      if (!fullUser) {
        throw new Error("Usuário não encontrado após cadastro.");
      }

      await AsyncStorage.setItem("@DungeonFinder:user", JSON.stringify(fullUser));
      setUser(fullUser);
    } catch (e: any) {
      console.log("Erro no cadastro:", e?.message);
      throw e;
    }
  }

  async function signOut() {
    await AsyncStorage.multiRemove(["@DungeonFinder:token", "@DungeonFinder:user"]);
    setUser(null);
  }

  async function updateUser(updatedData: Partial<User>) {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    await AsyncStorage.setItem("@DungeonFinder:user", JSON.stringify(updatedUser));
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut, isAuthenticated: !!user, updateUser }}
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

export default AuthContext;