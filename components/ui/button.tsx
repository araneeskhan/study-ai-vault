import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, TextStyle, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ThemedButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  style, 
  textStyle,
  disabled,
  ...props 
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({}, variant === 'primary' ? 'primary' : 'surface');
  const textColor = useThemeColor({}, variant === 'primary' ? 'background' : 'text');
  const borderColor = useThemeColor({}, 'border');

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 24 },
    lg: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const variantStyles = {
    primary: { backgroundColor },
    secondary: { backgroundColor },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor },
  };

  const buttonStyles = [
    styles.button,
    variantStyles[variant],
    sizeStyles[size],
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});