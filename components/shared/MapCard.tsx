import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface MapCardProps {
  latitude: number;
  longitude: number;
  title?: string;
  onPress?: () => void;
  height?: number;
  showExpandIcon?: boolean;
}

export function MapCard({
  latitude,
  longitude,
  title,
  onPress,
  height = 150,
  showExpandIcon = true,
}: MapCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          height,
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={title}
        >
          <View style={[styles.marker, { backgroundColor: colors.primary }]}>
            <Ionicons name="location" size={16} color="#fff" />
          </View>
        </Marker>
      </MapView>
      {showExpandIcon && (
        <View style={[styles.expandIcon, { backgroundColor: colors.card }]}>
          <Ionicons name="expand-outline" size={18} color={colors.text} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  marker: {
    padding: 8,
    borderRadius: 20,
  },
  expandIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});