import { Tabs } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, SafeAreaView  } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView  style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 70,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="transfer"
          options={{
            title: 'Transfer',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'swap-horizontal-outline' : 'swap-horizontal-sharp'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'timer-outline' : 'timer-sharp'} color={color} />
            ),
          }}
        />
         <Tabs.Screen
          name="saving"
          options={{
            title: 'Saving',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'bar-chart-sharp' : 'bar-chart-outline'} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Ensures the tab bar is at the bottom
    backgroundColor: '#fff',
  },
});
