import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";
import { AuthProvider } from "../context/AuthContext";
import { PatientProvider } from "../context/PatientContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <PatientProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              gestureEnabled: true,
            }}
          >
            {/* Screens */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </PatientProvider>
    </AuthProvider>
  );
}