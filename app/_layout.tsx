import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index"          />
          <Stack.Screen name="dungeonEntrada" />
          <Stack.Screen name="login"          />
          <Stack.Screen name="cadastro"       />
          <Stack.Screen name="home"           />
          <Stack.Screen name="comunidade"     />
          <Stack.Screen name="pesquisar"      />
          <Stack.Screen name="notificacao"    />
          <Stack.Screen name="perfil"         />
          <Stack.Screen name="config"         />
          <Stack.Screen name="guilda"         />
          <Stack.Screen name="amigos"         />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}