'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  source: 'browser' | 'ip' | null;
}

export function useGeolocation(options?: PositionOptions): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    source: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported, falling back to IP location");
      fallbackToIpLocation();
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      console.log("User geolocation received", position.coords);
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
        source: 'browser',
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      console.error('Browser geolocation error:', error);
      fallbackToIpLocation();
    };

    const id = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options
    });

    return () => navigator.geolocation.clearWatch(id);
  }, [options]);

  const fallbackToIpLocation = async () => {
    console.log("Attempting to get IP-based location");
    try {
      const response = await axios.get('/api/ip-location');
      console.log("IP-based location response:", response.data);
      setState({
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        error: null,
        loading: false,
        source: 'ip',
      });
    } catch (error) {
      console.error('IP location error:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to get location: ' + (error instanceof Error ? error.message : String(error)),
        loading: false,
      }));
    }
  };

  return state;
}
