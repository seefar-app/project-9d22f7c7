import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/shared/StatusIndicator';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onReorderPress?: () => void;
}

export function OrderCard({ order, onPress, onReorderPress }: OrderCardProps) {
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

  const getStatusBadge = (status: OrderStatus) => {
    const statusMap: Record<
      OrderStatus,
      { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'default' }
    > = {
      pending: { label: 'Pending', variant: 'warning' },
      confirmed: { label: 'Confirmed', variant: 'info' },
      preparing: { label: 'Preparing', variant: 'info' },
      ready: { label: 'Ready', variant: 'success' },
      picked_up: { label: 'Picked Up', variant: 'info' },
      in_transit: { label: 'On the Way', variant: 'success' },
      delivered: { label: 'Delivered', variant: 'default' },
      cancelled: { label: 'Cancelled', variant: 'error' },
    };
    return statusMap[status];
  };

  const isActive = !['delivered', 'cancelled'].includes(order.status);
  const statusInfo = getStatusBadge(order.status);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          { backgroundColor: colors.card, shadowColor: colors.shadow },
        ]}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: order.restaurant.image }}
            style={styles.restaurantImage}
            contentFit="cover"
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.restaurantName, { color: colors.text }]}>
              {order.restaurant.name}
            </Text>
            <Text style={[styles.date, { color: colors.textTertiary }]}>
              {format(order.createdAt, 'MMM d, yyyy • h:mm a')}
            </Text>
          </View>
          {isActive && (
            <StatusIndicator
              status={order.status === 'in_transit' ? 'active' : 'pending'}
            />
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.itemsContainer}>
          <Text style={[styles.itemsText, { color: colors.textSecondary }]}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''} •{' '}
            {order.items.map(i => i.menuItem.name).slice(0, 2).join(', ')}
            {order.items.length > 2 && '...'}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <Badge label={statusInfo.label} variant={statusInfo.variant} size="sm" />
            <Text style={[styles.total, { color: colors.text }]}>
              ${order.totalPrice.toFixed(2)}
            </Text>
          </View>

          {!isActive && onReorderPress && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onReorderPress();
              }}
              style={[styles.reorderButton, { borderColor: colors.primary }]}
            >
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={[styles.reorderText, { color: colors.primary }]}>
                Reorder
              </Text>
            </Pressable>
          )}

          {isActive && (
            <View style={styles.trackButton}>
              <Text style={[styles.trackText, { color: colors.primary }]}>
                Track Order
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  reorderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trackText: {
    fontSize: 14,
    fontWeight: '600',
  },
});