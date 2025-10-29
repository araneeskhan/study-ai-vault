import { Pressable, PressableProps, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './text';
import { useTheme } from '@/hooks/use-theme';

interface ThemedButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: string;
}

export function ThemedButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  style,
  ...props
}: ThemedButtonProps) {
  const theme = useTheme();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };
  
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.surface;
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      default:
        return theme.colors.surface;
    }
  };
  
  const getBorderColor = () => {
    switch (variant) {
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return 'transparent';
      default:
        return 'transparent';
    }
  };
  
  const getPadding = () => {
    switch (size) {
      case 'sm':
        return theme.spacing.sm;
      case 'md':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };
  
  const getBorderRadius = () => {
    switch (size) {
      case 'sm':
        return theme.borderRadius.sm;
      case 'md':
        return theme.borderRadius.md;
      case 'lg':
        return theme.borderRadius.lg;
      default:
        return theme.borderRadius.md;
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'md':
        return theme.typography.fontSize.base;
      case 'lg':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.base;
    }
  };
  
  return (
    <Pressable
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
          paddingHorizontal: getPadding(),
          paddingVertical: getPadding() * 0.5,
          borderRadius: getBorderRadius(),
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <ThemedText
          variant="button"
          color={variant === 'primary' || variant === 'secondary' ? 'primary' : 'accent'}
          style={{ fontSize: getFontSize() }}
        >
          {children}
        </ThemedText>
      )}
    </Pressable>
  );
}