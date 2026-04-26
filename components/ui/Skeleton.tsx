import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.backgroundTertiary,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width="100%" height={160} borderRadius={16} />
      <View style={skeletonStyles.content}>
        <Skeleton width="70%" height={20} />
        <View style={skeletonStyles.row}>
          <Skeleton width={60} height={16} />
          <Skeleton width={80} height={16} />
        </View>
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  content: {
    marginTop: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});