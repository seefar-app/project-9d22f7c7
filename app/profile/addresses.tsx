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
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Address } from '@/types';

export default function AddressesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addresses, deleteAddress, setDefaultAddress } = useStore();

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(id),
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDefaultAddress(id);
  };

  const handleEdit = (address: Address) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/profile/address-form',
      params: { addressId: address.id },
    });
  };

  const handleAddNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile/address-form');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Addresses</Text>
        <Pressable onPress={handleAddNew} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No saved addresses yet
            </Text>
            <Button
              title="Add Address"
              onPress={handleAddNew}
              variant="primary"
              icon="add"
            />
          </View>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} variant="default" padding="none" style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressLabelContainer}>
                  <Ionicons
                    name={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'location'}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.addressLabel, { color: colors.text }]}>
                    {address.label}
                  </Text>
                  {address.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primaryLight }]}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.addressActions}>
                  <Pressable onPress={() => handleEdit(address)} style={styles.actionButton}>
                    <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(address.id)} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.addressBody}>
                <Text style={[styles.addressText, { color: colors.text }]}>
                  {address.street}
                  {address.apartment ? `, ${address.apartment}` : ''}
                </Text>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                  {address.city}, {address.zipcode}
                </Text>
                {address.instructions && (
                  <Text style={[styles.addressInstructions, { color: colors.textTertiary }]}>
                    Note: {address.instructions}
                  </Text>
                )}
              </View>

              {!address.isDefault && (
                <Pressable
                  onPress={() => handleSetDefault(address.id)}
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
  addressCard: {
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '700',
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
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
  },
  addressText: {
    fontSize: 15,
    lineHeight: 22,
  },
  addressInstructions: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
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