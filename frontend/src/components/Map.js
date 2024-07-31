import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { socket } from '../services/socketService';

const Map = () => {
  const [incidents, setIncidents] = useState([]);
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    // Fetch initial incidents and clusters
    fetchIncidents();
    fetchClusters();

    // Set up socket listeners
    socket.on('incidentUpdate', handleIncidentUpdate);
    socket.on('clusterUpdate', handleClusterUpdate);
    socket.on('verificationUpdate', handleVerificationUpdate);

    return () => {
      socket.off('incidentUpdate', handleIncidentUpdate);
      socket.off('clusterUpdate', handleClusterUpdate);
      socket.off('verificationUpdate', handleVerificationUpdate);
    };
  }, []);

  const fetchIncidents = async () => {
    // Implement API call to fetch incidents
  };

  const fetchClusters = async () => {
    // Implement API call to fetch clusters
  };

  const handleIncidentUpdate = (updatedIncident) => {
    setIncidents(prevIncidents => 
      prevIncidents.map(incident => 
        incident._id === updatedIncident.incidentId ? { ...incident, ...updatedIncident } : incident
      )
    );
  };

  const handleClusterUpdate = (clusterData) => {
    setClusters(clusterData);
  };

  const handleVerificationUpdate = (verificationData) => {
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

  return (
    <MapContainer center={[0, 0]} zoom={3} style={{ height: '100vh', width: '100%' }}>
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
    </MapContainer>
  );
};

const getColorBySeverity = (severity) => {
  // Implement color logic based on severity
};

const createClusterIcon = (size) => {
  // Implement custom cluster icon based on size
};

export default Map;