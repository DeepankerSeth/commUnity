'use client';

// pages/monitor
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Weather from "@/components/weather";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getNearbyIncidents } from "@/lib/disasterAPI";
import DisasterIcon from "@/components/ui/icons";
import { LocationSearch } from '@/components/LocationSearch';
import { FacetedSearch } from '@/components/FacetedSearch';
import { IncidentFilters, IncidentFilters as IncidentFiltersType } from '@/components/IncidentFilters';
import { initializeSocket, getSocket } from '@/lib/socket';
import { Dashboard } from '@/components/Dashboard';
import { ApiKeyManagement } from '@/components/ApiKeyManagement';

interface Incident {
  _id: string;
  type: string;
  status: 'active' | 'resolved';
  severity: number;
  description: string;
  location: {
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

const getSeverityColor = (severity: number) => {
  if (severity >= 8) return 'bg-red-500 text-red-50';
  if (severity >= 5) return 'bg-yellow-500 text-yellow-50';
  return 'bg-green-500 text-green-50';
};

export default function Monitor() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number }>({});
  const [filters, setFilters] = useState<IncidentFiltersType>({
    type: '',
    severity: null,
    status: '',
    sortBy: 'severity',
    sortOrder: 'desc',
  });

  const fetchIncidents = async (lat: number, lon: number) => {
    try {
      const data = await getNearbyIncidents(lat, lon);
      setIncidents(data);
    } catch (error) {
      console.error('Failed to fetch nearby incidents', error);
    }
  };

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('incidentUpdate', (updatedIncident: Incident) => {
      setIncidents(prevIncidents => 
        prevIncidents.map(incident => 
          incident._id === updatedIncident._id ? updatedIncident : incident
        )
      );
    });

    socket.on('newIncident', (newIncident: Incident) => {
      setIncidents(prevIncidents => [...prevIncidents, newIncident]);
    });

    return () => {
      socket.off('incidentUpdate');
      socket.off('newIncident');
    };
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchIncidents(location.latitude, location.longitude);
    }
  }, [location]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const position: GeolocationPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.error('Failed to fetch location', error);
      }
    };

    fetchLocation();
  }, []);

  const filteredIncidents = incidents
    .filter(incident => 
      (!filters.type || incident.type.toLowerCase().includes(filters.type.toLowerCase())) &&
      (!filters.severity || incident.severity === filters.severity) &&
      (!filters.status || incident.status === filters.status)
    )
    .sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      if (filters.sortBy === 'severity') {
        return (a.severity - b.severity) * order;
      } else if (filters.sortBy === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
      } else {
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * order;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Monitor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <LocationSearch onLocationSelect={(lat, lon) => setLocation({ latitude: lat, longitude: lon })} />
          <FacetedSearch />
          <IncidentFilters onFilterChange={setFilters} />
        </div>
        <ApiKeyManagement />
      </div>
      <Dashboard />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {filteredIncidents.map((incident) => (
          <Card key={incident._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <DisasterIcon type={incident.type} className="w-6 h-6 mr-2" />
                  {incident.type}
                </span>
                <Badge className={getSeverityColor(incident.severity)}>
                  Severity: {incident.severity}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{incident.description}</p>
              <p className="text-sm text-gray-500">
                Status: {incident.status}
              </p>
              <p className="text-sm text-gray-500">
                Created: {new Date(incident.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Updated: {new Date(incident.updatedAt).toLocaleString()}
              </p>
              <Link href={`/incident/${incident._id}`} passHref>
                <Button className="mt-2">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <Footer />
    </div>
  );
}