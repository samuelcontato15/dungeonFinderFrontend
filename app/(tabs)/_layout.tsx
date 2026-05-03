import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";


export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={estilos.loading}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/" />;
}

const estilos = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#0D0906",
    justifyContent: "center",
    alignItems: "center",
  },
});