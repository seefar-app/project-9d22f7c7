import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  Animated,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { OrderStatusTimeline } from '@/components/shared/OrderStatusTimeline';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { getOrderById } = useStore();
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  const order = id ? getOrderById(id) : null;

  useEffect(() => {
    if (order && order.driver && mapReady) {
      const coordinates = [
        {
          latitude: order.deliveryAddress.latitude,
          longitude: order.deliveryAddress.longitude,
        },
        {
          latitude: order.driver.currentLatitude,
          longitude: order.driver.currentLongitude,
        },
      ];

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  }, [order, mapReady]);

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCallDriver = () => {
    if (order.driver) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(`tel:${order.driver.phone}`);
    }
  };

  const handleCallRestaurant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${order.restaurant.phone}`);
  };

  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isDelivered ? 'Order Delivered' : 'Track Order'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map */}
        {!isDelivered && !isCancelled && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_DEFAULT}
              style={styles.map}
              initialRegion={{
                latitude: order.deliveryAddress.latitude,
                longitude: order.deliveryAddress.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              onMapReady={() => setMapReady(true)}
            >
              {/* Delivery Address Marker */}
              <Marker
                coordinate={{
                  latitude: order.deliveryAddress.latitude,
                  longitude: order.deliveryAddress.longitude,
                }}
                title="Delivery Address"
              >
                <View style={[styles.markerContainer, { backgroundColor: colors.primary }]}>
                  <Ionicons name="home" size={20} color="#fff" />
                </View>
              </Marker>

              {/* Driver Marker */}
              {order.driver && (
                <>
                  <Marker
                    coordinate={{
                      latitude: order.driver.currentLatitude,
                      longitude: order.driver.currentLongitude,
                    }}
                    title={order.driver.name}
                  >
                    <View style={[styles.driverMarker, { backgroundColor: colors.success }]}>
                      <Ionicons name="bicycle" size={20} color="#fff" />
                    </View>
                  </Marker>

                  {/* Route Line */}
                  <Polyline
                    coordinates={[
                      {
                        latitude: order.driver.currentLatitude,
                        longitude: order.driver.currentLongitude,
                      },
                      {
                        latitude: order.deliveryAddress.latitude,
                        longitude: order.deliveryAddress.longitude,
                      },
                    ]}
                    strokeColor={colors.primary}
                    strokeWidth={3}
                    lineDashPattern={[10, 5]}
                  />
                </>
              )}
            </MapView>
          </View>
        )}

        {/* Order Status Timeline */}
        <View style={styles.timelineContainer}>
          <OrderStatusTimeline currentStatus={order.status} />
        </View>

        {/* Driver Info */}
        {order.driver && !isDelivered && !isCancelled && (
          <View style={[styles.driverCard, { backgroundColor: colors.card }]}>
            <View style={styles.driverInfo}>
              <Avatar uri={order.driver.avatar} name={order.driver.name} size={56} />
              <View style={styles.driverDetails}>
                <Text style={[styles.driverName, { color: colors.text }]}>
                  {order.driver.name}
                </Text>
                <View style={styles.driverMeta}>
                  <Ionicons name="star" size={14} color="#facc15" />
                  <Text style={[styles.driverRating, { color: colors.textSecondary }]}>
                    {order.driver.rating}
                  </Text>
                  <Text style={[styles.driverVehicle, { color: colors.textTertiary }]}>
                    • {order.driver.vehicle}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={handleCallDriver}
              style={[styles.callButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="call" size={20} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* Restaurant Info */}
        <View style={[styles.restaurantCard, { backgroundColor: colors.card }]}>
          <Image
            source={{ uri: order.restaurant.image }}
            style={styles.restaurantImage}
            contentFit="cover"
          />
          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantName, { color: colors.text }]}>
              {order.restaurant.name}
            </Text>
            <Text style={[styles.restaurantAddress, { color: colors.textSecondary }]}>
              {order.restaurant.address}
            </Text>
          </View>
          <Pressable
            onPress={handleCallRestaurant}
            style={styles.restaurantCallButton}
          >
            <Ionicons name="call-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {/* Order Items */}
        <View style={[styles.itemsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.itemsTitle, { color: colors.text }]}>
            Order Items
          </Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.itemQuantity, { color: colors.textTertiary }]}>
                {item.quantity}x
              </Text>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.menuItem.name}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                ${item.totalPrice.toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ${order.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={[styles.addressCard, { backgroundColor: colors.card }]}>
          <View style={styles.addressHeader}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={[styles.addressTitle, { color: colors.text }]}>
              Delivery Address
            </Text>
          </View>
          <Text style={[styles.addressText, { color: colors.textSecondary }]}>
            {order.deliveryAddress.street}
            {order.deliveryAddress.apartment && `, ${order.deliveryAddress.apartment}`}
          </Text>
          <Text style={[styles.addressText, { color: colors.textSecondary }]}>
            {order.deliveryAddress.city}, {order.deliveryAddress.zipcode}
          </Text>
          {order.deliveryAddress.instructions && (
            <Text style={[styles.addressInstructions, { color: colors.textTertiary }]}>
              Note: {order.deliveryAddress.instructions}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        {isDelivered && (
          <View style={styles.actionsContainer}>
            <Button
              label="Rate Order"
              onPress={() => {}}
              variant="primary"
              style={styles.actionButton}
            />
            <Button
              label="Reorder"
              onPress={() => {
                useStore.getState().reorder(order.id);
                router.push('/checkout');
              }}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  mapContainer: {
    height: 300,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timelineContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverDetails: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverRating: {
    fontSize: 14,
    fontWeight: '600',
  },
  driverVehicle: {
    fontSize: 14,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
  },
  restaurantImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  restaurantAddress: {
    fontSize: 13,
  },
  restaurantCallButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    width: 32,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  addressCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addressInstructions: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});