import React, { useState } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const cardSchema = z.object({
  cardNumber: z.string().min(16, 'Card number must be 16 digits').max(19),
  cardHolder: z.string().min(3, 'Cardholder name is required'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().min(3, 'CVV must be 3-4 digits').max(4),
});

type CardFormData = z.infer<typeof cardSchema>;

export default function PaymentFormScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addPaymentMethod } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    },
  });

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const onSubmit = async (data: CardFormData) => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const last4 = data.cardNumber.replace(/\s/g, '').slice(-4);
      
      addPaymentMethod({
        type: 'card',
        last4,
        brand: 'Visa',
      });

      Alert.alert('Success', 'Payment method added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Card</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.cardPreview, { backgroundColor: colors.primary }]}>
          <View style={styles.cardChip}>
            <Ionicons name="card" size={32} color="rgba(255,255,255,0.8)" />
          </View>
          <Text style={styles.cardNumberPreview}>•••• •••• •••• ••••</Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>CARDHOLDER</Text>
              <Text style={styles.cardValue}>YOUR NAME</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardValue}>MM/YY</Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="cardNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                icon="card-outline"
                value={value}
                onChangeText={(text) => onChange(formatCardNumber(text))}
                onBlur={onBlur}
                error={errors.cardNumber?.message}
                keyboardType="numeric"
                maxLength={19}
              />
            )}
          />

          <Controller
            control={control}
            name="cardHolder"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                icon="person-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.cardHolder?.message}
                autoCapitalize="words"
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="expiryDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    icon="calendar-outline"
                    value={value}
                    onChangeText={(text) => onChange(formatExpiryDate(text))}
                    onBlur={onBlur}
                    error={errors.expiryDate?.message}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                )}
              />
            </View>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="cvv"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="CVV"
                    placeholder="123"
                    icon="lock-closed-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.cvv?.message}
                    keyboardType="numeric"
                    maxLength={4}
                    isPassword
                  />
                )}
              />
            </View>
          </View>

          <View style={[styles.securityNote, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={[styles.securityText, { color: colors.textSecondary }]}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Button
          title="Add Card"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          isLoading={isLoading}
          fullWidth
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
    padding: 20,
    paddingBottom: 100,
  },
  cardPreview: {
    height: 200,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 50,
    height: 40,
  },
  cardNumberPreview: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  form: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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
});