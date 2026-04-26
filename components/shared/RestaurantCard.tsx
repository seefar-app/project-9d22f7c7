import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  onFavoritePress: () => void;
  variant?: 'default' | 'compact';
}

export function RestaurantCard({
  restaurant,
  onPress,
  onFavoritePress,
  variant = 'default',
}: RestaurantCardProps) {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress();
  };

  const isCompact = variant === 'compact';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            shadowColor: colors.shadow,
          },
          isCompact && styles.containerCompact,
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: restaurant.image }}
            style={[styles.image, isCompact && styles.imageCompact]}
            contentFit="cover"
          />
          <Pressable
            onPress={handleFavorite}
            style={[styles.favoriteButton, { backgroundColor: colors.card }]}
          >
            <Ionicons
              name={restaurant.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={restaurant.isFavorite ? colors.error : colors.textSecondary}
            />
          </Pressable>
          <View style={[styles.deliveryBadge, { backgroundColor: colors.card }]}>
            <Ionicons name="time-outline" size={12} color={colors.text} />
            <Text style={[styles.deliveryText, { color: colors.text }]}>
              {restaurant.deliveryTime}
            </Text>
          </View>
        </View>

        <View style={[styles.content, isCompact && styles.contentCompact]}>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {restaurant.name}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#facc15" />
              <Text style={[styles.rating, { color: colors.text }]}>
                {restaurant.rating}
              </Text>
              <Text style={[styles.reviews, { color: colors.textTertiary }]}>
                ({restaurant.reviewCount})
              </Text>
            </View>
            <Text style={[styles.cuisine, { color: colors.textSecondary }]}>
              {restaurant.cuisine}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.feeContainer}>
              <Ionicons
                name="bicycle-outline"
                size={14}
                color={colors.textTertiary}
              />
              <Text style={[styles.fee, { color: colors.textSecondary }]}>
                ${restaurant.deliveryFee.toFixed(2)} delivery
              </Text>
            </View>
            {restaurant.minOrder > 0 && (
              <Text style={[styles.minOrder, { color: colors.textTertiary }]}>
                Min ${restaurant.minOrder}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  containerCompact: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  imageCompact: {
    width: 100,
    height: 100,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  contentCompact: {
    flex: 1,
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    marginLeft: 2,
  },
  cuisine: {
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fee: {
    fontSize: 13,
  },
  minOrder: {
    fontSize: 12,
  },
});