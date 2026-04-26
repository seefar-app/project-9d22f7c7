import { useColorScheme } from 'react-native';
import { Colors, ColorScheme } from '@/constants/Colors';

export function useTheme() {
  const colorScheme = useColorScheme() as ColorScheme;
  const colors = Colors[colorScheme ?? 'light'];
  const gradients = Colors.gradients;
  const isDark = colorScheme === 'dark';

  return {
    colors,
    gradients,
    colorScheme: colorScheme ?? 'light',
    isDark,
  };
}