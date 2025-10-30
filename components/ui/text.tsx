import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeUtils } from '@/hooks/use-theme';

interface ThemedTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'accent' | 'muted' | 'error';
  center?: boolean;
  bold?: boolean;
  semibold?: boolean;
}

export function ThemedText({
  style,
  variant = 'body',
  color = 'primary',
  center = false,
  bold = false,
  semibold = false,
  ...props
}: ThemedTextProps) {
  const { theme } = useThemeUtils();
  
  const getColor = () => {
    switch (color) {
      case 'primary':
        return theme.colors.text;
      case 'secondary':
        return theme.colors.textSecondary;
      case 'accent':
        return theme.colors.accent;
      case 'muted':
        return theme.colors.textTertiary;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };
  
  const getFontSize = () => {
    switch (variant) {
      case 'h1':
        return theme.typography.fontSize.xxxl;
      case 'h2':
        return theme.typography.fontSize.xxl;
      case 'h3':
        return theme.typography.fontSize.xl;
      case 'h4':
        return theme.typography.fontSize.lg;
      case 'body':
        return theme.typography.fontSize.base;
      case 'caption':
        return theme.typography.fontSize.sm;
      case 'button':
        return theme.typography.fontSize.base;
      default:
        return theme.typography.fontSize.base;
    }
  };
  
  const getFontWeight = () => {
    if (bold) return '700';
    if (semibold) return '600';
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'button':
        return '600';
      default:
        return '400';
    }
  };
  
  const getLineHeight = () => {
    switch (variant) {
      case 'h1':
      case 'h2':
        return theme.typography.lineHeight.tight;
      case 'h3':
      case 'h4':
        return theme.typography.lineHeight.normal;
      default:
        return theme.typography.lineHeight.relaxed;
    }
  };
  
  return (
    <Text
      style={[
        {
          color: getColor(),
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          lineHeight: getLineHeight() * getFontSize(),
          textAlign: center ? 'center' : 'left',
        },
        style,
      ]}
      {...props}
    />
  );
}