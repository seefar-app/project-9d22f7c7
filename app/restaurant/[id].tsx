import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { MenuItemCard } from '@/components/shared/MenuItemCard';
import { ReviewCard } from '@/components/shared/ReviewCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MenuItem, Review } from '@/types';
import * as Crypto from 'expo-crypto';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { restaurants, selectRestaurant, selectedRestaurant, toggleFavorite, addToCart, cart } = useStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    if (id) {
      selectRestaurant(id);
    }
  }, [id]);

  if (!selectedRestaurant) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading restaurant...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const restaurant = selectedRestaurant;
  const categories = ['All', ...Array.from(new Set(restaurant.menu.map(item => item.category)))];
  const filteredMenu = selectedCategory === 'All' 
    ? restaurant.menu 
    : restaurant.menu.filter(item => item.category === selectedCategory);

  // Mock reviews
  const mockReviews: Review[] = [
    {
      id: Crypto.randomUUID(),
      orderId: Crypto.randomUUID(),
      userId: Crypto.randomUUID(),
      userName: 'Sarah Johnson',
      userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      restaurantId: restaurant.id,
      rating: 5,
      comment: 'Amazing food! The pizza was perfectly cooked and the delivery was super fast. Highly recommend!',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: Crypto.randomUUID(),
      orderId: Crypto.randomUUID(),
      userId: Crypto.randomUUID(),
      userName: 'Michael Chen',
      userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      restaurantId: restaurant.id,
      rating: 4,
      comment: 'Great quality ingredients. The pasta was delicious. Only minor issue was the delivery took a bit longer than expected.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: Crypto.randomUUID(),
      orderId: Crypto.randomUUID(),
      userId: Crypto.randomUUID(),
      userName: 'Emily Rodriguez',
      userAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      restaurantId: restaurant.id,
      rating: 5,
      comment: 'Best Italian food in the area! The tiramisu is to die for. Will definitely order again!',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(restaurant.id);
  };

  const handleAddToCart = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart(item, 1);
  };

  const handleViewCart = () => {
    router.push('/checkout');
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: colors.card, opacity: headerOpacity },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Pressable onPress={handleFavorite} style={styles.headerButton}>
          <Ionicons
            name={restaurant.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={restaurant.isFavorite ? colors.error : colors.text}
          />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <Animated.View
          style={[
            styles.heroContainer,
            { transform: [{ translateY: imageTranslate }] },
          ]}
        >
          <Image
            source={{ uri: restaurant.image }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          
          {/* Floating Action Buttons */}
          <View style={styles.floatingButtons}>
            <Pressable onPress={() => router.back()} style={[styles.floatingButton, { backgroundColor: colors.card }]}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Pressable onPress={handleFavorite} style={[styles.floatingButton, { backgroundColor: colors.card }]}>
              <Ionicons
                name={restaurant.isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={restaurant.isFavorite ? colors.error : colors.text}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Restaurant Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.background }]}>
          <View style={styles.titleRow}>
            <View style={styles.titleContent}>
              <Text style={[styles.restaurantName, { color: colors.text }]}>
                {restaurant.name}
              </Text>
              <Text style={[styles.cuisine, { color: colors.textSecondary }]}>
                {restaurant.cuisine}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#facc15" />
              <Text style={[styles.statText, { color: colors.text }]}>
                {restaurant.rating}
              </Text>
              <Text style={[styles.statSubtext, { color: colors.textTertiary }]}>
                ({restaurant.reviewCount})
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {restaurant.deliveryTime}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="bicycle-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.text }]}>
                ${restaurant.deliveryFee.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Restaurant Details */}
          <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {restaurant.address}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {restaurant.phone}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {restaurant.operatingHours}
              </Text>
            </View>
            {restaurant.minOrder > 0 && (
              <View style={styles.detailRow}>
                <Ionicons name="cart-outline" size={20} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Minimum order: ${restaurant.minOrder}
                </Text>
              </View>
            )}
          </View>

          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Menu</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(category);
                  }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === category ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: selectedCategory === category ? '#fff' : colors.text,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {filteredMenu.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onPress={() => {}}
                onAddPress={() => handleAddToCart(item)}
              />
            ))}
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Reviews
              </Text>
              <Badge label={`${mockReviews.length} reviews`} variant="default" size="sm" />
            </View>
            {mockReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <View style={[styles.cartButtonContainer, { backgroundColor: colors.background }]}>
          <Pressable
            onPress={handleViewCart}
            style={[styles.cartButton, { backgroundColor: colors.primary }]}
          >
            <View style={styles.cartButtonContent}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
              <Text style={styles.cartButtonText}>View Cart</Text>
              <Text style={styles.cartButtonPrice}>${cartTotal.toFixed(2)}</Text>
            </View>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 88,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  heroContainer: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  floatingButtons: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer: {
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContent: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statSubtext: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    marginBottom: 24,
  },
  reviewsSection: {
    marginBottom: 100,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cartButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cartButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  cartButtonPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});