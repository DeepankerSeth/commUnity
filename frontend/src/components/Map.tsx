import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '../hooks/useGeoLocation';
import { socketService } from '../services/socketService';

interface Incident {
  _id: string;
  type: string;
  latitude: number;
  longitude: number;
  severity: number;
  verificationStatus: string;
  impactRadius: number;
}

interface Cluster {
  _id: string;
  center: [number, number];
  size: number;
}

const Map: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    // Fetch initial incidents and clusters
    fetchIncidents();
    fetchClusters();

    // Set up socketService listeners
    socketService.on('incidentUpdate', handleIncidentUpdate);
    socketService.on('clusterUpdate', handleClusterUpdate);
    socketService.on('verificationUpdate', handleVerificationUpdate);

    return () => {
      socketService.off('incidentUpdate', handleIncidentUpdate);
      socketService.off('clusterUpdate', handleClusterUpdate);
      socketService.off('verificationUpdate', handleVerificationUpdate);
    };
  }, []);

  const fetchIncidents = async () => {
    // Implement API call to fetch incidents
    // For example:
    // const response = await fetch('/api/incidents');
    // const data = await response.json();
    // setIncidents(data);
  };

  const fetchClusters = async () => {
    // Implement API call to fetch clusters
    // For example:
    // const response = await fetch('/api/clusters');
    // const data = await response.json();
    // setClusters(data);
  };

  const handleIncidentUpdate = (updatedIncident: Incident) => {
    setIncidents(prevIncidents => 
      prevIncidents.map(incident => 
        incident._id === updatedIncident._id ? { ...incident, ...updatedIncident } : incident
      )
    );
  };

  const handleClusterUpdate = (clusterData: Cluster[]) => {
    setClusters(clusterData);
  };

  const handleVerificationUpdate = (verificationData: { incidentId: string; verificationScore: number; verificationStatus: string }) => {
    setIncidents(prevIncidents => 
      prevIncidents.map(incident => 
        incident._id === verificationData.incidentId ? { 
          ...incident, 
          verificationScore: verificationData.verificationScore,
          verificationStatus: verificationData.verificationStatus
        } : incident
      )
    );
  };

  if (locationLoading) {
    return <div>Loading map...</div>;
  }

  if (locationError) {
    return <div>Error loading map: {locationError}</div>;
  }

  if (latitude === null || longitude === null) {
    return <div>Unable to get your location. Please enable location services and try again.</div>;
  }

  return (
    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {incidents.map(incident => (
        <React.Fragment key={incident._id}>
          <Marker position={[incident.latitude, incident.longitude]}>
            <Popup>
              <h3>{incident.type}</h3>
              <p>Severity: {incident.severity}</p>
              <p>Verification: {incident.verificationStatus}</p>
            </Popup>
          </Marker>
          <Circle 
            center={[incident.latitude, incident.longitude]} 
            radius={incident.impactRadius * 1609.34} 
            pathOptions={{ color: getColorBySeverity(incident.severity) }}
          />
        </React.Fragment>
      ))}
      {clusters.map(cluster => (
        <Marker 
          key={cluster._id} 
          position={cluster.center} 
          icon={createClusterIcon(cluster.size)}
        >
          <Popup>
            <h3>Cluster</h3>
            <p>Incidents: {cluster.size}</p>
          </Popup>
        </Marker>
      ))}
      <Marker position={[latitude, longitude]}>
        <Popup>You are here</Popup>
      </Marker>
    </MapContainer>
  );
};

const getColorBySeverity = (severity: number): string => {
  if (severity > 7) return 'red';
  if (severity > 4) return 'orange';
  return 'yellow';
};

const createClusterIcon = (size: number): L.DivIcon => {
  return L.divIcon({
    html: `<div>${size}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40)
  });
};

export default Map;