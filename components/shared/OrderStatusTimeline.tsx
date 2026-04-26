import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { OrderStatus } from '@/types';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

const statusSteps: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'pending', label: 'Order Placed', icon: 'checkmark-circle' },
  { status: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { status: 'preparing', label: 'Preparing', icon: 'restaurant' },
  { status: 'picked_up', label: 'Picked Up', icon: 'bicycle' },
  { status: 'in_transit', label: 'On the Way', icon: 'navigate' },
  { status: 'delivered', label: 'Delivered', icon: 'home' },
];

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const { colors } = useTheme();

  const currentIndex = statusSteps.findIndex(step => step.status === currentStatus);

  const getStepStatus = (index: number): 'completed' | 'active' | 'pending' => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Order Status</Text>
      <View style={styles.timeline}>
        {statusSteps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === statusSteps.length - 1;

          return (
            <View key={step.status} style={styles.stepContainer}>
              <View style={styles.stepContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        status === 'completed' || status === 'active'
                          ? colors.primary
                          : colors.backgroundTertiary,
                    },
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={20}
                    color={
                      status === 'completed' || status === 'active'
                        ? '#fff'
                        : colors.textTertiary
                    }
                  />
                </View>
                <View style={styles.labelContainer}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color:
                          status === 'completed' || status === 'active'
                            ? colors.text
                            : colors.textTertiary,
                        fontWeight: status === 'active' ? '700' : '600',
                      },
                    ]}
                  >
                    {step.label}
                  </Text>
                  {status === 'active' && (
                    <View style={[styles.activeBadge, { backgroundColor: colors.primaryLight }]}>
                      <Text style={styles.activeBadgeText}>In Progress</Text>
                    </View>
                  )}
                </View>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        status === 'completed' ? colors.primary : colors.border,
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  stepContainer: {
    position: 'relative',
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    marginLeft: 16,
    flex: 1,
  },
  label: {
    fontSize: 15,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  connector: {
    position: 'absolute',
    left: 21,
    top: 44,
    width: 2,
    height: 20,
  },
});