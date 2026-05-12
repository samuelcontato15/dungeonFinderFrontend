import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";

interface User {
  id: string;
  usuario: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (emailOrUser: string, senha: string) => Promise<void>;
  signUp: (usuario: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const storedUser = await AsyncStorage.getItem("@DungeonFinder:user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Erro ao carregar usuário:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Busca o ID real do usuário pelo nick após login
  async function buscarIdPorNick(nick: string): Promise<string> {
    try {
      const response = await api.get<{ id: string; nick: string }[]>("/usuarios");
      const encontrado = response.data.find(
        (u) => u.nick.toLowerCase() === nick.toLowerCase()
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

    const loggedUser: User = { id, usuario: nick, email: emailOrUser };

    await AsyncStorage.setItem("@DungeonFinder:user", JSON.stringify(loggedUser));
    setUser(loggedUser);
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

      const newUser: User = { id, usuario, email };
      await AsyncStorage.setItem("@DungeonFinder:user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (e: any) {
      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", JSON.stringify(e?.response?.data));
      console.log("MESSAGE:", e?.message);
      throw e;
    }
  }

  async function signOut() {
    await AsyncStorage.multiRemove(["@DungeonFinder:token", "@DungeonFinder:user"]);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut, isAuthenticated: !!user }}
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