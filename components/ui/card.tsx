import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewProps['style'];
}

export function ThemedCard({ children, style, ...props }: ThemedCardProps) {
  const backgroundColor = useThemeColor({}, 'surfaceElevated');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View 
      style={[
        styles.card, 
        { backgroundColor, borderColor }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});