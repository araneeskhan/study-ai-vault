/**
 * Comprehensive theme system for Study AI Vault
 * Defines colors, typography, spacing, and component styles for light and dark themes
 */

import { Platform } from 'react-native';

export interface ThemeColors {
  // Brand Colors
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  
  // Background Colors
  background: string;
  surface: string;
  surfaceElevated: string;
  
  // Text Colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // UI Colors
  border: string;
  divider: string;
  shadow: string;
  
  // Status Colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Interactive Colors
  button: string;
  buttonText: string;
  buttonHover: string;
  link: string;
  linkHover: string;
  
  // Gradient Colors
  gradientStart: string;
  gradientEnd: string;
  
  // Overlay Colors
  overlay: string;
  backdrop: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
  };
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  isDark: boolean;
}

// Light Theme
export const lightTheme: Theme = {
  isDark: false,
  colors: {
    // Brand Colors
    primary: '#0a7ea4',
    primaryDark: '#0d5d7a',
    secondary: '#f0f9ff',
    accent: '#06b6d4',
    
    // Background Colors
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceElevated: '#ffffff',
    
    // Text Colors
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    
    // UI Colors
    border: '#e2e8f0',
    divider: '#f1f5f9',
    shadow: '#000000',
    
    // Status Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Interactive Colors
    button: '#0a7ea4',
    buttonText: '#ffffff',
    buttonHover: '#0d5d7a',
    link: '#0a7ea4',
    linkHover: '#0d5d7a',
    
    // Gradient Colors
    gradientStart: '#0a7ea4',
    gradientEnd: '#06b6d4',
    
    // Overlay Colors
    overlay: 'rgba(15, 23, 42, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      regular: Platform.select({
        ios: 'SF Pro Text',
        android: 'Roboto',
        web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }),
      medium: Platform.select({
        ios: 'SF Pro Text Medium',
        android: 'Roboto Medium',
        web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }),
      semibold: Platform.select({
        ios: 'SF Pro Text Semibold',
        android: 'Roboto Medium',
        web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }),
      bold: Platform.select({
        ios: 'SF Pro Text Bold',
        android: 'Roboto Bold',
        web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }),
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: -0.025,
      normal: 0,
      wide: 0.025,
    },
  },
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

// Dark Theme
export const darkTheme: Theme = {
  isDark: true,
  colors: {
    // Brand Colors
    primary: '#38bdf8',
    primaryDark: '#0ea5e9',
    secondary: '#0f172a',
    accent: '#22d3ee',
    
    // Background Colors
    background: '#0f172a',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    
    // Text Colors
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#0f172a',
    
    // UI Colors
    border: '#334155',
    divider: '#475569',
    shadow: '#000000',
    
    // Status Colors
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    
    // Interactive Colors
    button: '#38bdf8',
    buttonText: '#0f172a',
    buttonHover: '#7dd3fc',
    link: '#38bdf8',
    linkHover: '#7dd3fc',
    
    // Gradient Colors
    gradientStart: '#38bdf8',
    gradientEnd: '#22d3ee',
    
    // Overlay Colors
    overlay: 'rgba(15, 23, 42, 0.8)',
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
  spacing: lightTheme.spacing, // Same spacing for both themes
  typography: lightTheme.typography, // Same typography for both themes
  borderRadius: lightTheme.borderRadius, // Same border radius for both themes
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  },
};

// Theme utility functions
export const getTheme = (isDark: boolean): Theme => (isDark ? darkTheme : lightTheme);

export const withOpacity = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default {
  light: lightTheme,
  dark: darkTheme,
  getTheme,
  withOpacity,
};