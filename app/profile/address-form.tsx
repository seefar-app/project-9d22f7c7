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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(5, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  zipcode: z.string().min(5, 'Valid zipcode is required'),
  instructions: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { addresses, addAddress, updateAddress } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const addressId = params.addressId as string | undefined;
  const existingAddress = addressId ? addresses.find(a => a.id === addressId) : null;
  const isEditing = !!existingAddress;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: existingAddress?.label || '',
      street: existingAddress?.street || '',
      apartment: existingAddress?.apartment || '',
      city: existingAddress?.city || '',
      zipcode: existingAddress?.zipcode || '',
      instructions: existingAddress?.instructions || '',
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (isEditing && addressId) {
        updateAddress(addressId, {
          label: data.label,
          street: data.street,
          apartment: data.apartment,
          city: data.city,
          zipcode: data.zipcode,
          instructions: data.instructions,
        });
      } else {
        addAddress({
          label: data.label,
          street: data.street,
          apartment: data.apartment,
          city: data.city,
          zipcode: data.zipcode,
          latitude: 40.7580,
          longitude: -73.9855,
          isDefault: addresses.length === 0,
          instructions: data.instructions,
        });
      }

      Alert.alert(
        'Success',
        isEditing ? 'Address updated successfully' : 'Address added successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Address' : 'Add Address'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Controller
            control={control}
            name="label"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Label"
                placeholder="e.g., Home, Work, Other"
                icon="pricetag-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.label?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="street"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Street Address"
                placeholder="123 Main Street"
                icon="location-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.street?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="apartment"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Apartment / Suite (Optional)"
                placeholder="Apt 4B, Floor 12, etc."
                icon="business-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.apartment?.message}
                autoCapitalize="words"
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="City"
                    placeholder="New York"
                    icon="map-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.city?.message}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="zipcode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Zipcode"
                    placeholder="10001"
                    icon="pin-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.zipcode?.message}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="instructions"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Delivery Instructions (Optional)"
                placeholder="Ring doorbell twice, leave at door, etc."
                icon="chatbubble-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.instructions?.message}
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />
            )}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Button
          title={isEditing ? 'Update Address' : 'Add Address'}
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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