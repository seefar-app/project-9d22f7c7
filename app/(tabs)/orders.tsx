import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { OrderCard } from '@/components/shared/OrderCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { orders, fetchOrders, reorder, isLoading } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchOrders();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleOrderPress = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order && !['delivered', 'cancelled'].includes(order.status)) {
      router.push(`/order-tracking/${orderId}`);
    }
  };

  const handleReorder = (orderId: string) => {
    reorder(orderId);
    router.push('/checkout');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
        
        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Pressable
            onPress={() => setActiveTab('active')}
            style={[
              styles.tab,
              activeTab === 'active' && { backgroundColor: colors.card },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'active' ? colors.primary : colors.textSecondary },
              ]}
            >
              Active
            </Text>
            {activeOrders.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.tabBadgeText}>{activeOrders.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('past')}
            style={[
              styles.tab,
              activeTab === 'past' && { backgroundColor: colors.card },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'past' ? colors.primary : colors.textSecondary },
              ]}
            >
              Past Orders
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {isLoading ? (
            <>
              <View style={styles.skeletonCard}>
                <Skeleton width={48} height={48} borderRadius={12} />
                <View style={styles.skeletonContent}>
                  <Skeleton width="60%" height={18} />
                  <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
                </View>
              </View>
              <View style={styles.skeletonCard}>
                <Skeleton width={48} height={48} borderRadius={12} />
                <View style={styles.skeletonContent}>
                  <Skeleton width="60%" height={18} />
                  <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
                </View>
              </View>
            </>
          ) : displayedOrders.length > 0 ? (
            displayedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => handleOrderPress(order.id)}
                onReorderPress={
                  activeTab === 'past' ? () => handleReorder(order.id) : undefined
                }
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons
                  name={activeTab === 'active' ? 'receipt-outline' : 'time-outline'}
                  size={48}
                  color={colors.textTertiary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeTab === 'active' ? 'No active orders' : 'No past orders'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {activeTab === 'active'
                  ? "When you place an order, it'll show up here"
                  : 'Your order history will appear here'}
              </Text>
              {activeTab === 'active' && (
                <Pressable
                  onPress={() => router.push('/(tabs)')}
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.emptyButtonText}>Browse Restaurants</Text>
                </Pressable>
              )}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  skeletonCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});