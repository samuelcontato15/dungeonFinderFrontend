import { AuthProvider } from "@/context/AuthContext";
import { cores } from "@/theme/tema";
import { Cinzel_700Bold, Cinzel_900Black } from "@expo-google-fonts/cinzel";
import {
  CrimsonText_400Regular,
  CrimsonText_400Regular_Italic,
  CrimsonText_600SemiBold,
} from "@expo-google-fonts/crimson-text";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [fontesProntas, erroFontes] = useFonts({
    Cinzel_700Bold,
    Cinzel_900Black,
    CrimsonText_400Regular,
    CrimsonText_400Regular_Italic,
    CrimsonText_600SemiBold,
  });

  // Se as fontes falharem, o app segue com a fonte do sistema.
  if (!fontesProntas && !erroFontes) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: cores.fundo,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={cores.ouro} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: { backgroundColor: cores.fundo },
          }}
        >
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
