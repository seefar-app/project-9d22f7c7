import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number;
  longitude: number;
  error: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: 40.7580,
    longitude: -73.9855,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          if (isMounted) {
            setLocation(prev => ({
              ...prev,
              error: 'Location permission denied',
              isLoading: false,
            }));
          }
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            error: null,
            isLoading: false,
          });
        }
      } catch (error) {
        if (isMounted) {
          setLocation(prev => ({
            ...prev,
            error: 'Failed to get location',
            isLoading: false,
          }));
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return location;
}