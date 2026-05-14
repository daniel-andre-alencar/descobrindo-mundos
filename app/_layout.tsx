import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// mantém a splash visível até o app estar pronto
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  useEffect(() => {
    // esconde a splash após 2 segundos
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="worlds" options={{ headerShown: false }} />
      <Stack.Screen name="parent" options={{ headerShown: false }} />
      <Stack.Screen name="report" options={{ headerShown: false }} />
      <Stack.Screen name="reward" options={{ headerShown: false }} />
      <Stack.Screen name="game/association" options={{ headerShown: false }} />
      <Stack.Screen name="game/emotions" options={{ headerShown: false }} />
      <Stack.Screen name="game/sensory" options={{ headerShown: false }} />
      <Stack.Screen name="game/puzzle" options={{ headerShown: false }} />
    </Stack>
  );
}