import { useColorScheme } from 'react-native';
import { Theme, getTheme } from '@/themes';

/**
 * Custom hook to get the current theme based on system color scheme
 * @returns {Theme} The current theme (light or dark)
 */
export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return getTheme(isDark);
}

/**
 * Custom hook to get theme utilities
 * @returns {Object} Theme utilities including theme object and helpers
 */
export function useThemeUtils() {
  const theme = useTheme();
  
  return {
    theme,
    isDark: theme.isDark,
    withOpacity: (color: string, opacity: number) => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
  };
}