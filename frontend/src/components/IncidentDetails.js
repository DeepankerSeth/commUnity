import React, { useEffect, useState } from 'react';
import { socket } from '../services/socketService';

const IncidentDetails = ({ incidentId }) => {
  const [incident, setIncident] = useState(null);

  useEffect(() => {
    fetchIncidentDetails();

    socket.on('incidentUpdate', handleIncidentUpdate);
    socket.on('verificationUpdate', handleVerificationUpdate);

    return () => {
      socket.off('incidentUpdate', handleIncidentUpdate);
      socket.off('verificationUpdate', handleVerificationUpdate);
    };
  }, [incidentId]);

  const fetchIncidentDetails = async () => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch incident details');
      }
      const data = await response.json();
      setIncident(data);
    } catch (error) {
      console.error('Error fetching incident details:', error);
    }
  };

  const handleIncidentUpdate = (updatedIncident) => {
    if (updatedIncident.incidentId === incidentId) {
      setIncident(prevIncident => ({ ...prevIncident, ...updatedIncident }));
    }
  };

  const handleVerificationUpdate = (verificationData) => {
    if (verificationData.incidentId === incidentId) {
      setIncident(prevIncident => ({ 
        ...prevIncident, 
        verificationScore: verificationData.verificationScore,
        verificationStatus: verificationData.verificationStatus
      }));
    }
  };

  const handleUserFeedback = async (accuracy, usefulness) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accuracy, usefulness }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      // Optionally, you can update the incident state here if the API returns updated incident data
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (!incident) return <div>Loading...</div>;

  return (
    <div>
      <h2>{incident.type}</h2>
      <p>Description: {incident.description}</p>
      <p>Severity: {incident.severity}</p>
      <p>Impact Radius: {incident.impactRadius} miles</p>
      <p>Verification Status: {incident.verificationStatus}</p>
      <p>Verification Score: {incident.verificationScore.toFixed(2)}</p>
      <h3>Timeline</h3>
      <ul>
        {incident.timeline.map((entry, index) => (
          <li key={index}>
            <p>{entry.update}</p>
            <p>Severity: {entry.severity}</p>
            <p>Impact Radius: {entry.impactRadius} miles</p>
            <p>Time: {new Date(entry.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      <div>
        <h3>Provide Feedback</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const accuracy = e.target.accuracy.value;
          const usefulness = e.target.usefulness.value;
          handleUserFeedback(accuracy, usefulness);
        }}>
          <label>
            Accuracy (1-5):
            <input type="number" name="accuracy" min="1" max="5" required />
          </label>
          <label>
            Usefulness (1-5):
            <input type="number" name="usefulness" min="1" max="5" required />
          </label>
          <button type="submit">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
};

export default IncidentDetails;