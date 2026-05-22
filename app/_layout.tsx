import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index"          />
          <Stack.Screen name="dungeonEntrada" />
          <Stack.Screen name="login"          />
          <Stack.Screen name="cadastro"       />
          <Stack.Screen name="comunidade"     />
          <Stack.Screen name="pesquisar"      />
          <Stack.Screen name="notificacao"    />
          <Stack.Screen name="perfil"         />
          <Stack.Screen name="config"         />
          <Stack.Screen name="detalhes/guilda/[id]" />
          <Stack.Screen name="guildascriar"    />
          <Stack.Screen name="guildachat"     />
          <Stack.Screen name="criarraid"      />
          <Stack.Screen name="amigos"         />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}