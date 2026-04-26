import React from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface LocationInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onPress?: () => void;
  icon?: 'location' | 'navigate' | 'flag';
  iconColor?: string;
}

export function LocationInput({
  label,
  value,
  placeholder = 'Enter address',
  onPress,
  icon = 'location',
  iconColor,
}: LocationInputProps) {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (icon) {
      case 'navigate':
        return 'navigate-circle';
      case 'flag':
        return 'flag';
      default:
        return 'location';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconColor || colors.primary },
        ]}
      >
        <Ionicons name={getIcon()} size={16} color="#fff" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.textTertiary }]}>
          {label}
        </Text>
        <Text
          style={[
            styles.value,
            { color: value ? colors.text : colors.textTertiary },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textTertiary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
});