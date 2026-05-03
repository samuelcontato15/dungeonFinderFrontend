import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  async function signIn(emailOrUser: string, _senha: string) {
    const mockUser: User = {
      id: "1",
      usuario: emailOrUser.includes("@") ? emailOrUser.split("@")[0] : emailOrUser,
      email: emailOrUser.includes("@") ? emailOrUser : `${emailOrUser}@dungeon.com`,
    };
    await AsyncStorage.setItem("@DungeonFinder:user", JSON.stringify(mockUser));
    setUser(mockUser);
  }

  async function signUp(usuario: string, email: string, _senha: string) {
    const mockUser: User = { id: Date.now().toString(), usuario, email };
    await AsyncStorage.setItem("@DungeonFinder:user", JSON.stringify(mockUser));
    setUser(mockUser);
  }

  async function signOut() {
    await AsyncStorage.removeItem("@DungeonFinder:user");
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