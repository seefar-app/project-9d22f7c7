import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'secondary' | 'tertiary' | 'heading' | 'subheading';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function ThemedText({
  style,
  variant = 'default',
  weight = 'normal',
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme();

  const textColor = {
    default: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    heading: colors.text,
    subheading: colors.textSecondary,
  }[variant];

  const fontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }[weight];

  const fontSize = {
    default: 16,
    secondary: 14,
    tertiary: 12,
    heading: 28,
    subheading: 18,
  }[variant];

  return (
    <Text
      style={[
        {
          color: textColor,
          fontWeight,
          fontSize,
        },
        style,
      ]}
      {...props}
    />
  );
}