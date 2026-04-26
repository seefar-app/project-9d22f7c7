import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocation } from '@/hooks/useLocation';
import { RestaurantCard } from '@/components/shared/RestaurantCard';
import { RestaurantCardSkeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';

const { width } = Dimensions.get('window');

const CUISINES = ['All', 'Italian', 'Japanese', 'American', 'Indian', 'Mexican', 'Chinese'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    restaurants,
    fetchRestaurants,
    selectRestaurant,
    toggleFavorite,
    searchFilters,
    searchRestaurants,
    setFilters,
    isLoading,
  } = useStore();
  const location = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [showMap, setShowMap] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchRestaurants();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setRefreshing(false);
  };

  const handleRestaurantPress = (id: string) => {
    selectRestaurant(id);
    router.push(`/restaurant/${id}`);
  };

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchFilters.query.toLowerCase());
    const matchesCuisine = selectedCuisine === 'All' || r.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
          <Avatar
            uri={user?.avatar}
            name={user?.name}
            size="md"
          />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search restaurants..."
            placeholderTextColor={colors.textTertiary}
            value={searchFilters.query}
            onChangeText={searchRestaurants}
          />
          <Pressable
            onPress={() => setShowMap(!showMap)}
            style={[styles.mapToggle, { backgroundColor: colors.backgroundSecondary }]}
          >
            <Ionicons
              name={showMap ? 'list' : 'map'}
              size={18}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        stickyHeaderIndices={[0]}
      >
        {/* Cuisine Filter */}
        <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {CUISINES.map(cuisine => (
              <Pressable
                key={cuisine}
                onPress={() => setSelectedCuisine(cuisine)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedCuisine === cuisine ? colors.primary : colors.backgroundSecondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: selectedCuisine === cuisine ? '#ffffff' : colors.text,
                    },
                  ]}
                >
                  {cuisine}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Map View */}
        {showMap && (
          <Animated.View
            style={[
              styles.mapContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              showsUserLocation
            >
              {filteredRestaurants.map(restaurant => (
                <Marker
                  key={restaurant.id}
                  coordinate={{
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                  }}
                  title={restaurant.name}
                  description={`${restaurant.cuisine} • ${restaurant.deliveryTime}`}
                  onCalloutPress={() => handleRestaurantPress(restaurant.id)}
                >
                  <View style={[styles.mapMarker, { backgroundColor: colors.primary }]}>
                    <Ionicons name="restaurant" size={14} color="#fff" />
                  </View>
                </Marker>
              ))}
            </MapView>
          </Animated.View>
        )}

        {/* Restaurant List */}
        <Animated.View
          style={[
            styles.listContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedCuisine === 'All' ? 'Nearby Restaurants' : `${selectedCuisine} Food`}
            </Text>
            <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
              {filteredRestaurants.length} places
            </Text>
          </View>

          {isLoading ? (
            <>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </>
          ) : filteredRestaurants.length > 0 ? (
            filteredRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => handleRestaurantPress(restaurant.id)}
                onFavoritePress={() => toggleFavorite(restaurant.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No restaurants found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  mapToggle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    flex: 1,
  },
  mapMarker: {
    padding: 8,
    borderRadius: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
  },
});