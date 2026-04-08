import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { UchumiTabBar } from '@/src/components/uchumi-tab-bar';

export default function AppTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <UchumiTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarShowLabel: false,
        tabBarIconStyle: styles.tabIcon,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="folder.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Mouvements',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="list.bullet.rectangle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="gearshape.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    marginBottom: 0,
  },
});
