import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface StatusIndicatorProps {
  status: 'active' | 'pending' | 'completed' | 'error';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export function StatusIndicator({
  status,
  size = 'md',
  pulse = true,
}: StatusIndicatorProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse && (status === 'active' || status === 'pending')) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [pulse, status, pulseAnim]);

  const getColor = () => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'completed':
        return colors.info;
      case 'error':
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 8;
      case 'lg':
        return 16;
      default:
        return 12;
    }
  };

  const dotSize = getSize();
  const dotColor = getColor();

  return (
    <View style={styles.container}>
      {pulse && (status === 'active' || status === 'pending') && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: dotSize * 2,
              height: dotSize * 2,
              borderRadius: dotSize,
              backgroundColor: dotColor,
              opacity: 0.3,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: dotColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  dot: {},
});