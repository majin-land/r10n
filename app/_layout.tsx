global.Buffer = require('buffer').Buffer

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'
import 'react-native-get-random-values'

import { useColorScheme } from '@/hooks/useColorScheme'
import React from 'react'
import { WalletProvider } from '@/context/WalletContext'
import { StealthMetaAddressProvider } from '@/context/StealthMetaAddress'
import { AnnouncementsProvider } from '@/context/AnnouncementContext'
import ApolloProviderApps from '@/apollo'
import { StatusBar } from 'react-native'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <ApolloProviderApps>
      <WalletProvider>
        <StealthMetaAddressProvider>
          <AnnouncementsProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor="#007AFF"
              translucent={true}
            />
            <ThemeProvider
              value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
              <Stack>
                <Stack.Screen
                  name="(auth)/index"
                  options={{ headerShown: false }}
                />{' '}
                {/* Connect Wallet Screen */}
                <Stack.Screen
                  name="(tabs)"
                  options={{ headerShown: false }}
                />{' '}
                {/* Tabs for Home, Transfer, Activity */}
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </AnnouncementsProvider>
        </StealthMetaAddressProvider>
      </WalletProvider>
    </ApolloProviderApps>
  )
}
