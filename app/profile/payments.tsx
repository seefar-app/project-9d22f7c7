import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function PaymentsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, removePaymentMethod, setDefaultPaymentMethod } = useAuthStore();

  const paymentMethods = user?.savedPaymentMethods || [];

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removePaymentMethod(id),
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDefaultPaymentMethod(id);
  };

  const handleAddNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile/payment-form');
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'apple_pay':
        return 'logo-apple';
      case 'google_pay':
        return 'logo-google';
      default:
        return 'card';
    }
  };

  const getPaymentLabel = (method: any) => {
    if (method.type === 'card') {
      return `${method.brand} •••• ${method.last4}`;
    }
    return method.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
        <Pressable onPress={handleAddNew} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No payment methods yet
            </Text>
            <Button
              title="Add Payment Method"
              onPress={handleAddNew}
              variant="primary"
              icon="add"
            />
          </View>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} variant="default" padding="none" style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                    <Ionicons name={getPaymentIcon(method.type)} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={[styles.paymentLabel, { color: colors.text }]}>
                      {getPaymentLabel(method)}
                    </Text>
                    {method.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.primaryLight }]}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable onPress={() => handleDelete(method.id)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>

              {!method.isDefault && (
                <Pressable
                  onPress={() => handleSetDefault(method.id)}
                  style={[styles.setDefaultButton, { borderTopColor: colors.borderLight }]}
                >
                  <Text style={[styles.setDefaultText, { color: colors.primary }]}>
                    Set as Default
                  </Text>
                </Pressable>
              )}
            </Card>
          ))
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
  addButton: {
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
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  paymentCard: {
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setDefaultButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  setDefaultText: {
    fontSize: 15,
    fontWeight: '600',
  },
});