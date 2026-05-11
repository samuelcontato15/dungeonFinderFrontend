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

   async function signIn(emailOrUser: string, senha: string) {
    const response = await api.post<string>("/auth/login", {
      email: emailOrUser,
      senha,
    });

    const token = response.data;

    const loggedUser: User = {
      id: "",
      usuario: emailOrUser.includes("@") ? emailOrUser.split("@")[0] : emailOrUser,
      email: emailOrUser,
    };

    await AsyncStorage.setItem("@DungeonFinder:token", token);
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
    const newUser: User = { id: "", usuario, email };

    await AsyncStorage.setItem("@DungeonFinder:token", token);
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