/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { getTheme } from '@/themes/index';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ReturnType<typeof getTheme>['colors']
) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme === 'dark');
  const colorFromProps = props[colorScheme as 'light' | 'dark'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return theme.colors[colorName];
  }
}
