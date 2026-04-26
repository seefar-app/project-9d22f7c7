import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PaymentMethod } from '@/types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { cart, getCartTotal, addresses, selectedAddress, selectAddress, createOrder, clearCart } = useStore();
  
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const totals = getCartTotal();
  const tipOptions = [0, 2, 3, 5];

  const mockPaymentMethod: PaymentMethod = {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    isDefault: true,
  };

  const handleSelectAddress = (addressId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectAddress(addressId);
  };

  const handleSelectTip = (tip: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTip(tip);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return;
    }

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const order = await createOrder(mockPaymentMethod, selectedTip);
      router.replace(`/order-tracking/${order.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalTotal = totals.total + selectedTip;

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Your cart is empty
          </Text>
          <Button
            label="Browse Restaurants"
            onPress={() => router.push('/(tabs)')}
            variant="primary"
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Delivery Address
          </Text>
          {addresses.map((address) => (
            <Pressable
              key={address.id}
              onPress={() => handleSelectAddress(address.id)}
              style={[
                styles.addressCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedAddress?.id === address.id ? colors.primary : colors.border,
                  borderWidth: selectedAddress?.id === address.id ? 2 : 1,
                },
              ]}
            >
              <View style={styles.addressContent}>
                <Ionicons
                  name={selectedAddress?.id === address.id ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selectedAddress?.id === address.id ? colors.primary : colors.textTertiary}
                />
                <View style={styles.addressInfo}>
                  <Text style={[styles.addressLabel, { color: colors.text }]}>
                    {address.label}
                  </Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {address.street}
                    {address.apartment ? `, ${address.apartment}` : ''}
                  </Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {address.city}, {address.zipcode}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Items
          </Text>
          {cart.map((item) => (
            <View
              key={item.id}
              style={[styles.itemCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.menuItem.name}
                </Text>
                <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                ${item.totalPrice.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Tip Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Add a Tip
          </Text>
          <View style={styles.tipContainer}>
            {tipOptions.map((tip) => (
              <Pressable
                key={tip}
                onPress={() => handleSelectTip(tip)}
                style={[
                  styles.tipButton,
                  {
                    backgroundColor: selectedTip === tip ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tipText,
                    { color: selectedTip === tip ? '#fff' : colors.text },
                  ]}
                >
                  {tip === 0 ? 'No Tip' : `$${tip}`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>
          <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
            <View style={styles.paymentContent}>
              <Ionicons name="card-outline" size={24} color={colors.primary} />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentBrand, { color: colors.text }]}>
                  {mockPaymentMethod.brand}
                </Text>
                <Text style={[styles.paymentNumber, { color: colors.textSecondary }]}>
                  •••• {mockPaymentMethod.last4}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${totals.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Delivery Fee
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${totals.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Service Fee
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${totals.serviceFee.toFixed(2)}
            </Text>
          </View>
          {selectedTip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Tip
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${selectedTip.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ${finalTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Button
          label={isProcessing ? 'Processing...' : 'Place Order'}
          onPress={handlePlaceOrder}
          variant="primary"
          disabled={!selectedAddress || isProcessing}
          loading={isProcessing}
        />
      </View>
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
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  addressCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 13,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  tipContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentInfo: {
    gap: 2,
  },
  paymentBrand: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentNumber: {
    fontSize: 14,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
});