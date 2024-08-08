import { useState, useEffect } from 'react';
import { getIncidentDetails, getIncidentCluster, provideFeedback } from '../lib/disasterAPI';
import { useSocket } from '../context/SocketContext';

interface Incident {
  _id: string;
  type: string;
  description: string;
  severity: number;
  impactRadius: number;
  verificationStatus: string;
  verificationScore: number;
  timeline: Array<{
    update: string;
    severity: number;
    impactRadius: number;
    timestamp: string;
  }>;
  status: 'active' | 'resolved';
}

interface RelatedIncident {
  id: string;
  type: string;
  description: string;
}

export function useIncidentData(incidentId: string) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [relatedIncidents, setRelatedIncidents] = useState<RelatedIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [incidentData, clusterData] = await Promise.all([
          getIncidentDetails(incidentId),
          getIncidentCluster(incidentId)
        ]);
        setIncident(incidentData);
        setRelatedIncidents(clusterData.relatedIncidents);
        setError(null);
      } catch (error) {
        console.error('Error fetching incident data:', error);
        setError('Failed to fetch incident details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on('incidentUpdate', handleIncidentUpdate);
    socket.on('verificationUpdate', handleVerificationUpdate);
    socket.on('newUpdate', handleNewUpdate);

    return () => {
      socket.off('incidentUpdate', handleIncidentUpdate);
      socket.off('verificationUpdate', handleVerificationUpdate);
      socket.off('newUpdate', handleNewUpdate);
    };
  }, [incidentId, socket]);

  const handleIncidentUpdate = (updatedIncident: Incident) => {
    if (updatedIncident._id === incidentId) {
      setIncident(prevIncident => ({ ...prevIncident, ...updatedIncident }));
    }
  };

  const handleVerificationUpdate = (verificationData: { incidentId: string; verificationScore: number; verificationStatus: string }) => {
    if (verificationData.incidentId === incidentId) {
      setIncident(prevIncident => prevIncident ? { 
        ...prevIncident, 
        verificationScore: verificationData.verificationScore,
        verificationStatus: verificationData.verificationStatus
      } : null);
    }
  };

  const handleNewUpdate = (update: { incidentId: string; update: string; severity: number; impactRadius: number; timestamp: string }) => {
    if (update.incidentId === incidentId) {
      setIncident(prevIncident => prevIncident ? {
        ...prevIncident,
        timeline: [...prevIncident.timeline, update]
      } : null);
    }
  };

  const handleUserFeedback = async (accuracy: number, usefulness: number) => {
    try {
      await provideFeedback(incidentId, accuracy, usefulness);
      alert('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  return { 
    incident, 
    relatedIncidents, 
    loading,
    error,
    handleUserFeedback
  };
}