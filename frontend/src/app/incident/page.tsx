'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getIncidentDetails, getIncidentUpdates } from '@/lib/disasterAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DisasterIcon from '@/components/ui/icons';
import { initializeSocket, getSocket } from '@/lib/socket';

interface Incident {
  _id: string;
  type: string;
  description: string;
  status: 'active' | 'resolved';
  severity: number;
  location: {
    coordinates: [number, number];
  };
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export default function IncidentPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [updates, setUpdates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = initializeSocket(id as string);

    socket.on('incidentUpdated', (updatedIncident: Incident) => {
      if (updatedIncident._id === id) {
        setIncident(updatedIncident);
      }
    });

    socket.on('newUpdate', (update: { incidentId: string, message: string }) => {
      if (update.incidentId === id) {
        setUpdates(prevUpdates => [...prevUpdates, update.message]);
      }
    });

    const fetchIncidentData = async () => {
      try {
        const incidentData = await getIncidentDetails(id as string);
        setIncident(incidentData);
        const updatesData = await getIncidentUpdates(id as string);
        setUpdates(updatesData);
      } catch (error) {
        console.error('Error fetching incident data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentData();

    return () => {
      socket.off('incidentUpdated');
      socket.off('newUpdate');
    };
  }, [id]);

  if (loading) {
    return <IncidentSkeleton />;
  }

  if (!incident) {
    return <div>Incident not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              <DisasterIcon type={incident.type} className="inline-block mr-2 w-6 h-6" />
              {incident.type} Incident
            </CardTitle>
            <Badge variant={incident.status === 'active' ? 'destructive' : 'secondary'}>
              {incident.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p>{incident.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <ul className="list-disc list-inside">
                <li>Severity: {incident.severity}/10</li>
                <li>Location: {incident.location.coordinates.join(', ')}</li>
                <li>Reported: {new Date(incident.createdAt).toLocaleString()}</li>
                <li>Last Updated: {new Date(incident.updatedAt).toLocaleString()}</li>
              </ul>
            </div>
          </div>
          {incident.mediaUrls.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {incident.mediaUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Incident media ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}
          {updates.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Updates</h3>
              {updates.map((update, index) => (
                <Card key={index} className="mb-2">
                  <CardContent className="py-2">
                    <p>{update}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="mr-2">Share</Button>
            <Button>Get Help</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IncidentSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
            <div>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}