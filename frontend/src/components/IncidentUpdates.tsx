import { useState, useEffect } from 'react';
import { getIncidentUpdates } from '@/lib/donationAPI';

interface IncidentUpdatesProps {
  incidentId: string;
}

export default function IncidentUpdates({ incidentId }: IncidentUpdatesProps) {
  const [updates, setUpdates] = useState<string>('');

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const data = await getIncidentUpdates(incidentId);
        setUpdates(data);
      } catch (error) {
        console.error('Failed to fetch incident updates', error);
      }
    };
    fetchUpdates();
  }, [incidentId]);

  return (
    <div>
      <h3>Incident Updates</h3>
      <p>{updates}</p>
    </div>
  );
}
