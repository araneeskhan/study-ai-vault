import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'surface' | 'elevated' | 'card';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  margin?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg';
}

export function ThemedView({
  style,
  variant = 'default',
  padding = 'none',
  margin = 'none',
  radius = 'none',
  ...props
}: ThemedViewProps) {
  const theme = useTheme();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'surface':
        return theme.colors.surface;
      case 'elevated':
        return theme.colors.surfaceElevated;
      case 'card':
        return theme.colors.surface;
      default:
        return theme.colors.background;
    }
  };
  
  const getPadding = () => {
    switch (padding) {
      case 'sm':
        return theme.spacing.sm;
      case 'md':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.lg;
      default:
        return 0;
    }
  };
  
  const getMargin = () => {
    switch (margin) {
      case 'sm':
        return theme.spacing.sm;
      case 'md':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.lg;
      default:
        return 0;
    }
  };
  
  const getBorderRadius = () => {
    switch (radius) {
      case 'sm':
        return theme.borderRadius.sm;
      case 'md':
        return theme.borderRadius.md;
      case 'lg':
        return theme.borderRadius.lg;
      default:
        return 0;
    }
  };
  
  return (
    <View
      style={[
        {
          backgroundColor: getBackgroundColor(),
          padding: getPadding(),
          margin: getMargin(),
          borderRadius: getBorderRadius(),
        },
        style,
      ]}
      {...props}
    />
  );
}