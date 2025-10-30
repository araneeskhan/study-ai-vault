import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/themes/index';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#c6dadd' : '#0d3542',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#dfe4eb' : '#092c41',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#2d575500',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          height: 84,
          marginHorizontal: 26, 
          paddingTop: 2,
          position: 'absolute',
          borderWidth: 4,
          borderColor: colorScheme === 'dark' 
            ? 'rgba(6, 49, 44, 0.3)' 
            : 'rgba(8, 21, 41, 0.25)',
          bottom: 20,
          borderRadius: 30,
          elevation: 8,
          shadowColor: colorScheme === 'dark' ? '#6d6363' : '#000',
          shadowOffset: { width: 10, height: 12 },
          shadowOpacity: colorScheme === 'dark' ? 0.9 : 0.95,
          shadowRadius: 34,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, borderRadius: 28, overflow: 'hidden' }}>
            {/* Solid background layer for better visibility */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colorScheme === 'dark' 
                  ? '#1e293b' 
                  : '#f8fafc',
              }}
            />
            
            <BlurView
              intensity={colorScheme === 'dark' ? 40 : 70}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              style={{
                flex: 1,
                backgroundColor: colorScheme === 'dark' 
                  ? 'rgba(30, 41, 59, 0.95)' 
                  : 'rgba(248, 250, 252, 0.95)',
                borderWidth: 2,
                borderColor: colorScheme === 'dark' 
                  ? 'rgba(148, 163, 184, 0.3)' 
                  : 'rgba(148, 163, 184, 0.25)',
              }}
            />
            
            {/* Strong glossy top highlight */}
            <LinearGradient
              colors={[
                colorScheme === 'dark' 
                  ? 'rgba(148, 163, 184, 0.25)' 
                  : 'rgba(255, 255, 255, 0.9)',
                'transparent',
              ]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
              }}
            />
            
            {/* Bottom gradient for depth */}
            <LinearGradient
              colors={[
                'transparent',
                colorScheme === 'dark' 
                  ? 'rgba(0, 0, 0, 0.4)' 
                  : 'rgba(100, 116, 139, 0.15)',
              ]}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
              }}
            />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer, 
              focused && (colorScheme === 'dark' ? styles.iconContainerActiveDark : styles.iconContainerActiveLight)
            ]}>
              <IconSymbol 
                size={focused ? 28 : 24} 
                name="house.fill" 
                color={focused 
                  ? (colorScheme === 'dark' ? '#22d3ee' : '#0a7ea4')
                  : (colorScheme === 'dark' ? '#64748b' : '#475569')
                } 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer, 
              focused && (colorScheme === 'dark' ? styles.iconContainerActiveDark : styles.iconContainerActiveLight)
            ]}>
              <IconSymbol 
                size={focused ? 28 : 24} 
                name="paperplane.fill" 
                color={focused 
                  ? (colorScheme === 'dark' ? '#22d3ee' : '#0a7ea4')
                  : (colorScheme === 'dark' ? '#64748b' : '#475569')
                } 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer, 
              focused && (colorScheme === 'dark' ? styles.iconContainerActiveDark : styles.iconContainerActiveLight)
            ]}>
              <IconSymbol 
                size={focused ? 28 : 24} 
                name="person.fill" 
                color={focused 
                  ? (colorScheme === 'dark' ? '#22d3ee' : '#0a7ea4')
                  : (colorScheme === 'dark' ? '#64748b' : '#475569')
                } 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 10,
    borderRadius: 22,    backgroundColor: 'transparent',
  },
  iconContainerActiveLight: {
    backgroundColor: 'rgba(10, 126, 164, 0.18)',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(10, 126, 164, 0.3)',
    transform: [{ scale: 1.05 }],
  },
  iconContainerActiveDark: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 211, 238, 0.4)',
    transform: [{ scale: 1.05 }],
  },
});