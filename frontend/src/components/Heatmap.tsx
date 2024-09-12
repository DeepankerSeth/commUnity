import React from 'react';
import { GoogleMap, HeatmapLayer } from '@react-google-maps/api';

interface HeatmapProps {
  data: Array<{ lat: number; lng: number; weight: number }>;
}

export function Heatmap({ data }: HeatmapProps) {
  const mapCenter = { lat: 0, lng: 0 };
  const mapOptions = {
    zoom: 2,
    center: mapCenter,
  };

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px' }}
      options={mapOptions}
    >
      <HeatmapLayer
        data={data.map(point => new google.maps.LatLng(point.lat, point.lng))}
        options={{
          radius: 20,
          opacity: 0.7,
        }}
      />
    </GoogleMap>
  );
}
